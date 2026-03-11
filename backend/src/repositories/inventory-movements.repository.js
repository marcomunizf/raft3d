const { db } = require('../config/database');

function normalizeNumber(value) {
  if (value === null || typeof value === 'undefined') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function list(filters) {
  const conditions = [];
  const values = [];
  let index = 1;

  if (filters.item_id) {
    conditions.push('item_id = $' + index);
    values.push(filters.item_id);
    index += 1;
  }

  if (filters.type) {
    conditions.push('type = $' + index);
    values.push(filters.type);
    index += 1;
  }

  if (filters.start_date) {
    conditions.push('movement_date >= $' + index);
    values.push(filters.start_date);
    index += 1;
  }

  if (filters.end_date) {
    conditions.push('movement_date <= $' + index);
    values.push(filters.end_date);
    index += 1;
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const result = await db.query(
    'SELECT * FROM inventory_movements ' + where + ' ORDER BY movement_date DESC',
    values
  );

  return result.rows;
}

async function updateItemQty(client, itemId, type, qty) {
  const itemResult = await client.query(
    'SELECT current_qty FROM inventory_items WHERE id = $1',
    [itemId]
  );

  const currentQty = itemResult.rows[0]
    ? normalizeNumber(itemResult.rows[0].current_qty)
    : 0;

  const qtyValue = normalizeNumber(qty);
  let nextQty = currentQty;

  if (type === 'IN') {
    nextQty = currentQty + qtyValue;
  } else if (type === 'OUT' || type === 'LOSS') {
    nextQty = currentQty - qtyValue;
  } else if (type === 'ADJUST') {
    nextQty = qtyValue;
  }

  const updateResult = await client.query(
    'UPDATE inventory_items SET current_qty = $1 WHERE id = $2 RETURNING *',
    [nextQty, itemId]
  );

  return updateResult.rows[0] || null;
}

async function create(data) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      'INSERT INTO inventory_movements (item_id, type, qty, movement_date, reason, sale_id, created_by_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        data.item_id,
        data.type,
        data.qty,
        data.movement_date,
        data.reason,
        data.sale_id || null,
        data.created_by_user_id,
      ]
    );

    const updatedItem = await updateItemQty(
      client,
      data.item_id,
      data.type,
      data.qty
    );

    await client.query('COMMIT');

    return { movement: result.rows[0], updated_item: updatedItem };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { inventoryMovementsRepository: { list, create } };
