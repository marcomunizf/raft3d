-- Migration 020: Add IMPRESSAO_TESTE status to drawings

ALTER TABLE drawings
  DROP CONSTRAINT IF EXISTS drawings_status_check;

ALTER TABLE drawings
  ADD CONSTRAINT drawings_status_check
  CHECK (status IN ('ORCAMENTO', 'DESENHANDO', 'PRONTO', 'IMPRESSAO_TESTE', 'ENVIAR_PARA_PRODUCAO'));
