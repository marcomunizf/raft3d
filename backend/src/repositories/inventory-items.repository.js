const { db } = require('../config/database');

async function list(filters) {
  const conditions = [];
  const values = [];
  let index = 1;

  if (filters.category) {
    conditions.push('category = $' + index);
    values.push(filters.category);
    index += 1;
  }

  if (filters.type) {
    conditions.push('type = $' + index);
    values.push(filters.type);
    index += 1;
  }

  if (typeof filters.is_active !== 'undefined') {
    conditions.push('is_active = $' + index);
    values.push(filters.is_active === 'true' || filters.is_active === true);
    index += 1;
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const result = await db.query(
    'SELECT * FROM inventory_items ' + where + ' ORDER BY created_at DESC',
    values
  );

  return result.rows;
}

async function findById(id) {
  const result = await db.query('SELECT * FROM inventory_items WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function create(data) {
  const result = await db.query(
    'INSERT INTO inventory_items (name, brand, category, type, unit, min_qty, current_qty, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [
      data.name,
      data.brand || null,
      data.category,
      data.type || 'RESINA',
      data.unit,
      data.min_qty,
      data.current_qty,
      typeof data.is_active === 'undefined' ? true : data.is_active,
    ]
  );

  return result.rows[0];
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let index = 1;

  const map = {
    name: data.name,
    brand: data.brand,
    category: data.category,
    type: data.type,
    unit: data.unit,
    min_qty: data.min_qty,
    current_qty: data.current_qty,
    is_active: data.is_active,
  };

  Object.keys(map).forEach((key) => {
    if (typeof map[key] !== 'undefined') {
      fields.push(key + ' = $' + index);
      values.push(map[key]);
      index += 1;
    }
  });

  if (!fields.length) {
    return findById(id);
  }

  values.push(id);

  const result = await db.query(
    'UPDATE inventory_items SET ' + fields.join(', ') + ' WHERE id = $' + index + ' RETURNING *',
    values
  );

  return result.rows[0] || null;
}

async function deactivate(id) {
  const result = await db.query(
    'UPDATE inventory_items SET is_active = false WHERE id = $1 RETURNING *',
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  inventoryItemsRepository: { list, findById, create, update, deactivate },
};
