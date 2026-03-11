-- Migration 006: Add type to sales/inventory_items, permissions to users
ALTER TABLE sales ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'RESINA' CHECK (type IN ('RESINA', 'FDM'));
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'RESINA' CHECK (type IN ('RESINA', 'FDM'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT[] NOT NULL DEFAULT '{}';
