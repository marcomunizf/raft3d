// Fonte única de verdade: getSlaVariant vem de dates.js
export { getSlaVariant as getDashboardSlaVariant } from '../shared/dates.js';

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
