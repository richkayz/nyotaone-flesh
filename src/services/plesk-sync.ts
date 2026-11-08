
import { db } from '../database/db.js';
import { getPleskDomains } from './plesk.js';

export async function syncPleskDomains() {
  const domains = await getPleskDomains();

  if (!Array.isArray(domains)) {
    throw new Error('Unexpected Plesk domains response.');
  }

  let connection;

  try {
    connection = await db.getConnection();

    let synced = 0;

    for (const domain of domains) {
      if (!domain.name) continue;

      await connection.query(
        `
        INSERT INTO plesk_domains
          (plesk_domain_id, domain_name, status, hosting_type, sync_status, last_synced_at)
        VALUES (?, ?, ?, ?, 'synced', NOW())
        ON DUPLICATE KEY UPDATE
          plesk_domain_id = VALUES(plesk_domain_id),
          status = VALUES(status),
          hosting_type = VALUES(hosting_type),
          sync_status = 'synced',
          last_synced_at = NOW(),
          sync_error = NULL
        `,
        [
          domain.id ?? null,
          domain.name,
          domain.status ?? null,
          domain.hosting_type ?? null,
        ]
      );

      synced++;
    }

    return { total: domains.length, synced };
  } finally {
    connection?.release();
  }
}
