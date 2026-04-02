export function todayIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Retorna a variante SLA para um pedido de venda.
 * - null: status final (DELIVERED / CANCELLED) — sem indicador
 * - 'sla-red': urgente (1 dia ou menos)
 * - 'sla-yellow': atenção (2 dias)
 * - 'sla-green': dentro do prazo ou concluído/avisado
 */
export function getSlaVariant(dueDate, status, customerNotified = false) {
  if (status === 'DELIVERED' || status === 'CANCELLED') return null;
  if (status === 'DONE' && customerNotified) return 'sla-green';
  if (!dueDate) return 'sla-red';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = parseIsoDateLocal(dueDate);
  due.setHours(0, 0, 0, 0);

  const days = Math.floor((due - now) / 86400000);
  if (days <= 1) return 'sla-red';
  if (days <= 2) return 'sla-yellow';
  return 'sla-green';
}

/**
 * Retorna a variante SLA para um desenho técnico.
 * Thresholds maiores pois desenhos têm ciclos mais longos.
 * - 'sla-green': concluído ou sem prazo obrigatório
 * - 'sla-red': urgente (2 dias ou menos)
 * - 'sla-yellow': atenção (4 dias ou menos)
 */
export function getDrawingSlaVariant(endDate, status) {
  if (!endDate || status === 'ENVIAR_PARA_PRODUCAO') return 'sla-green';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = parseIsoDateLocal(endDate);
  deadline.setHours(0, 0, 0, 0);
  const days = Math.floor((deadline - now) / 86400000);
  if (days <= 2) return 'sla-red';
  if (days <= 4) return 'sla-yellow';
  return 'sla-green';
}

function parseIsoDateLocal(iso) {
  const value = String(iso || '').trim();
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(value);
}
