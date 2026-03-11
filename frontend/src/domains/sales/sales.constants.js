export const STATUS_LABELS = {
  BUDGET: 'Orcamento',
  APPROVED: 'A Produzir',
  IN_PRODUCTION: 'Produzindo',
  DONE: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Pendente',
  PARTIAL: 'Parcial',
  PAID: 'Pago',
  REFUNDED: 'Estornado',
};

export const PAYMENT_METHOD_LABELS = {
  PIX: 'Pix',
  CARD: 'Cartao',
  CASH: 'Dinheiro',
  TRANSFER: 'Transferencia',
  BOLETO: 'Boleto',
};

export const SALE_STATUSES = ['BUDGET', 'APPROVED', 'IN_PRODUCTION', 'DONE', 'DELIVERED', 'CANCELLED'];
export const PAYMENT_STATUSES = ['PENDING', 'PARTIAL', 'PAID', 'REFUNDED'];
export const PAYMENT_METHODS = ['PIX', 'CARD', 'CASH', 'TRANSFER', 'BOLETO'];

export const KANBAN_COLUMNS = [
  { key: 'orcamento', label: 'Orcamento', statuses: ['BUDGET'] },
  { key: 'a-produzir', label: 'A Produzir', statuses: ['APPROVED'] },
  { key: 'produzindo', label: 'Produzindo', statuses: ['IN_PRODUCTION'] },
  { key: 'pronto', label: 'Pronto', statuses: ['DONE'] },
  { key: 'entregue', label: 'Entregue', statuses: ['DELIVERED'] },
];

export const STATUS_BY_COLUMN = {
  orcamento: 'BUDGET',
  'a-produzir': 'APPROVED',
  produzindo: 'IN_PRODUCTION',
  pronto: 'DONE',
  entregue: 'DELIVERED',
};