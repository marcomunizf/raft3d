function parseIsoDateLocal(iso) {
  const value = String(iso || '').trim();
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(value);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

export function formatDate(iso) {
  if (!iso) return '-';
  return parseIsoDateLocal(iso).toLocaleDateString('pt-BR');
}

export function formatDateTime(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('pt-BR');
}
