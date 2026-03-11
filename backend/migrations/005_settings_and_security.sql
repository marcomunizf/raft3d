-- Settings table for persistent app configuration
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
  ('company_name', ''),
  ('whatsapp_link', ''),
  ('default_sale_status', 'BUDGET'),
  ('payment_methods', '["PIX","CARD","CASH","TRANSFER","BOLETO"]')
ON CONFLICT (key) DO NOTHING;

-- NOTE: After running this migration, run:
--   npm run hash-passwords
-- to convert existing plain-text passwords to bcrypt hashes.
-- Until then, login will not work for existing users.
