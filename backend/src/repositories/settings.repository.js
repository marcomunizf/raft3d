const { db } = require('../config/database');

const DEFAULTS = {
  company_name: '',
  whatsapp_link: '',
  default_sale_status: 'BUDGET',
  payment_methods: [],
};

async function get() {
  const result = await db.query('SELECT key, value FROM settings');

  const row = {};
  for (const { key, value } of result.rows) {
    row[key] = value;
  }

  return {
    company_name: row.company_name ?? DEFAULTS.company_name,
    whatsapp_link: row.whatsapp_link ?? DEFAULTS.whatsapp_link,
    default_sale_status: row.default_sale_status ?? DEFAULTS.default_sale_status,
    payment_methods: row.payment_methods
      ? JSON.parse(row.payment_methods)
      : DEFAULTS.payment_methods,
  };
}

async function update(data) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const upsert = async (key, value) => {
      await client.query(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
      );
    };

    if (typeof data.company_name !== 'undefined') {
      await upsert('company_name', data.company_name);
    }
    if (typeof data.whatsapp_link !== 'undefined') {
      await upsert('whatsapp_link', data.whatsapp_link);
    }
    if (typeof data.default_sale_status !== 'undefined') {
      await upsert('default_sale_status', data.default_sale_status);
    }
    if (typeof data.payment_methods !== 'undefined') {
      await upsert('payment_methods', JSON.stringify(data.payment_methods));
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return get();
}

module.exports = { settingsRepository: { get, update } };
