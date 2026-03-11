export const DASHBOARD_SLA_LABEL = {
  'sla-red': 'Urgente',
  'sla-yellow': 'Atencao',
  'sla-green': 'OK',
};

export const DASHBOARD_STATUS_LABELS = {
  BUDGET: 'Orcamento',
  APPROVED: 'Aprovado',
  IN_PRODUCTION: 'Em producao',
  DONE: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export function getDashboardSlaVariant(dueDate, status) {
  if (!dueDate || status === 'DELIVERED' || status === 'CANCELLED') return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const days = Math.floor((due - now) / 86400000);
  if (days <= 1) return 'sla-red';
  if (days <= 2) return 'sla-yellow';
  return 'sla-green';
}