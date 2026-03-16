const { db } = require('../config/database');

function buildDateWindow(filters = {}) {
  if (filters.start_date && filters.end_date) {
    return { startDate: filters.start_date, endDate: filters.end_date };
  }

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  const startDate = filters.start_date || start.toISOString().slice(0, 10);
  const endDate = filters.end_date || end.toISOString().slice(0, 10);

  return { startDate, endDate };
}

async function getSummary(filters = {}) {
  const { startDate, endDate } = buildDateWindow(filters);
  const values = [startDate, endDate];
  let idx = 3;

  const processFilter = filters.process_type ? ` AND process_type = $${idx}` : '';
  if (filters.process_type) {
    values.push(filters.process_type);
    idx += 1;
  }

  const summaryResult = await db.query(
    `SELECT
      COALESCE(SUM(CASE WHEN entry_type = 'INCOME' AND status != 'CANCELLED' THEN amount ELSE 0 END), 0) AS revenue_total,
      COALESCE(SUM(CASE WHEN entry_type = 'EXPENSE' AND status != 'CANCELLED' THEN amount ELSE 0 END), 0) AS expense_total,
      COALESCE(SUM(CASE WHEN entry_type = 'INCOME' AND status = 'PAID' AND paid_date BETWEEN $1 AND $2 THEN amount ELSE 0 END), 0) AS cash_in,
      COALESCE(SUM(CASE WHEN entry_type = 'EXPENSE' AND status = 'PAID' AND paid_date BETWEEN $1 AND $2 THEN amount ELSE 0 END), 0) AS cash_out,
      COALESCE(SUM(CASE WHEN entry_type = 'INCOME' AND status = 'PENDING' THEN amount ELSE 0 END), 0) AS pending_receivable,
      COALESCE(SUM(CASE WHEN entry_type = 'INCOME' AND status = 'PENDING' AND due_date IS NOT NULL AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0) AS overdue_receivable,
      COALESCE(SUM(CASE WHEN entry_type = 'EXPENSE' AND status = 'PENDING' THEN amount ELSE 0 END), 0) AS pending_payable,
      COALESCE(SUM(CASE WHEN entry_type = 'EXPENSE' AND status = 'PENDING' AND due_date IS NOT NULL AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0) AS overdue_payable,
      COUNT(*) FILTER (WHERE entry_type = 'INCOME' AND status != 'CANCELLED')::int AS income_count,
      COUNT(*) FILTER (WHERE entry_type = 'EXPENSE' AND status != 'CANCELLED')::int AS expense_count
    FROM financial_entries
    WHERE entry_date BETWEEN $1 AND $2${processFilter}`,
    values
  );

  const categoriesResult = await db.query(
    `SELECT
      category,
      COALESCE(SUM(amount), 0) AS total
    FROM financial_entries
    WHERE entry_type = 'EXPENSE'
      AND status != 'CANCELLED'
      AND entry_date BETWEEN $1 AND $2${processFilter}
    GROUP BY category
    ORDER BY total DESC
    LIMIT 5`,
    values
  );

  const summary = summaryResult.rows[0] || {};
  const revenue = Number(summary.revenue_total || 0);
  const expense = Number(summary.expense_total || 0);
  const net = revenue - expense;

  return {
    period_start: startDate,
    period_end: endDate,
    revenue_total: revenue,
    expense_total: expense,
    net_profit: net,
    margin_percent: revenue > 0 ? (net / revenue) * 100 : 0,
    cash_in: Number(summary.cash_in || 0),
    cash_out: Number(summary.cash_out || 0),
    cash_balance: Number(summary.cash_in || 0) - Number(summary.cash_out || 0),
    pending_receivable: Number(summary.pending_receivable || 0),
    overdue_receivable: Number(summary.overdue_receivable || 0),
    pending_payable: Number(summary.pending_payable || 0),
    overdue_payable: Number(summary.overdue_payable || 0),
    income_count: Number(summary.income_count || 0),
    expense_count: Number(summary.expense_count || 0),
    top_expense_categories: categoriesResult.rows.map((row) => ({
      category: row.category,
      total: Number(row.total || 0),
    })),
  };
}

