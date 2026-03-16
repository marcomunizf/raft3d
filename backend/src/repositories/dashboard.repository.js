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
    "SELECT COALESCE(SUM(total), 0) AS total_sales_month, COUNT(*) AS sales_count_month, COALESCE(AVG(total), 0) AS average_ticket," +
    " COALESCE(SUM(CASE WHEN status IN ('APPROVED','IN_PRODUCTION','DONE','DELIVERED') THEN total ELSE 0 END), 0) AS active_sales_month," +
    " COALESCE(AVG(CASE WHEN weight_grams IS NOT NULL AND weight_grams > 0 AND total IS NOT NULL THEN total / weight_grams END), 0) AS avg_value_per_weight_month," +
    " COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total ELSE 0 END), 0) AS paid_sales_month" +
    " FROM sales WHERE date_trunc('month', sale_date::timestamp) = date_trunc('month', CURRENT_DATE::timestamp)" + whereType,
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

  const receivedResult = await db.query(
    "SELECT COALESCE(SUM(p.amount), 0) AS received_month FROM payments p JOIN sales s ON s.id = p.sale_id WHERE date_trunc('month', p.paid_at::timestamp) = date_trunc('month', CURRENT_DATE::timestamp)" + whereType.replace(/type = /g, 's.type = '),
    values
  );

  const financeMonthResult = await db.query(
    "SELECT" +
    " COALESCE(SUM(CASE WHEN entry_type = 'INCOME' AND status != 'CANCELLED' THEN amount ELSE 0 END), 0) AS finance_revenue_month," +
    " COALESCE(SUM(CASE WHEN entry_type = 'EXPENSE' AND status != 'CANCELLED' THEN amount ELSE 0 END), 0) AS finance_expense_month," +
    " COALESCE(SUM(CASE WHEN entry_type = 'INCOME' AND status = 'PENDING' AND due_date IS NOT NULL AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0) AS finance_overdue_receivable" +
    " FROM financial_entries WHERE date_trunc('month', entry_date::timestamp) = date_trunc('month', CURRENT_DATE::timestamp)" +
    (whereType ? whereType.replace(/type = /g, 'process_type = ') : ''),
    values
  );

  const summary = summaryResult.rows[0];
  const finance = financeMonthResult.rows[0] || {};

  return {
    total_sales_month: Number(summary.total_sales_month),
    sales_count_month: Number(summary.sales_count_month),
    average_ticket: Number(summary.average_ticket),
    avg_value_per_weight_month: Number(summary.avg_value_per_weight_month),
    active_sales_month: Number(summary.active_sales_month),
    paid_sales_month: Number(summary.paid_sales_month),
    payments_pending: Number(pendingResult.rows[0].payments_pending),
    low_stock_count: Number(lowStockResult.rows[0].low_stock_count),
    in_production_count: Number(inProductionResult.rows[0].in_production_count),
    received_month: Number(receivedResult.rows[0].received_month),
    finance_revenue_month: Number(finance.finance_revenue_month || 0),
    finance_expense_month: Number(finance.finance_expense_month || 0),
    finance_net_month: Number(finance.finance_revenue_month || 0) - Number(finance.finance_expense_month || 0),
    finance_overdue_receivable: Number(finance.finance_overdue_receivable || 0),
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
      s.customer_notified,
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

async function getMonthlyHistory(filters) {
  const conditions = ["sale_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'"];
  const values = [];
  let index = 1;

  if (filters && filters.type) {
    conditions.push('type = $' + index);
    values.push(filters.type);
    index += 1;
  }

  const where = 'WHERE ' + conditions.join(' AND ');

  const result = await db.query(
    `SELECT
      TO_CHAR(date_trunc('month', sale_date::timestamp), 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN status IN ('APPROVED','IN_PRODUCTION','DONE','DELIVERED') THEN total ELSE 0 END), 0) AS active_sales,
      COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total ELSE 0 END), 0) AS paid_sales
    FROM sales
    ${where}
    GROUP BY date_trunc('month', sale_date::timestamp)
    ORDER BY 1 DESC`,
    values
  );

  return result.rows.map(r => ({
    month: r.month,
    active_sales: Number(r.active_sales),
    paid_sales: Number(r.paid_sales),
  }));
}

async function getWeightPriceByMaterial(filters) {
  const values = [];
  const processCondition = filters && filters.type ? 'AND process = $1' : '';
  const salesTypeCondition = filters && filters.type ? 'AND type = $1' : '';

  if (filters && filters.type) values.push(filters.type);

  const result = await db.query(
    `WITH material_types AS (
      SELECT DISTINCT
        process AS type,
        type AS material_type,
        LOWER(TRIM(type)) AS material_type_key
      FROM materials
      WHERE is_active = true
      ${processCondition}
    ),
    aggregated_sales AS (
      SELECT
        type,
        LOWER(TRIM(material_type)) AS material_type_key,
        AVG(total / NULLIF(weight_grams, 0)) FILTER (WHERE sale_date >= (CURRENT_DATE - INTERVAL '3 months')) AS avg_value_per_weight_3m,
        AVG(total / NULLIF(weight_grams, 0)) FILTER (WHERE sale_date >= (CURRENT_DATE - INTERVAL '1 year')) AS avg_value_per_weight_1y
      FROM sales
      WHERE material_type IS NOT NULL
        AND NULLIF(TRIM(material_type), '') IS NOT NULL
        AND weight_grams IS NOT NULL
        AND weight_grams > 0
        AND total IS NOT NULL
        AND sale_date >= (CURRENT_DATE - INTERVAL '1 year')
        ${salesTypeCondition}
      GROUP BY type, LOWER(TRIM(material_type))
    )
    SELECT
      m.type,
      m.material_type,
      COALESCE(a.avg_value_per_weight_3m, 0) AS avg_value_per_weight_3m,
      COALESCE(a.avg_value_per_weight_1y, 0) AS avg_value_per_weight_1y
    FROM material_types m
    LEFT JOIN aggregated_sales a
      ON a.type = m.type
      AND a.material_type_key = m.material_type_key
    ORDER BY m.material_type ASC`,
    values
  );

  return result.rows.map(r => ({
    type: r.type,
    material_type: r.material_type,
    avg_value_per_weight_3m: Number(r.avg_value_per_weight_3m || 0),
    avg_value_per_weight_1y: Number(r.avg_value_per_weight_1y || 0),
  }));
}

module.exports = {
  dashboardRepository: {
    getSummary,
    getSalesSeries,
    getKanban,
    getMonthlyHistory,
    getWeightPriceByMaterial,
  },
};
