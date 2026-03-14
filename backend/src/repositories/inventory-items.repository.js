const { db } = require('../config/database');

async function list(filters) {
  const conditions = [];
  const values = [];
  let index = 1;

  if (filters.category) {
    conditions.push('i.category = $' + index);
    values.push(filters.category);
    index += 1;
  }

  if (filters.process || filters.type) {
    conditions.push('COALESCE(m.process, i.type) = $' + index);
    values.push(filters.process || filters.type);
    index += 1;
  }

  if (typeof filters.is_active !== 'undefined') {
    conditions.push('i.is_active = $' + index);
    values.push(filters.is_active === 'true' || filters.is_active === true);
    index += 1;
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const result = await db.query(
    `SELECT
      i.*,
      m.process,
      m.type AS material_type,
      m.color AS material_color,
      m.brand AS material_brand
     FROM inventory_items i
     LEFT JOIN materials m ON m.id = i.material_id
     ${where}
     ORDER BY i.created_at DESC`,
    values
  );

  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `SELECT
      i.*,
      m.process,
      m.type AS material_type,
      m.color AS material_color,
      m.brand AS material_brand
     FROM inventory_items i
     LEFT JOIN materials m ON m.id = i.material_id
     WHERE i.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create(data) {
  const materialName = data.material.process === 'FDM'
    ? `Filamento, ${data.material.type}, ${data.material.color}`
    : `Resina, ${data.material.type}, ${data.material.color}`;

  const result = await db.query(
    `INSERT INTO inventory_items
      (name, brand, category, type, unit, min_qty, current_qty, is_active, material_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      materialName,
      data.material.brand || null,
      data.category || 'RAW_MATERIAL',
      data.process || 'RESINA',
      data.unit || 'Unidade',
      data.min_qty,
      data.current_qty,
      typeof data.is_active === 'undefined' ? true : data.is_active,
      data.material_id,
    ]
  );

  return findById(result.rows[0].id);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let index = 1;

  const map = {
    name: data.name,
    brand: data.brand,
    category: data.category,
    type: data.process || data.type,
    unit: data.unit,
    min_qty: data.min_qty,
    current_qty: data.current_qty,
    is_active: data.is_active,
    material_id: data.material_id,
  };

  if (data.material) {
    map.name = data.material.process === 'FDM'
      ? `Filamento, ${data.material.type}, ${data.material.color}`
      : `Resina, ${data.material.type}, ${data.material.color}`;
    map.brand = data.material.brand;
    map.type = data.material.process;
  }

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

  const result = await db.query('UPDATE inventory_items SET ' + fields.join(', ') + ' WHERE id = $' + index + ' RETURNING id', values);
  return result.rows[0] ? findById(result.rows[0].id) : null;
}

async function deactivate(id) {
  const result = await db.query(
    'UPDATE inventory_items SET is_active = false WHERE id = $1 RETURNING *',
    [id]
  );

  return result.rows[0] || null;
}

async function getLog(id) {
  const result = await db.query(
    `SELECT a.id, a.action, a.data, a.created_at,
       COALESCE(u.email, u.name) AS username
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.entity = 'inventory_items' AND a.entity_id = $1
     ORDER BY a.created_at DESC`,
    [id]
  );
  return result.rows;
}

module.exports = {
  inventoryItemsRepository: { list, findById, create, update, deactivate, getLog },
};
