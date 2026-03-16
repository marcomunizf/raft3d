ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS customer_notified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS customer_notified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS sales_customer_notified_idx ON sales(customer_notified);
