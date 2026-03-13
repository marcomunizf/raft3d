-- Migration 010: Add customer reference/snapshot to drawings

ALTER TABLE drawings
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id),
  ADD COLUMN IF NOT EXISTS customer_name_snapshot TEXT;
