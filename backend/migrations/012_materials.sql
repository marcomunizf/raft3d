CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process TEXT NOT NULL CHECK (process IN ('RESINA', 'FDM')),
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  brand TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS materials_unique_active_idx
  ON materials (process, lower(type), lower(color), lower(brand))
  WHERE is_active = TRUE;

ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES materials(id);

CREATE INDEX IF NOT EXISTS inventory_items_material_id_idx ON inventory_items(material_id);

INSERT INTO materials (process, type, color, brand)
VALUES
  ('RESINA', 'Standart', 'Cinza', '3DLAB'),
  ('RESINA', 'Semi-flexível', 'Bege', '3DFila'),
  ('RESINA', 'Alta performance', 'Transparente', 'Sunlu'),
  ('RESINA', 'Lavável', 'Preta', '3DLAB'),
  ('RESINA', 'Alta temperatura', 'Branca', '3DFila'),
  ('RESINA', 'Cristal', 'Transparente', 'Sunlu'),
  ('RESINA', 'Dental', 'Bege', '3DLAB'),
  ('FDM', 'PLA', 'Preto', '3DFila'),
  ('FDM', 'ABS', 'Branco', '3DLAB'),
  ('FDM', 'PETG', 'Cinza', 'Volt3D'),
  ('FDM', 'TPU', 'Vermelho', '3DFila'),
  ('FDM', 'ASA', 'Azul', '3DLAB'),
  ('FDM', 'Tritan', 'Amarelo', 'Volt3D'),
  ('FDM', 'PLA Flex', 'Verde', '3DFila'),
  ('FDM', 'Nylon', 'Transparente', '3DLAB'),
  ('FDM', 'PLA', 'Laranja', 'Volt3D'),
  ('FDM', 'PLA', 'Azul Claro', '3DFila'),
  ('FDM', 'PLA', 'Marrom', '3DLAB'),
  ('FDM', 'PLA', 'Verde limão', 'Volt3D'),
  ('FDM', 'PLA', 'Alumínio', '3DFila'),
  ('FDM', 'PLA', 'Bege', '3DLAB'),
  ('FDM', 'PLA', 'Roxo', 'Volt3D'),
  ('FDM', 'PLA', 'Rosa', '3DFila')
ON CONFLICT DO NOTHING;
