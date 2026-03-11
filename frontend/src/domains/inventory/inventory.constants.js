export const MEASURE_OPTIONS = ['Unidade', 'Kilograma', 'Litro'];

export function normalizeMeasure(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'kg' || normalized === 'kilograma') return 'Kilograma';
  if (normalized === 'l' || normalized === 'lt' || normalized === 'litro') return 'Litro';
  return 'Unidade';
}