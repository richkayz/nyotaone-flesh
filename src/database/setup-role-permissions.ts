
import { db } from './db.js';

async function setupRolePermissions() {
  let connection;

  try {
    connection = await db.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        permission_key VARCHAR(100) PRIMARY KEY,
        permission_name VARCHAR(150) NOT NULL,
        module VARCHAR(100) NOT NULL,
        description VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role VARCHAR(30) NOT NULL,
        permission_key VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (role, permission_key),
        CONSTRAINT fk_role_permissions_permission
          FOREIGN KEY (permission_key)
          REFERENCES permissions(permission_key)
          ON DELETE CASCADE
      )
    `);

    const permissions = [
      ['users.view', 'View Users', 'Users'],
      ['users.create', 'Create Users', 'Users'],
      ['users.edit', 'Edit Users', 'Users'],
      ['users.deactivate', 'Activate or Deactivate Users', 'Users'],
      ['roles.view', 'View Roles', 'Roles'],
      ['roles.manage', 'Manage Role Permissions', 'Roles'],

      ['customers.view', 'View Customers', 'Customers'],
      ['customers.create', 'Create Customers', 'Customers'],
      ['customers.edit', 'Edit Customers', 'Customers'],

      ['domains.view', 'View Domains', 'Domains'],
      ['domains.manage', 'Manage Domains', 'Domains'],

      ['hosting.view', 'View Hosting Services', 'Hosting'],
      ['hosting.manage', 'Manage Hosting Services', 'Hosting'],

      ['email.view', 'View Business Email', 'Email'],
      ['email.manage', 'Manage Mailboxes', 'Email'],

      ['orders.view', 'View Orders', 'Orders'],
      ['orders.manage', 'Manage Orders', 'Orders'],

      ['invoices.view', 'View Invoices', 'Finance'],
      ['invoices.manage', 'Manage Invoices', 'Finance'],
      ['payments.view', 'View Payments', 'Finance'],
      ['payments.manage', 'Manage Payments', 'Finance'],
      ['reports.view', 'View Financial Reports', 'Finance'],

      ['products.view', 'View Products', 'Inventory'],
      ['products.manage', 'Manage Products', 'Inventory'],
      ['inventory.manage', 'Manage Stock', 'Inventory'],
      ['procurement.manage', 'Manage Procurement', 'Inventory'],

      ['support.view', 'View Support Tickets', 'Support'],
      ['support.manage', 'Manage Support Tickets', 'Support'],

      ['content.manage', 'Manage Website Content', 'Content'],
    ];

    for (const permission of permissions) {
      await connection.query(
        `INSERT IGNORE INTO permissions
          (permission_key, permission_name, module)
         VALUES (?, ?, ?)`,
        permission
      );
    }

    const rolePermissions: [string, string][] = [];

    const assignments: Record<string, string[]> = {
      admin: [
        'users.view',
        'users.create',
        'users.edit',
        'users.deactivate',
        'customers.view',
        'customers.create',
        'customers.edit',
        'domains.view',
        'domains.manage',
        'hosting.view',
        'hosting.manage',
        'email.view',
        'email.manage',
        'orders.view',
        'orders.manage',
        'invoices.view',
        'payments.view',
        'products.view',
        'products.manage',
        'inventory.manage',
        'support.view',
        'support.manage',
        'content.manage',
      ],

      finance: [
        'customers.view',
        'orders.view',
        'invoices.view',
        'invoices.manage',
        'payments.view',
        'payments.manage',
        'reports.view',
      ],

      sales: [
        'customers.view',
        'customers.create',
        'customers.edit',
        'orders.view',
        'orders.manage',
        'products.view',
        'domains.view',
        'hosting.view',
      ],

      inventory: [
        'products.view',
        'products.manage',
        'inventory.manage',
        'procurement.manage',
        'orders.view',
      ],

      support: [
        'customers.view',
        'support.view',
        'support.manage',
        'orders.view',
        'domains.view',
        'hosting.view',
        'email.view',
      ],

      editor: [
        'content.manage',
      ],

      customer: [
        'invoices.view',
        'payments.view',
        'orders.view',
        'support.view',
        'domains.view',
        'hosting.view',
        'email.view',
      ],
    };

    for (const [role, permissionKeys] of Object.entries(assignments)) {
      for (const permissionKey of permissionKeys) {
        rolePermissions.push([role, permissionKey]);
      }
    }

    for (const assignment of rolePermissions) {
      await connection.query(
        `INSERT IGNORE INTO role_permissions
          (role, permission_key)
         VALUES (?, ?)`,
        assignment
      );
    }

    console.log('Role and permission tables created successfully.');
    console.log(`${permissions.length} permissions registered.`);
    console.log(`${rolePermissions.length} role assignments registered.`);
    console.log('Superadmin retains full access through backend authorization.');
  } catch (error) {
    console.error('Role permission setup failed:', error);
    process.exitCode = 1;
  } finally {
    connection?.release();
    await db.end();
  }
}

setupRolePermissions();
