/**
 * Badge/pill reutilizavel para exibir status, pagamento, tipo de processo e SLA.
 *
 * Uso:
 *   <StatusBadge variant="status" value={sale.status} labels={STATUS_LABELS} />
 *   <StatusBadge variant="payment" value={sale.payment_status} labels={PAYMENT_STATUS_LABELS} />
 *   <StatusBadge variant="type" value={sale.type} />
 *   <StatusBadge variant="sla" value={slaVariant} labels={SLA_LABELS} />
 */
export default function StatusBadge({ variant, value, labels = {} }) {
  if (!value) return <span className="muted">-</span>;

  const label = labels[value] || value;

  if (variant === 'type') {
    const isFdm = value === 'FDM';
    return <span className={`pill ${isFdm ? 'pill--process-fdm' : 'pill--process-resina'}`}>{isFdm ? 'FDM' : 'Resina'}</span>;
  }

  if (variant === 'sla') {
    const normalized = String(value).toLowerCase();
    const key = normalized.startsWith('sla-') ? normalized : `sla-${normalized}`;
    return <span className={`pill pill--${key}`}>{label}</span>;
  }

  if (variant === 'payment') {
    return <span className={`pill pill--pay pill--pay-${String(value).toLowerCase()}`}>{label}</span>;
  }

  // default: status
  return <span className="pill pill--status">{label}</span>;
}
