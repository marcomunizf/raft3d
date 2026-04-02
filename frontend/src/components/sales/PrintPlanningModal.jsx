import { useEffect, useState } from 'react';
import Modal from '../Modal.jsx';
import { fetchSales } from '../../domains/sales/sales.service.js';
import { formatCurrency } from '../../domains/shared/formatters.js';

const NIGHT_THRESHOLD = 8;   // >= 8h → impressão noturna
const DAY_THRESHOLD = 5;     // < 5h  → pode agrupar na mesma mesa

function groupDaySales(daySales) {
  const groups = {};
  for (const sale of daySales) {
    const matKey = [
      (sale.material_type || '').trim().toLowerCase(),
      (sale.material_color || '').trim().toLowerCase(),
    ].join(' | ');
    const label = [sale.material_type, sale.material_color].filter(Boolean).join(' / ') || 'Sem material definido';
    if (!groups[matKey]) {
      groups[matKey] = { label, sales: [], totalHours: 0 };
    }
    groups[matKey].sales.push(sale);
    groups[matKey].totalHours += Number(sale.print_time_hours || 0);
  }
  return Object.values(groups);
}

function Section({ title, color, icon, children }) {
  return (
    <div className="plan-section" style={{ borderLeft: `4px solid ${color}`, paddingLeft: 12, marginBottom: 20 }}>
      <h4 style={{ color, marginBottom: 8 }}>{icon} {title}</h4>
      {children}
    </div>
  );
}

function SaleRow({ sale }) {
  return (
    <div className="plan-sale-row">
      <span className="plan-sale-client">{sale.customer_name_snapshot}</span>
      <span className="plan-sale-time">
        {sale.print_time_hours != null ? `${Number(sale.print_time_hours).toFixed(1)}h` : '—'}
      </span>
      <span className="plan-sale-value">{formatCurrency(sale.total)}</span>
    </div>
  );
}

/**
 * Modal de planejamento de impressão.
 *
 * Props:
 *   onClose  - fecha o modal
 *   type     - 'RESINA' | 'FDM' (filtra as vendas por processo)
 */
export default function PrintPlanningModal({ onClose, type }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchSales({ status: 'APPROVED', type: type || undefined, limit: 200 })
      .then((data) => {
        setSales(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Erro ao carregar pedidos.'))
      .finally(() => setLoading(false));
  }, [type]);

  const nightSales = sales.filter(s => Number(s.print_time_hours) >= NIGHT_THRESHOLD);
  const daySales   = sales.filter(s => s.print_time_hours != null && Number(s.print_time_hours) > 0 && Number(s.print_time_hours) < DAY_THRESHOLD);
  const midSales   = sales.filter(s => s.print_time_hours != null && Number(s.print_time_hours) >= DAY_THRESHOLD && Number(s.print_time_hours) < NIGHT_THRESHOLD);
  const unknownSales = sales.filter(s => s.print_time_hours == null || Number(s.print_time_hours) === 0);

  const dayGroups = groupDaySales(daySales);

  return (
    <Modal title="Planejamento de Impressão" onClose={onClose}>
      <div className="modal-section plan-modal-body">
        {loading && <p className="muted">Carregando pedidos A Produzir...</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && sales.length === 0 && (
          <p className="muted">Nenhum pedido em "A Produzir" no momento.</p>
        )}

        {!loading && !error && sales.length > 0 && (
          <>
            <p className="plan-summary muted" style={{ marginBottom: 16 }}>
              {sales.length} pedido{sales.length !== 1 ? 's' : ''} aguardando produção
              {type ? ` — ${type === 'FDM' ? 'FDM' : 'Resina'}` : ''}
            </p>

            {/* ─── IMPRESSÃO NOTURNA ─────────────────────────── */}
            {nightSales.length > 0 && (
              <Section title={`Impressão Noturna (≥ ${NIGHT_THRESHOLD}h)`} color="#6c3483" icon="🌙">
                <p className="muted plan-hint" style={{ marginBottom: 8 }}>
                  Peças longas — iniciar ao final do dia para terminar na manhã seguinte.
                </p>
                {nightSales.map(s => <SaleRow key={s.id} sale={s} />)}
              </Section>
            )}

            {/* ─── IMPRESSÃO DIURNA (agrupada) ───────────────── */}
            {daySales.length > 0 && (
              <Section title={`Impressão Diurna (< ${DAY_THRESHOLD}h) — Agrupável`} color="#1a7a4a" icon="☀️">
                <p className="muted plan-hint" style={{ marginBottom: 8 }}>
                  Peças curtas com mesmo material e cor podem ser impressas juntas na mesma mesa.
                </p>
                {dayGroups.map((group) => (
                  <div key={group.label} className="plan-group">
                    <div className="plan-group-header">
                      <span className="plan-group-label">{group.label}</span>
                      <span className="muted plan-group-time">Total: {group.totalHours.toFixed(1)}h ({group.sales.length} pedido{group.sales.length !== 1 ? 's' : ''})</span>
                    </div>
                    {group.sales.map(s => <SaleRow key={s.id} sale={s} />)}
                  </div>
                ))}
              </Section>
            )}

            {/* ─── IMPRESSÃO MÉDIA (individual) ──────────────── */}
            {midSales.length > 0 && (
              <Section title={`Atenção: Tempo Médio (${DAY_THRESHOLD}–${NIGHT_THRESHOLD}h)`} color="#d68910" icon="⏱️">
                <p className="muted plan-hint" style={{ marginBottom: 8 }}>
                  Impressões individuais — avaliar se cabem no turno do dia.
                </p>
                {midSales.map(s => <SaleRow key={s.id} sale={s} />)}
              </Section>
            )}

            {/* ─── SEM TEMPO DEFINIDO ────────────────────────── */}
            {unknownSales.length > 0 && (
              <Section title="Sem tempo de impressão definido" color="#888" icon="❓">
                <p className="muted plan-hint" style={{ marginBottom: 8 }}>
                  Configure o tempo de impressão nesses pedidos para incluir no planejamento.
                </p>
                {unknownSales.map(s => <SaleRow key={s.id} sale={s} />)}
              </Section>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
