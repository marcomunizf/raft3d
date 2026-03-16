ALTER TABLE financial_entries
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS financial_entries_customer_id_idx ON financial_entries(customer_id);
