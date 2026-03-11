ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

INSERT INTO users (name, email, password_hash, role, is_active)
VALUES ('Luca', 'luca', '123', 'FUNCIONARIO', TRUE)
ON CONFLICT (email) DO NOTHING;
