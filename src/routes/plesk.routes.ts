import { Router } from 'express';
import { db } from '../database/db.js';
import {
  getPleskCustomers,
  updatePleskCustomer,
  getPleskMailboxes,
  createPleskMailbox,
} from '../services/plesk.js';
import { syncPleskDomains } from '../services/plesk-sync.js';
import {
  requireAuth as authenticateToken,
  requireRoles as requireRole,
} from './auth.js';

const router = Router();

router.get('/domains', authenticateToken, requireRole('superadmin'), async (_req, res) => {
  try {
    const domains = await db.query(`
      SELECT id, domain_name, status, hosting_type, account_id,
             sync_status, last_synced_at, sync_error
      FROM plesk_domains ORDER BY domain_name ASC
    `);
    res.json({ success: true, domains });
  } catch (error) {
    console.error('Failed to retrieve Plesk domains:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve domains.' });
  }
});

router.post('/sync-domains', authenticateToken, requireRole('superadmin'), async (_req, res) => {
  try {
    const result = await syncPleskDomains();
    res.json({ success: true, message: 'Plesk domains synchronized successfully.', ...result });
  } catch (error) {
    console.error('Plesk domain sync failed:', error);
    res.status(500).json({ success: false, message: 'Plesk domain synchronization failed.' });
  }
});

router.get('/customers', authenticateToken, requireRole('superadmin'), async (_req, res) => {
  try {
    res.json({ success: true, customers: await getPleskCustomers() });
  } catch (error) {
    console.error('Failed to retrieve Plesk customers:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve customers from Plesk.',
    });
  }
});

router.put('/customers/:id', authenticateToken, requireRole('superadmin'), async (req, res) => {
  try {
    const customerId = req.params.id;
    if (!customerId || !/^\\d+$/.test(customerId)) {
      res.status(400).json({ success: false, message: 'Invalid Plesk customer ID.' });
      return;
    }
    const { name, company, email, phone } = req.body;
    if (name === undefined && company === undefined && email === undefined && phone === undefined) {
      res.status(400).json({ success: false, message: 'No editable customer fields provided.' });
      return;
    }
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (company !== undefined) updates.company = company;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    const customer = await updatePleskCustomer(customerId, updates);
    res.json({ success: true, message: 'Customer updated in Plesk.', customer });
  } catch (error) {
    console.error('Failed to update customer in Plesk:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update customer in Plesk.',
    });
  }
});

router.get('/mailboxes', authenticateToken, requireRole('superadmin'), async (_req, res) => {
  try {
    const result = await getPleskMailboxes();
    res.json({ success: true, output: result.stdout });
  } catch (error) {
    console.error('Failed to retrieve Plesk mailboxes:', error);
    res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve mailboxes from Plesk.',
    });
  }
});

router.post('/mailboxes', authenticateToken, requireRole('superadmin'), async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const match = email.match(/^([a-z0-9.!#$%&'*+/=?^_`{|}~-]+)@([a-z0-9.-]+\\.[a-z]{2,})$/i);

    if (!match) {
      res.status(400).json({ success: false, message: 'Enter a valid email address.' });
      return;
    }
    if (password.length < 12) {
      res.status(400).json({ success: false, message: 'Mailbox password must be at least 12 characters.' });
      return;
    }

    const domain = match[2].toLowerCase();
    const knownDomains = await db.query(
      'SELECT id FROM plesk_domains WHERE LOWER(domain_name) = ? LIMIT 1',
      [domain]
    );
    if (!knownDomains.length) {
      res.status(400).json({
        success: false,
        message: 'This domain is not registered in NyotaOne yet. Synchronize Plesk domains first.',
      });
      return;
    }

    const result = await createPleskMailbox(email, password);
    res.status(201).json({
      success: true,
      message: result.stdout || 'Mailbox created successfully in Plesk.',
      email,
    });
  } catch (error) {
    console.error('Failed to create Plesk mailbox:', error);
    res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create mailbox in Plesk.',
    });
  }
});

export default router;
