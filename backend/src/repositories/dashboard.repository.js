const { db } = require('../config/database');

async function getSummary(filters) {
  const conditions = [];
  const values = [];
  let index = 1;

  if (filters && filters.type) {
    conditions.push('type = $' + index);
    values.push(filters.type);
    index += 1;
  }

  const whereType = conditions.length ? ' AND ' + conditions.join(' AND ') : '';

  const summaryResult = await db.query(
    "SELECT COALESCE(SUM(total), 0) AS total_sales_month, COUNT(*) AS sales_count_month, COALESCE(AVG(total), 0) AS average_ticket FROM sales WHERE date_trunc('month', sale_date::timestamp) = date_trunc('month', CURRENT_DATE::timestamp)" + whereType,
    values
  );

  const pendingResult = await db.query(
    "SELECT COUNT(*) AS payments_pending FROM sales WHERE payment_status IN ('PENDING', 'PARTIAL') AND status NOT IN ('DELIVERED', 'CANCELLED')" + whereType,
    values
  );

  const lowStockResult = await db.query(
    'SELECT COUNT(*) AS low_stock_count FROM inventory_items WHERE is_active = true AND current_qty <= min_qty'
  );

  const inProductionResult = await db.query(
    "SELECT COUNT(*) AS in_production_count FROM sales WHERE status = 'IN_PRODUCTION'" + (whereType ? ' AND ' + whereType.replace(/^ AND /, '') : ''),
    values
  );

  const summary = summaryResult.rows[0];

  return {
    total_sales_month: Number(summary.total_sales_month),
    sales_count_month: Number(summary.sales_count_month),
    average_ticket: Number(summary.average_ticket),
    payments_pending: Number(pendingResult.rows[0].payments_pending),
    low_stock_count: Number(lowStockResult.rows[0].low_stock_count),
    in_production_count: Number(inProductionResult.rows[0].in_production_count),
  };
}

async function getSalesSeries(filters) {
  const conditions = [];
  const values = [];
  let index = 1;

  if (filters.start_date) {
    conditions.push('sale_date >= $' + index);
    values.push(filters.start_date);
    index += 1;
  }

  if (filters.end_date) {
    conditions.push('sale_date <= $' + index);
    values.push(filters.end_date);
    index += 1;
  }

  if (filters.type) {
    conditions.push('type = $' + index);
    values.push(filters.type);
    index += 1;
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const period = filters.period === 'week' ? 'week' : 'day';
  const label =
    period === 'week'
      ? "date_trunc('week', sale_date::timestamp)::date"
      : 'sale_date';

  const result = await db.query(
    'SELECT ' + label + ' AS label, COALESCE(SUM(total), 0) AS total FROM sales ' + where + ' GROUP BY label ORDER BY label',
    values
  );

  return result.rows;
}

async function getKanban(filters) {
  const conditions = [
    "s.status IN ('BUDGET', 'APPROVED', 'IN_PRODUCTION', 'DONE', 'DELIVERED')",
    "(s.status != 'DELIVERED' OR s.delivered_at IS NULL OR s.delivered_at > NOW() - INTERVAL '7 days')",
  ];
  const values = [];
  let index = 1;

  if (filters && filters.type) {
    conditions.push('s.type = $' + index);
    values.push(filters.type);
    index += 1;
  }

  const result = await db.query(
    `SELECT
      s.id,
      s.customer_name_snapshot,
      s.total,
      s.due_date,
      s.delivered_at,
      s.status,
      s.type,
      si.description AS file_name
    FROM sales s
    LEFT JOIN LATERAL (
      SELECT description FROM sale_items WHERE sale_id = s.id ORDER BY id LIMIT 1
    ) si ON true
    WHERE ` + conditions.join(' AND ') + `
    ORDER BY s.due_date ASC NULLS LAST, s.created_at ASC`,
    values
  );

  return result.rows;
}

module.exports = { dashboardRepository: { getSummary, getSalesSeries, getKanban } };
