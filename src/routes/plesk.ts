import { Router } from 'express';
import { db } from '../database/db.js';
import {
  getPleskCustomers,
  updatePleskCustomer,
} from '../services/plesk.js';
import { syncPleskDomains } from '../services/plesk-sync.js';
import {
  requireAuth as authenticateToken,
  requireRoles as requireRole,
} from './auth.js';

const router = Router();

// Retrieve domains from NyotaOne database
router.get(
  '/domains',
  authenticateToken,
  requireRole('superadmin'),
  async (_req, res) => {
    try {
      const domains = await db.query(`
        SELECT
          id,
          domain_name,
          status,
          hosting_type,
          account_id,
          sync_status,
          last_synced_at,
          sync_error
        FROM plesk_domains
        ORDER BY domain_name ASC
      `);

      res.json({ success: true, domains });
    } catch (error) {
      console.error('Failed to retrieve Plesk domains:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve domains.',
      });
    }
  }
);

// Synchronize domains from Plesk
router.post(
  '/sync-domains',
  authenticateToken,
  requireRole('superadmin'),
  async (_req, res) => {
    try {
      const result = await syncPleskDomains();

      res.json({
        success: true,
        message: 'Plesk domains synchronized successfully.',
        ...result,
      });
    } catch (error) {
      console.error('Plesk domain sync failed:', error);

      res.status(500).json({
        success: false,
        message: 'Plesk domain synchronization failed.',
      });
    }
  }
);

// Retrieve customers directly from Plesk
router.get(
  '/customers',
  authenticateToken,
  requireRole('superadmin'),
  async (_req, res) => {
    try {
      const customers = await getPleskCustomers();

      res.json({
        success: true,
        customers,
      });
    } catch (error) {
      console.error('Failed to retrieve Plesk customers:', error);

      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to retrieve customers from Plesk.',
      });
    }
  }
);

// Update customer in Plesk
router.put(
  '/customers/:id',
  authenticateToken,
  requireRole('superadmin'),
  async (req, res) => {
    try {
      const customerId = req.params.id;

      if (!customerId || !/^\d+$/.test(customerId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid Plesk customer ID.',
        });
        return;
      }

      const { name, company, email } = req.body;

      if (
        name === undefined &&
        company === undefined &&
        email === undefined
      ) {
        res.status(400).json({
          success: false,
          message: 'No editable customer fields provided.',
        });
        return;
      }

      const updates: Record<string, unknown> = {};

      if (name !== undefined) updates.name = name;
      if (company !== undefined) updates.company = company;
      if (email !== undefined) updates.email = email;

      const updatedCustomer = await updatePleskCustomer(
        customerId,
        updates
      );

      res.json({
        success: true,
        message: 'Customer updated in Plesk.',
        customer: updatedCustomer,
      });
    } catch (error) {
      console.error('Failed to update Plesk customer:', error);

      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update customer in Plesk.',
      });
    }
  }
);

export default router;