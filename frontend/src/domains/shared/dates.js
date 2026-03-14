export function todayIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getSlaVariant(dueDate, status) {
  if (!dueDate || status === 'DELIVERED' || status === 'CANCELLED') return 'sla-green';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = parseIsoDateLocal(dueDate);
  due.setHours(0, 0, 0, 0);

  const days = Math.floor((due - now) / 86400000);
  if (days <= 1) return 'sla-red';
  if (days <= 2) return 'sla-yellow';
  return 'sla-green';
}

function parseIsoDateLocal(iso) {
  const value = String(iso || '').trim();
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(value);
}
