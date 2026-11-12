
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

// =====================================================
// DOMAINS
// =====================================================

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

// =====================================================
// PLESK CUSTOMERS
// =====================================================

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

      res.status(502).json({
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

      const { name, company, email, phone } = req.body;

      if (
        name === undefined &&
        company === undefined &&
        email === undefined &&
        phone === undefined
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
      if (phone !== undefined) updates.phone = phone;

      const updatedCustomer = await updatePleskCustomer(
        customerId,
        updates
      );

      console.log('Plesk customer updated:', customerId);

      res.json({
        success: true,
        message: 'Customer updated in Plesk.',
        customer: updatedCustomer,
      });
    } catch (error) {
      console.error('Failed to update Plesk customer:', error);

      res.status(502).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update customer in Plesk.',
      });
    }
  }
);

// =====================================================
// BUSINESS EMAIL / MAILBOXES
// =====================================================

// Retrieve mailboxes directly from Plesk
router.get(
  '/mailboxes',
  authenticateToken,
  requireRole('superadmin'),
  async (_req, res) => {
    try {
      const mailboxes = await getPleskMailboxes();

      res.json({
        success: true,
        mailboxes,
      });
    } catch (error) {
      console.error('Failed to retrieve Plesk mailboxes:', error);

      res.status(502).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to retrieve mailboxes from Plesk.',
      });
    }
  }
);

// Create a mailbox directly in Plesk
router.post(
  '/mailboxes',
  authenticateToken,
  requireRole('superadmin'),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      if (
        typeof email !== 'string' ||
        typeof password !== 'string'
      ) {
        res.status(400).json({
          success: false,
          message: 'Email address and password are required.',
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        res.status(400).json({
          success: false,
          message: 'Enter a valid email address.',
        });
        return;
      }

      if (password.length < 12) {
        res.status(400).json({
          success: false,
          message: 'Password must contain at least 12 characters.',
        });
        return;
      }

      const domain = normalizedEmail.split('@')[1];

      // Only allow mailbox creation for domains
      // already synchronized into NyotaOne.
      const existingDomain = await db.query(
        `SELECT id
         FROM plesk_domains
         WHERE LOWER(domain_name) = ?
         LIMIT 1`,
        [domain]
      );

      if (!existingDomain || existingDomain.length === 0) {
        res.status(400).json({
          success: false,
          message:
            'This domain is not registered in NyotaOne. Synchronize the domain first.',
        });
        return;
      }

      await createPleskMailbox(normalizedEmail, password);

      res.status(201).json({
        success: true,
        message: 'Mailbox created successfully in Plesk.',
        email: normalizedEmail,
      });
    } catch (error) {
      console.error('Failed to create Plesk mailbox:', error);

      res.status(502).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create mailbox in Plesk.',
      });
    }
  }
);

export default router;
