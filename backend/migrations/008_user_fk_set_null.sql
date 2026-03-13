-- Migration 008: Allow user deletion by making user FK columns nullable with ON DELETE SET NULL

-- sales.created_by_user_id
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_created_by_user_id_fkey;
ALTER TABLE sales ALTER COLUMN created_by_user_id DROP NOT NULL;
ALTER TABLE sales ADD CONSTRAINT sales_created_by_user_id_fkey
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- payments.created_by_user_id
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_created_by_user_id_fkey;
ALTER TABLE payments ALTER COLUMN created_by_user_id DROP NOT NULL;
ALTER TABLE payments ADD CONSTRAINT payments_created_by_user_id_fkey
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- inventory_movements.created_by_user_id
ALTER TABLE inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_created_by_user_id_fkey;
ALTER TABLE inventory_movements ALTER COLUMN created_by_user_id DROP NOT NULL;
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_created_by_user_id_fkey
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- audit_logs.user_id
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
