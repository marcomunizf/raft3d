const { db } = require('../config/database');

async function list(filters) {
  const conditions = [];
  const values = [];
  let index = 1;

  if (filters.q) {
    conditions.push(
      '(name ILIKE $' + index + ' OR phone ILIKE $' + index + ' OR email ILIKE $' + index + ' OR document ILIKE $' + index + ')'
    );
    values.push('%' + filters.q + '%');
    index += 1;
  }

  if (typeof filters.is_active !== 'undefined') {
    conditions.push('is_active = $' + index);
    values.push(filters.is_active === 'true' || filters.is_active === true);
    index += 1;
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(filters.limit) || 50));
  const offset = (page - 1) * limit;

  const countResult = await db.query(
    'SELECT COUNT(*) AS total FROM customers ' + where,
    values
  );

  const dataValues = [...values, limit, offset];
  const result = await db.query(
    'SELECT * FROM customers ' + where + ' ORDER BY created_at DESC LIMIT $' + index + ' OFFSET $' + (index + 1),
    dataValues
  );

  const total = Number(countResult.rows[0].total);

  return {
    data: result.rows,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

async function findById(id) {
  const result = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function create(data) {
  const result = await db.query(
    'INSERT INTO customers (type, name, document, phone, email, notes, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [
      data.type || 'PF',
      data.name,
      data.document || null,
      data.phone || '',
      data.email || null,
      data.notes || null,
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
    type: data.type,
    name: data.name,
    document: data.document,
    phone: data.phone,
    email: data.email,
    notes: data.notes,
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
    'UPDATE customers SET ' + fields.join(', ') + ' WHERE id = $' + index + ' RETURNING *',
    values
  );

  return result.rows[0] || null;
}

async function deactivate(id) {
  const result = await db.query(
    'UPDATE customers SET is_active = false WHERE id = $1 RETURNING *',
    [id]
  );

  return result.rows[0] || null;
}

async function listSales(customerId) {
  const result = await db.query(
    `SELECT s.id, s.sale_date, s.due_date, s.customer_name_snapshot, s.status, s.payment_status, s.total,
       s.payment_method,
       (SELECT description FROM sale_items WHERE sale_id = s.id ORDER BY id LIMIT 1) AS file_name
     FROM sales s WHERE s.customer_id = $1 ORDER BY s.sale_date DESC`,
    [customerId]
  );
  return result.rows;
}

module.exports = { customersRepository: { list, findById, create, update, deactivate, listSales } };
