const { db } = require('../config/database');

function normalizeText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

async function list(filters) {
  const conditions = ['is_active = true'];
  const values = [];
  let index = 1;

  if (filters.process) {
    conditions.push(`process = $${index++}`);
    values.push(filters.process);
  }

  if (filters.type) {
    conditions.push(`LOWER(type) = LOWER($${index++})`);
    values.push(filters.type);
  }

  if (filters.color) {
    conditions.push(`LOWER(color) = LOWER($${index++})`);
    values.push(filters.color);
  }

  if (filters.brand) {
    conditions.push(`LOWER(brand) = LOWER($${index++})`);
    values.push(filters.brand);
  }

  const result = await db.query(
    `SELECT id, process, type, color, brand, created_at
     FROM materials
     WHERE ${conditions.join(' AND ')}
     ORDER BY process ASC, brand ASC, type ASC, color ASC`,
    values
  );

  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    'SELECT id, process, type, color, brand, is_active, created_at FROM materials WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function create(data) {
  const result = await db.query(
    `INSERT INTO materials (process, type, color, brand)
     VALUES ($1, $2, $3, $4)
     RETURNING id, process, type, color, brand, created_at`,
    [
      data.process,
      normalizeText(data.type),
      normalizeText(data.color),
      normalizeText(data.brand),
    ]
  );

  return result.rows[0];
}

async function update(id, data) {
  const result = await db.query(
    `UPDATE materials
     SET process = $1, type = $2, color = $3, brand = $4
     WHERE id = $5 AND is_active = true
     RETURNING id, process, type, color, brand, created_at`,
    [
      data.process,
      normalizeText(data.type),
      normalizeText(data.color),
      normalizeText(data.brand),
      id,
    ]
  );

  return result.rows[0] || null;
}

async function deactivate(id) {
  const result = await db.query(
    `UPDATE materials
     SET is_active = false
     WHERE id = $1 AND is_active = true
     RETURNING id, process, type, color, brand, created_at`,
    [id]
  );

  return result.rows[0] || null;
}

async function hasActiveInventoryUsage(id) {
  const result = await db.query(
    'SELECT COUNT(*)::int AS count FROM inventory_items WHERE material_id = $1 AND is_active = true',
    [id]
  );

  return Number(result.rows[0]?.count || 0) > 0;
}

module.exports = {
  materialsRepository: {
    list,
    findById,
    create,
    update,
    deactivate,
    hasActiveInventoryUsage,
  },
};
