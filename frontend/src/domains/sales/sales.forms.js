import { todayIsoDate } from '../shared/dates.js';

export function createEmptySaleItem() {
  return {
    id: null,
    description: '',
    qty: 1,
    unit_price: '',
    line_total: '',
    item_type: '',
    item_color: '',
    weight_grams: '',
    print_time_hours: '',
    is_done: false,
  };
}

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
    material_type: '',
    material_color: '',
    weight_grams: '',
    print_time_hours: '',
    items: [],
  };
}
