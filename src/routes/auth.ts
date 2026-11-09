import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { db } from '../database/db.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters.');
}

const TOKEN_EXPIRES_IN = '1h';

type AuthenticatedRequest = Request & {
  authUser?: {
    id: string;
    accountId: string | null;
    role: string;
  };
};

type TokenPayload = JwtPayload & {
  sub?: string;
  accountId?: string | null;
  role?: string;
};

type UserRole =
  | 'superadmin'
  | 'admin'
  | 'finance'
  | 'sales'
  | 'inventory'
  | 'support'
  | 'editor'
  | 'customer';

const STAFF_ROLES: UserRole[] = [
  'admin',
  'finance',
  'sales',
  'inventory',
  'support',
  'editor',
];

function isUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' &&
    ['superadmin', ...STAFF_ROLES, 'customer'].includes(role);
}

function normalizeIdentifier(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Verify the token and reload the user's current status and role from the
 * database. This avoids trusting outdated role data in a JWT.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authorization.slice(7);
  let payload: TokenPayload;

  try {
    payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired session. Please log in again.',
    });
  }

  if (!payload.sub) {
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }

  let connection;

  try {
    connection = await db.getConnection();

    const users = await connection.query(
      `SELECT
         u.id,
         u.account_id,
         u.role,
         u.is_active,
         a.status AS account_status
       FROM users u
       LEFT JOIN accounts a ON a.id = u.account_id
       WHERE u.id = ?
       LIMIT 1`,
      [payload.sub]
    );

    if (users.length === 0 || Number(users[0].is_active) !== 1) {
      return res.status(401).json({
        message: 'Your account is inactive or unavailable.',
      });
    }

    const user = users[0];

    if (user.account_id && user.account_status !== 'active') {
      return res.status(403).json({
        message: 'Your customer account is not active.',
      });
    }

    req.authUser = {
      id: String(user.id),
      accountId: user.account_id ? String(user.account_id) : null,
      role: String(user.role),
    };

    return next();
  } catch (error) {
    console.error('Authentication check failed:', error);
    return res.status(500).json({
      message: 'Could not verify your session.',
    });
  } finally {
    if (connection) connection.release();
  }
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.authUser) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.authUser.role as UserRole)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.',
      });
    }

    return next();
  };
}

/**
 * POST /login
 * Accepts either:
 *   { username, password }
 * or:
 *   { email, password }
 *
 * The email field also accepts a username for compatibility with the
 * existing frontend login form.
 */
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const identifier = normalizeIdentifier(req.body?.username ?? req.body?.email);
  const password = req.body?.password;

  if (!identifier || typeof password !== 'string' || !password) {
    return res.status(400).json({
      message: 'Username/email and password are required.',
    });
  }

  let connection;

  try {
    connection = await db.getConnection();

    const users = await connection.query(
      `SELECT
         u.id,
         u.full_name,
         u.username,
         u.email,
         u.phone,
         u.password_hash,
         u.role,
         u.is_active,
         u.account_id,
         a.status AS account_status
       FROM users u
       LEFT JOIN accounts a ON a.id = u.account_id
       WHERE LOWER(u.email) = ? OR LOWER(u.username) = ?
       ORDER BY CASE WHEN LOWER(u.email) = ? THEN 0 ELSE 1 END
       LIMIT 1`,
      [identifier, identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Invalid username/email or password.',
      });
    }

    const user = users[0];

    if (Number(user.is_active) !== 1) {
      return res.status(403).json({
        message: 'Your account is inactive. Please contact support.',
      });
    }

    if (user.account_id && user.account_status !== 'active') {
      return res.status(403).json({
        message: 'Your customer account is not active.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      String(user.password_hash)
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid username/email or password.',
      });
    }

    const accountId = user.account_id ? String(user.account_id) : null;

    const token = jwt.sign(
      {
        accountId,
        role: String(user.role),
      },
      JWT_SECRET,
      {
        subject: String(user.id),
        expiresIn: TOKEN_EXPIRES_IN,
      }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: String(user.id),
        fullName: String(user.full_name),
        username: user.username ? String(user.username) : null,
        email: String(user.email),
        phone: String(user.phone ?? ''),
        role: String(user.role),
        accountId,
      },
    });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({
      message: 'The server could not complete your login.',
    });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * GET /me
 * Returns the current user's latest role and account information.
 */
