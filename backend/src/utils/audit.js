const { db } = require('../config/database');

/**
 * Records an audit log entry.
 * @param {object} opts
 * @param {string} opts.userId   - UUID of the acting user
 * @param {string} opts.entity   - Table name (e.g. 'sales', 'customers')
 * @param {string} opts.entityId - UUID of the affected record
 * @param {string} opts.action   - 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL'
 * @param {object} [opts.data]   - Extra context (diff, payload, etc.)
 * @param {object} [client]      - Optional pg client (for use inside transactions)
 */
async function audit({ userId, entity, entityId, action, data = {} }, client) {
  const runner = client || db;
  try {
    await runner.query(
      'INSERT INTO audit_logs (user_id, entity, entity_id, action, data) VALUES ($1, $2, $3, $4, $5)',
      [userId, entity, entityId, action, JSON.stringify(data)]
    );
  } catch (err) {
    // Audit failures must never break business operations
    console.error('[audit] Failed to write audit log:', err.message);
  }
}

module.exports = { audit };
