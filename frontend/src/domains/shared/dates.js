export function todayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

export function getSlaVariant(dueDate, status) {
  if (!dueDate || status === 'DELIVERED' || status === 'CANCELLED') return 'sla-green';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const days = Math.floor((due - now) / 86400000);
  if (days <= 1) return 'sla-red';
  if (days <= 2) return 'sla-yellow';
  return 'sla-green';
}