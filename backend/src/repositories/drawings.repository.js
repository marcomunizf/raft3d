const { db } = require('../config/database');

function normalizeMoney(value) {
  if (value === null || typeof value === 'undefined' || value === '') return null;
  const parsed = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

async function list(filters = {}) {
  const where = [];
  const values = [];
  let index = 1;

  if (filters.type) {
    where.push(`type = $${index++}`);
    values.push(filters.type);
  }

  if (filters.status) {
    where.push(`status = $${index++}`);
    values.push(filters.status);
  }

  if (filters.designer_id) {
    where.push(`designer_id = $${index++}`);
    values.push(filters.designer_id);
  }

  const query = `
    SELECT d.*,
      u.name AS designer_name
    FROM drawings d
    LEFT JOIN users u ON u.id = d.designer_id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY d.created_at ASC
  `;

  const result = await db.query(query, values);
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `SELECT d.*, u.name AS designer_name
     FROM drawings d
     LEFT JOIN users u ON u.id = d.designer_id
     WHERE d.id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create(data) {
  const result = await db.query(
    `INSERT INTO drawings (title, description, customer_id, customer_name_snapshot, designer_id, type, status, start_date, end_date, drawing_value, print_value, created_by_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      data.title,
      data.description || null,
      data.customer_id || null,
      data.customer_name_snapshot || null,
      data.designer_id || null,
      data.type || 'RESINA',
      data.status || 'ORCAMENTO',
      data.start_date || null,
      data.end_date || null,
      normalizeMoney(data.drawing_value),
      normalizeMoney(data.print_value),
      data.created_by_user_id,
    ]
  );
  return result.rows[0];
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let index = 1;
  const normalizedDrawingValue = Object.prototype.hasOwnProperty.call(data, 'drawing_value')
    ? normalizeMoney(data.drawing_value)
    : undefined;
  const normalizedPrintValue = Object.prototype.hasOwnProperty.call(data, 'print_value')
    ? normalizeMoney(data.print_value)
    : undefined;

  const map = {
    title: data.title,
    description: data.description,
    customer_id: data.customer_id,
    customer_name_snapshot: data.customer_name_snapshot,
    designer_id: data.designer_id,
    type: data.type,
    status: data.status,
    start_date: data.start_date,
    end_date: data.end_date,
    drawing_value: normalizedDrawingValue,
    print_value: normalizedPrintValue,
  };

  Object.keys(map).forEach((key) => {
    if (typeof map[key] !== 'undefined') {
      fields.push(`${key} = $${index}`);
      values.push(map[key]);
      index += 1;
    }
  });

  if (!fields.length) {
    return findById(id);
  }

  values.push(id);
  const result = await db.query(
    `UPDATE drawings SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query(
    'DELETE FROM drawings WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

async function listDesigners() {
  const result = await db.query(
    `SELECT id, name, email
     FROM users
     WHERE is_active = true
       AND permissions @> ARRAY['projetista']::TEXT[]
     ORDER BY name ASC, created_at ASC`
  );
  return result.rows;
}

module.exports = {
  drawingsRepository: {
    list,
    findById,
    create,
    update,
    remove,
    listDesigners,
  },
};
