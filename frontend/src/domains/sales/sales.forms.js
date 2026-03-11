import { todayIsoDate } from '../shared/dates.js';

export function createEmptySaleForm(defaultType = 'RESINA') {
  return {
    customer_id: null,
    customer_name_snapshot: '',
    sale_date: todayIsoDate(),
    due_date: '',
    status: 'BUDGET',
    payment_status: 'PENDING',
    payment_method: '',
    notes: '',
    subtotal: '',
    discount_total: '0',
    total: '',
    type: defaultType,
    items: [],
  };
}