router.get(
  '/me',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    let connection;

    try {
      connection = await db.getConnection();

      const users = await connection.query(
        `SELECT
           id,
           full_name,
           username,
           email,
           phone,
           role,
           account_id,
           is_active
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [req.authUser!.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const user = users[0];

      return res.json({
        user: {
          id: String(user.id),
          fullName: String(user.full_name),
          username: user.username ? String(user.username) : null,
          email: String(user.email),
          phone: String(user.phone ?? ''),
          role: String(user.role),
          accountId: user.account_id ? String(user.account_id) : null,
          isActive: Number(user.is_active) === 1,
        },
      });
    } catch (error) {
      console.error('Loading current user failed:', error);
      return res.status(500).json({
        message: 'Could not load your user profile.',
      });
    } finally {
      if (connection) connection.release();
    }
  }
);

/**
 * POST /users
 * Create a user from the authenticated admin area.
 *
 * Superadmin and admin can create users. This endpoint deliberately does not
 * allow creation of another superadmin account.
 */
router.post(
  '/users',
  requireAuth,
  requireRoles('superadmin', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    const fullName =
      typeof req.body?.fullName === 'string'
        ? req.body.fullName.trim()
        : typeof req.body?.full_name === 'string'
          ? req.body.full_name.trim()
          : '';

    const username = normalizeIdentifier(req.body?.username);
    const email = normalizeIdentifier(req.body?.email);
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
    const password = req.body?.password;
    const requestedRole = req.body?.role;
    const accountIdInput = req.body?.accountId ?? req.body?.account_id;

    if (!fullName || !email || typeof password !== 'string' || !password) {
      return res.status(400).json({
        message: 'Full name, email, and password are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters.',
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (username && username.length < 3) {
      return res.status(400).json({
        message: 'Username must contain at least 3 characters.',
      });
    }

    if (!isUserRole(requestedRole) || requestedRole === 'superadmin') {
      return res.status(400).json({
        message: 'A valid non-superadmin role is required.',
      });
    }

    const role = requestedRole as UserRole;

    // Admins can create customers and staff users, but cannot grant admin-level
    // access. Only an existing superadmin can create an admin user.
    if (req.authUser!.role === 'admin' && !['customer', ...STAFF_ROLES.filter(r => r !== 'admin')].includes(role)) {
      return res.status(403).json({
        message: 'Administrators cannot assign this role.',
      });
    }

    let accountId: number | null = null;

    if (accountIdInput !== undefined && accountIdInput !== null && accountIdInput !== '') {
      accountId = Number(accountIdInput);

      if (!Number.isSafeInteger(accountId) || accountId <= 0) {
        return res.status(400).json({ message: 'Invalid account ID.' });
      }
    }

    if (role !== 'customer' && accountId !== null) {
      return res.status(400).json({
        message: 'Staff users must not be linked to a customer account.',
      });
    }

    let connection;

    try {
      connection = await db.getConnection();

      if (accountId !== null) {
        const accounts = await connection.query(
          'SELECT id FROM accounts WHERE id = ? LIMIT 1',
          [accountId]
        );

        if (accounts.length === 0) {
          return res.status(400).json({
            message: 'The selected customer account does not exist.',
          });
        }
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const userId = randomUUID();

      await connection.query(
        `INSERT INTO users
          (id, full_name, username, email, phone, password_hash, role, is_active, account_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          userId,
          fullName,
          username || null,
          email,
          phone,
          passwordHash,
          role,
          accountId,
        ]
      );

      return res.status(201).json({
        message: 'User created successfully.',
        user: {
          id: userId,
          fullName,
          username: username || null,
          email,
          phone,
          role,
          accountId: accountId === null ? null : String(accountId),
          isActive: true,
        },
      });
    } catch (error: any) {
      if (error?.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          message: 'That username or email is already in use.',
        });
      }

      console.error('User creation failed:', error);
      return res.status(500).json({
        message: 'Could not create the user.',
      });
    } finally {
      if (connection) connection.release();
    }
  }
);

export default router;
