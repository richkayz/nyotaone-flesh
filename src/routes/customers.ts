
import { Router, Request, Response } from 'express';
import { db } from '../database/db.js';
import { requireAuth } from './auth.js';

const router = Router();

type AuthenticatedRequest = Request & {
  authUser?: {
    id: string;
    accountId: string | null;
    role: string;
  };
};

// GET /api/customers
// Superadmin customer listing and search
router.get(
  '/',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.authUser?.role !== 'superadmin') {
      return res.status(403).json({
        message: 'Superadmin access required.',
      });
    }

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : '';

    let connection;

    try {
      connection = await db.getConnection();

      const customers = await connection.query(
        `
        SELECT
          a.id AS account_id,
          a.account_name,
          a.account_type,
          a.status AS account_status,
          a.created_at,
          u.id AS user_id,
          u.full_name,
          u.email,
          u.phone,
          u.role,
          u.is_active
        FROM accounts a
        LEFT JOIN users u ON u.account_id = a.id
        WHERE (
          ? = ''
          OR a.account_name LIKE ?
          OR u.full_name LIKE ?
          OR u.email LIKE ?
          OR u.phone LIKE ?
        )
        ORDER BY a.created_at DESC
        LIMIT 200
        `,
        [
          search,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
        ]
      );

      return res.json({
  success: true,
  customers: JSON.parse(
    JSON.stringify(customers, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  ),
  total: customers.length,
});
    } catch (error) {
      console.error('Customer listing failed:', error);

      return res.status(500).json({
        message: 'Could not load customers.',
      });
    } finally {
      connection?.release();
    }
  }
);

export default router;
