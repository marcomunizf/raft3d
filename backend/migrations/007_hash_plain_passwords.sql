-- Backfill: convert any legacy plain-text password_hash values to bcrypt.
-- Safe to run multiple times.
UPDATE users
SET password_hash = crypt(password_hash, gen_salt('bf'))
WHERE password_hash NOT LIKE '$2a$%'
  AND password_hash NOT LIKE '$2b$%'
  AND password_hash NOT LIKE '$2y$%';
