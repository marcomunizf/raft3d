-- Migration 009: Add drawings table for technical designs

CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  designer_id UUID REFERENCES users(id),
  type TEXT NOT NULL DEFAULT 'RESINA' CHECK (type IN ('RESINA', 'FDM')),
  status TEXT NOT NULL DEFAULT 'ORCAMENTO' CHECK (status IN ('ORCAMENTO', 'DESENHANDO', 'PRONTO', 'ENVIAR_PARA_PRODUCAO')),
  start_date DATE,
  end_date DATE,
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
