const { db } = require('../config/database');

async function list(filters) {
  const conditions = [];
  const values = [];
  let index = 1;

  if (filters.start_date) {
    conditions.push('s.sale_date >= $' + index);
    values.push(filters.start_date);
    index += 1;
  }

  if (filters.end_date) {
    conditions.push('s.sale_date <= $' + index);
    values.push(filters.end_date);
    index += 1;
  }

  if (filters.status) {
    conditions.push('s.status = $' + index);
    values.push(filters.status);
    index += 1;
  }

  if (filters.payment_status) {
    conditions.push('s.payment_status = $' + index);
    values.push(filters.payment_status);
    index += 1;
  }

  if (filters.customer_id) {
    conditions.push('s.customer_id = $' + index);
    values.push(filters.customer_id);
    index += 1;
  }

  if (filters.type) {
    conditions.push('s.type = $' + index);
    values.push(filters.type);
    index += 1;
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const result = await db.query(
    `SELECT s.id, s.sale_date, s.due_date, s.customer_name_snapshot, s.status, s.payment_status, s.total,
       s.type, s.payment_method,
       s.material_type, s.material_color, s.weight_grams, s.print_time_hours,
       (SELECT description FROM sale_items WHERE sale_id = s.id ORDER BY id LIMIT 1) AS file_name
     FROM sales s ` + where + ` ORDER BY s.sale_date DESC`,
    values
  );

  return result.rows;
}

async function findById(id) {
  const result = await db.query('SELECT * FROM sales WHERE id = $1', [id]);

  if (!result.rows[0]) {
    return null;
  }

  const itemsResult = await db.query(
    'SELECT * FROM sale_items WHERE sale_id = $1 ORDER BY id',
    [id]
  );

  const paymentsResult = await db.query(
    'SELECT * FROM payments WHERE sale_id = $1 ORDER BY paid_at',
    [id]
  );

  const createdLogResult = await db.query(
    `SELECT
       a.created_at,
       COALESCE(u.email, u.name) AS username
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.entity = 'sales'
       AND a.entity_id = $1
       AND a.action = 'CREATE'
     ORDER BY a.created_at ASC
     LIMIT 1`,
    [id]
  );

  const editHistoryResult = await db.query(
    `SELECT
       a.id,
       a.created_at,
       COALESCE(u.email, u.name) AS username
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.entity = 'sales'
       AND a.entity_id = $1
       AND a.action = 'UPDATE'
     ORDER BY a.created_at ASC`,
    [id]
  );

  const statusHistoryResult = await db.query(
    `SELECT
       a.id,
       a.action,
       a.data,
       a.created_at,
       COALESCE(u.email, u.name) AS username
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.entity = 'sales'
       AND a.entity_id = $1
       AND (
         a.action = 'CREATE'
         OR (a.action = 'UPDATE' AND ((a.data ? 'status') OR (a.data ? 'payment_status')))
         OR a.action = 'CANCEL'
       )
     ORDER BY a.created_at ASC`,
    [id]
  );

  const status_history = [];
  let lastStatusValue = null;
  let lastPaymentValue = null;

  for (const row of statusHistoryResult.rows) {
    const username = row.username || 'usuario';
    const created_at = row.created_at;
    const data = row.data || {};

    if (row.action === 'CREATE') {
      const statusValue = data.status || 'BUDGET';
      if (statusValue !== lastStatusValue) {
        status_history.push({
          action: row.action,
          kind: 'STATUS',
          status: statusValue,
          username,
          created_at,
        });
        lastStatusValue = statusValue;
      }

      if (data.payment_status) {
        if (data.payment_status !== lastPaymentValue) {
          status_history.push({
            action: row.action,
            kind: 'PAYMENT',
            payment_status: data.payment_status,
            username,
            created_at,
          });
          lastPaymentValue = data.payment_status;
        }
      }
      continue;
    }

    if (row.action === 'CANCEL') {
      if ('CANCELLED' !== lastStatusValue) {
        status_history.push({
          action: row.action,
          kind: 'STATUS',
          status: 'CANCELLED',
          username,
          created_at,
        });
        lastStatusValue = 'CANCELLED';
      }
      continue;
    }

    if (typeof data.status !== 'undefined') {
      if (data.status !== lastStatusValue) {
        status_history.push({
          action: row.action,
          kind: 'STATUS',
          status: data.status,
          username,
          created_at,
        });
        lastStatusValue = data.status;
      }
    }

    if (typeof data.payment_status !== 'undefined') {
      if (data.payment_status !== lastPaymentValue) {
        status_history.push({
          action: row.action,
          kind: 'PAYMENT',
          payment_status: data.payment_status,
          username,
          created_at,
        });
        lastPaymentValue = data.payment_status;
      }
    }
  }

  return {
    ...result.rows[0],
    items: itemsResult.rows,
    payments: paymentsResult.rows,
    created_by_name: createdLogResult.rows[0]?.username || null,
    created_logged_at: createdLogResult.rows[0]?.created_at || null,
    edit_history: editHistoryResult.rows.map((row) => ({
      username: row.username || 'usuario',
      created_at: row.created_at,
    })),
    status_history,
  };
}

async function create(data) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const saleResult = await client.query(
      'INSERT INTO sales (customer_id, customer_name_snapshot, type, material_type, material_color, weight_grams, print_time_hours, status, sale_date, due_date, subtotal, discount_total, total, payment_status, payment_method, notes, created_by_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *',
      [
        data.customer_id || null,
        data.customer_name_snapshot || 'Venda generica',
        data.type || 'RESINA',
        data.material_type || null,
        data.material_color || null,
        typeof data.weight_grams === 'number' ? data.weight_grams : null,
        typeof data.print_time_hours === 'number' ? data.print_time_hours : null,
        data.status,
        data.sale_date,
        data.due_date || null,
        data.subtotal,
        data.discount_total || 0,
        data.total,
        data.payment_status,
        data.payment_method || null,
        data.notes || null,
        data.created_by_user_id,
      ]
    );

    const sale = saleResult.rows[0];
    const items = [];

    if (Array.isArray(data.items) && data.items.length) {
      for (const item of data.items) {
        const itemResult = await client.query(
          'INSERT INTO sale_items (sale_id, description, qty, unit_price, line_total) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [sale.id, item.description, item.qty, item.unit_price, item.line_total]
        );
        items.push(itemResult.rows[0]);
      }
    }

    await client.query('COMMIT');

    return { ...sale, items };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function update(id, data) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const fields = [];
    const values = [];
    let index = 1;

    const map = {
      customer_id: data.customer_id,
      customer_name_snapshot: data.customer_name_snapshot,
      type: data.type,
      material_type: data.material_type,
      material_color: data.material_color,
      weight_grams: data.weight_grams,
      print_time_hours: data.print_time_hours,
      status: data.status,
      sale_date: data.sale_date,
      due_date: data.due_date,
      subtotal: data.subtotal,
      discount_total: data.discount_total,
      total: data.total,
      payment_status: data.payment_status,
      payment_method: data.payment_method,
      notes: data.notes,
    };

    Object.keys(map).forEach((key) => {
      if (typeof map[key] !== 'undefined') {
        fields.push(key + ' = $' + index);
        values.push(map[key]);
        index += 1;
      }
    });

    let sale = null;

    if (fields.length) {
      values.push(id);
      const saleResult = await client.query(
        'UPDATE sales SET ' + fields.join(', ') + ' WHERE id = $' + index + ' RETURNING *',
        values
      );
      sale = saleResult.rows[0];
    } else {
      const saleResult = await client.query('SELECT * FROM sales WHERE id = $1', [id]);
      sale = saleResult.rows[0] || null;
    }

    if (Array.isArray(data.items)) {
      await client.query('DELETE FROM sale_items WHERE sale_id = $1', [id]);

      for (const item of data.items) {
        await client.query(
          'INSERT INTO sale_items (sale_id, description, qty, unit_price, line_total) VALUES ($1, $2, $3, $4, $5)',
          [id, item.description, item.qty, item.unit_price, item.line_total]
        );
      }
    }

    await client.query('COMMIT');

    if (!sale) {
      return null;
    }

    const itemsResult = await db.query(
      'SELECT * FROM sale_items WHERE sale_id = $1 ORDER BY id',
      [id]
    );

    return { ...sale, items: itemsResult.rows };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateStatus(id, status, paymentStatus, paymentMethod) {
  const fields = [];
  const values = [];
  let index = 1;

  if (typeof status !== 'undefined') {
    fields.push('status = $' + index);
    values.push(status);
    index += 1;

    if (status === 'DELIVERED') {
      fields.push('delivered_at = $' + index);
      values.push(new Date().toISOString());
      index += 1;
    }
  }

  if (typeof paymentStatus !== 'undefined') {
    fields.push('payment_status = $' + index);
    values.push(paymentStatus);
    index += 1;
  }

  if (typeof paymentMethod !== 'undefined') {
    fields.push('payment_method = $' + index);
    values.push(paymentMethod || null);
    index += 1;
  }

  if (!fields.length) {
    return findById(id);
  }

  values.push(id);

  const result = await db.query(
    'UPDATE sales SET ' + fields.join(', ') + ' WHERE id = $' + index + ' RETURNING *',
    values
  );

  return result.rows[0] || null;
}

async function cancel(id) {
  const result = await db.query(
    'UPDATE sales SET status = $1 WHERE id = $2 RETURNING *',
    ['CANCELLED', id]
  );

  return result.rows[0] || null;
}

async function listPayments(id) {
  const result = await db.query(
    'SELECT * FROM payments WHERE sale_id = $1 ORDER BY paid_at',
    [id]
  );

  return result.rows;
}

async function addPayment(saleId, data) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const paymentResult = await client.query(
      'INSERT INTO payments (sale_id, method, amount, paid_at, notes, created_by_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        saleId,
        data.method,
        data.amount,
        data.paid_at,
        data.notes || null,
        data.created_by_user_id,
      ]
    );

    const sumResult = await client.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE sale_id = $1',
      [saleId]
    );

    const saleResult = await client.query(
      'SELECT total FROM sales WHERE id = $1',
      [saleId]
    );

    const totalPaid = Number(sumResult.rows[0].total_paid);
    const saleTotal = saleResult.rows[0] ? Number(saleResult.rows[0].total) : 0;

    let paymentStatus = 'PENDING';
    if (totalPaid > 0 && totalPaid < saleTotal) {
      paymentStatus = 'PARTIAL';
    } else if (totalPaid >= saleTotal && saleTotal > 0) {
      paymentStatus = 'PAID';
    }

    await client.query(
      'UPDATE sales SET payment_status = $1 WHERE id = $2',
      [paymentStatus, saleId]
    );

    await client.query('COMMIT');

    return paymentResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  salesRepository: {
    list,
    findById,
    create,
    update,
    updateStatus,
    cancel,
    listPayments,
    addPayment,
  },
};
