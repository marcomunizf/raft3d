CREATE TABLE IF NOT EXISTS financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('INCOME', 'EXPENSE')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
  process_type TEXT NOT NULL DEFAULT 'GENERAL' CHECK (process_type IN ('GENERAL', 'RESINA', 'FDM', 'DRAWING')),
  payment_method TEXT,
  customer_name_snapshot TEXT,
  supplier_name_snapshot TEXT,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  notes TEXT,
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS financial_entries_entry_date_idx ON financial_entries(entry_date);
CREATE INDEX IF NOT EXISTS financial_entries_status_idx ON financial_entries(status);
CREATE INDEX IF NOT EXISTS financial_entries_entry_type_idx ON financial_entries(entry_type);
CREATE INDEX IF NOT EXISTS financial_entries_due_date_idx ON financial_entries(due_date);
CREATE INDEX IF NOT EXISTS financial_entries_process_type_idx ON financial_entries(process_type);
