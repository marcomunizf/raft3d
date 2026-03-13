-- Migration 011: Add drawing and print values to drawings

ALTER TABLE drawings
  ADD COLUMN IF NOT EXISTS drawing_value NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS print_value NUMERIC(12,2);