async function listEntries(filters = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (filters.start_date) {
    conditions.push(`entry_date >= $${idx}`);
    values.push(filters.start_date);
    idx += 1;
  }

  if (filters.end_date) {
    conditions.push(`entry_date <= $${idx}`);
    values.push(filters.end_date);
    idx += 1;
  }

  if (filters.entry_type) {
    conditions.push(`entry_type = $${idx}`);
    values.push(filters.entry_type);
    idx += 1;
  }

  if (filters.status) {
    conditions.push(`status = $${idx}`);
    values.push(filters.status);
    idx += 1;
  }

  if (filters.process_type) {
    conditions.push(`process_type = $${idx}`);
    values.push(filters.process_type);
    idx += 1;
  }

  if (filters.q) {
    conditions.push(`(
      description ILIKE $${idx}
      OR category ILIKE $${idx}
      OR COALESCE(customer_name_snapshot, '') ILIKE $${idx}
      OR COALESCE(supplier_name_snapshot, '') ILIKE $${idx}
    )`);
    values.push(`%${filters.q}%`);
    idx += 1;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT *
     FROM financial_entries
     ${where}
     ORDER BY COALESCE(due_date, entry_date) DESC, created_at DESC`,
    values
  );

  return result.rows;
}

async function findEntryById(id) {
  const result = await db.query('SELECT * FROM financial_entries WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function createEntry(data) {
  const paidDate = data.status === 'PAID' ? (data.paid_date || data.entry_date) : (data.paid_date || null);

  const result = await db.query(
    `INSERT INTO financial_entries (
      entry_type,
      category,
      description,
      amount,
      entry_date,
      due_date,
      paid_date,
      status,
      process_type,
      payment_method,
      customer_id,
      customer_name_snapshot,
      supplier_name_snapshot,
      sale_id,
      notes,
      created_by_user_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16
    )
    RETURNING *`,
    [
      data.entry_type,
      data.category,
      data.description,
      data.amount,
      data.entry_date,
      data.due_date || null,
      paidDate,
      data.status,
      data.process_type || 'GENERAL',
      data.payment_method || null,
      data.customer_id || null,
      data.customer_name_snapshot || null,
      data.supplier_name_snapshot || null,
      data.sale_id || null,
      data.notes || null,
      data.created_by_user_id,
    ]
  );

  return result.rows[0] || null;
}

async function updateEntry(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  const map = {
    entry_type: data.entry_type,
    category: data.category,
    description: data.description,
    amount: data.amount,
    entry_date: data.entry_date,
    due_date: data.due_date,
    paid_date: data.paid_date,
    status: data.status,
    process_type: data.process_type,
    payment_method: data.payment_method,
    customer_id: data.customer_id,
    customer_name_snapshot: data.customer_name_snapshot,
    supplier_name_snapshot: data.supplier_name_snapshot,
    sale_id: data.sale_id,
    notes: data.notes,
  };

  Object.keys(map).forEach((key) => {
    if (typeof map[key] !== 'undefined') {
      fields.push(`${key} = $${idx}`);
      values.push(map[key]);
      idx += 1;
    }
  });

  if (typeof data.status !== 'undefined' && data.status === 'PAID' && typeof data.paid_date === 'undefined') {
    fields.push(`paid_date = COALESCE(paid_date, CURRENT_DATE)`);
  }

  if (!fields.length) {
    return findEntryById(id);
  }

  fields.push('updated_at = NOW()');
  values.push(id);

  const result = await db.query(
    `UPDATE financial_entries
     SET ${fields.join(', ')}
     WHERE id = $${idx}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

async function updateEntryStatus(id, status, paidDate) {
  const result = await db.query(
    `UPDATE financial_entries
     SET status = $2,
         paid_date = CASE
           WHEN $2 = 'PAID' THEN COALESCE($3, paid_date, CURRENT_DATE)
           WHEN $2 = 'PENDING' THEN NULL
           ELSE paid_date
         END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status, paidDate || null]
  );

  return result.rows[0] || null;
}

module.exports = {
  financeRepository: {
    getSummary,
    listEntries,
    findEntryById,
    createEntry,
    updateEntry,
    updateEntryStatus,
  },
};
