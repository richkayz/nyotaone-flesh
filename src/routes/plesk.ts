
import { Router } from 'express';
import { db } from '../database/db.js';
import { syncPleskDomains } from '../services/plesk-sync.js';
import {
  requireAuth as authenticateToken,
  requireRoles as requireRole,
} from './auth.js';

const router = Router();

// Retrieve domains from the NyotaOne database
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

      res.json({
        success: true,
        domains,
      });
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

export default router;
