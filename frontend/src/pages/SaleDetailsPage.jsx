import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  SALE_STATUSES,
  STATUS_LABELS,
} from '../domains/sales/sales.constants.js';
import { fetchSaleDetails, updateSale, updateSaleStatus } from '../domains/sales/sales.service.js';
import { formatCurrency, formatDate } from '../domains/shared/formatters.js';

function printSaleOrder(sale) {
  if (!sale) return;
  const printedAt = new Date().toLocaleString('pt-BR');
  const historyRows = (sale.status_history || [])
    .map((h) => {
      const eventText =
        h.kind === 'PAYMENT'
          ? PAYMENT_STATUS_LABELS[h.payment_status] || h.payment_status
          : h.kind === 'NOTICE'
            ? `Cliente avisado: ${h.customer_notified ? 'Sim' : 'Nao'}`
            : STATUS_LABELS[h.status] || h.status;
      return `<tr><td>${new Date(h.created_at).toLocaleString('pt-BR')}</td><td>${h.kind === 'PAYMENT' ? 'Pagamento' : h.kind === 'NOTICE' ? 'Aviso' : 'Status'}</td><td>${eventText}</td><td>${h.username || 'usuario'}</td></tr>`;
    })
    .join('');
  const itemRows = (sale.items || [])
    .map((item) => `<tr><td>${item.description || '-'}</td><td>${Number(item.qty || 0)}</td><td>${formatCurrency(item.unit_price || 0)}</td><td style="text-align:right">${formatCurrency(item.line_total || 0)}</td></tr>`)
    .join('');
  const paymentRows = (sale.payments || [])
    .map((p) => `<tr><td>${new Date(p.paid_at).toLocaleString('pt-BR')}</td><td>${PAYMENT_METHOD_LABELS[p.method] || p.method}</td><td style="text-align:right">${formatCurrency(p.amount || 0)}</td><td>${p.notes || '-'}</td></tr>`)
    .join('');

  const subtotal = sale.subtotal != null ? sale.subtotal : sale.total;
  const discountTotal = Number(sale.discount_total) || 0;
  const financialRows = `
    ${subtotal != null && Number(subtotal) !== Number(sale.total) ? `<tr><td>Subtotal</td><td style="text-align:right">${formatCurrency(subtotal)}</td></tr>` : ''}
    ${discountTotal > 0 ? `<tr><td>Desconto</td><td style="text-align:right;color:#c0392b">- ${formatCurrency(discountTotal)}</td></tr>` : ''}
    <tr style="font-weight:700;font-size:15px;border-top:2px solid #999"><td>Total</td><td style="text-align:right">${formatCurrency(sale.total || 0)}</td></tr>
  `;

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Pedido #${sale.id} - RAFT 3D</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 32px; color: #1a1a1a; font-size: 13px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #1a1a1a; }
          .header-brand { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
          .header-brand span { font-size: 11px; font-weight: 400; color: #666; display: block; letter-spacing: 0.1em; text-transform: uppercase; }
          .header-meta { text-align: right; color: #555; font-size: 12px; }
          .header-meta .order-id { font-size: 20px; font-weight: 700; color: #1a1a1a; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .info-card { border: 1px solid #ddd; border-radius: 6px; padding: 12px 16px; }
          .info-card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
          .info-row { display: flex; justify-content: space-between; gap: 8px; padding: 3px 0; }
          .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          thead tr { background: #f5f5f5; }
          th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #444; padding: 8px 10px; border-bottom: 2px solid #ddd; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #eee; }
          .totals-table { width: 280px; margin-left: auto; }
          .totals-table td { padding: 5px 10px; border: none; }
          .totals-table tr:last-child td { border-top: 2px solid #999; padding-top: 8px; }
          .no-items { color: #888; font-style: italic; padding: 8px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-brand">RAFT 3D<span>Pedido de Venda</span></div>
          <div class="header-meta"><div class="order-id">#${sale.id}</div><div>Emitido em: ${printedAt}</div></div>
        </div>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-card-title">Identificacao do Pedido</div>
            <div class="info-row"><span>Cliente</span><strong>${sale.customer_name_snapshot || '-'}</strong></div>
            <div class="info-row"><span>Data da venda</span><span>${formatDate(sale.sale_date)}</span></div>
            <div class="info-row"><span>Previsao de entrega</span><span>${formatDate(sale.due_date) || '-'}</span></div>
            <div class="info-row"><span>Processo</span><span>${sale.type === 'FDM' ? 'FDM' : 'Resina'}</span></div>
            ${sale.notes ? `<div class="info-row"><span>Observacoes</span><span>${sale.notes}</span></div>` : ''}
          </div>
          <div class="info-card">
            <div class="info-card-title">Status e Financeiro</div>
            <div class="info-row"><span>Status do pedido</span><strong>${STATUS_LABELS[sale.status] || sale.status}</strong></div>
            <div class="info-row"><span>Status do pagamento</span><span>${PAYMENT_STATUS_LABELS[sale.payment_status] || sale.payment_status}</span></div>
            <div class="info-row"><span>Forma de pagamento</span><span>${PAYMENT_METHOD_LABELS[sale.payment_method] || sale.payment_method || '-'}</span></div>
            <div style="margin-top:12px"><table class="totals-table"><tbody>${financialRows}</tbody></table></div>
          </div>
        </div>
        <div class="section-title">Itens do Pedido</div>
        ${itemRows ? `<table><thead><tr><th>Descricao</th><th>Qtd</th><th>Unitario</th><th style="text-align:right">Total</th></tr></thead><tbody>${itemRows}</tbody></table>` : '<p class="no-items">Nenhum item registrado.</p>'}
        <div class="section-title">Pagamentos</div>
        ${paymentRows ? `<table><thead><tr><th>Data</th><th>Metodo</th><th style="text-align:right">Valor</th><th>Notas</th></tr></thead><tbody>${paymentRows}</tbody></table>` : '<p class="no-items">Nenhum pagamento registrado.</p>'}
        <div class="section-title">Historico</div>
        ${historyRows ? `<table><thead><tr><th>Data</th><th>Tipo</th><th>Evento</th><th>Usuario</th></tr></thead><tbody>${historyRows}</tbody></table>` : '<p class="no-items">Sem historico registrado.</p>'}
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export default function SaleDetailsPage({
  saleId,
  onBackToKanban,
  processType = 'RESINA',
  onChanged,
  onEditSale,
}) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    if (!saleId) return;
    let active = true;
    setLoading(true);
    setError('');
    fetchSaleDetails(saleId)
      .then((details) => {
        if (!active) return;
        setSale(details);
        setEditForm({
          status: details.status,
          payment_status: details.payment_status,
          payment_method: details.payment_method || '',
          customer_notified: Boolean(details.customer_notified),
          discount_total: String(Number(details.discount_total || 0)),
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.response?.data?.message || 'Erro ao carregar detalhes do pedido.');
        setSale(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [saleId]);

  async function handleSave(e) {
    e.preventDefault();
    if (!sale || !editForm) return;
    setSaving(true);
    setError('');
    try {
      const statusPayload = {};
      if (editForm.status !== sale.status) statusPayload.status = editForm.status;
      if (editForm.payment_status !== sale.payment_status) statusPayload.payment_status = editForm.payment_status;
      if ((editForm.payment_method || '') !== (sale.payment_method || '')) statusPayload.payment_method = editForm.payment_method || null;
      if (Boolean(editForm.customer_notified) !== Boolean(sale.customer_notified)) statusPayload.customer_notified = Boolean(editForm.customer_notified);

      const nextDiscount = Math.max(0, Number(editForm.discount_total || 0));
      const currentDiscount = Math.max(0, Number(sale.discount_total || 0));
      if (nextDiscount !== currentDiscount) {
        const subtotal = Number(sale.subtotal != null ? sale.subtotal : sale.total || 0);
        await updateSale(sale.id, {
          subtotal,
          discount_total: nextDiscount,
          total: Math.max(0, subtotal - nextDiscount),
        });
      }

      if (Object.keys(statusPayload).length > 0) {
        await updateSaleStatus(sale.id, statusPayload);
      }

      const details = await fetchSaleDetails(sale.id);
      setSale(details);
      setEditForm({
        status: details.status,
        payment_status: details.payment_status,
        payment_method: details.payment_method || '',
        customer_notified: Boolean(details.customer_notified),
        discount_total: String(Number(details.discount_total || 0)),
      });
      if (typeof onChanged === 'function') {
        await onChanged(details);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao atualizar venda.');
    } finally {
      setSaving(false);
    }
  }

  const resolvedProcessType = processType === 'DRAWING' ? 'DRAWING' : processType === 'FDM' ? 'FDM' : 'RESINA';
  const locked = sale?.status === 'DELIVERED' && sale?.payment_status === 'PAID';

  return (
    <div className={`sales-page process-theme ${resolvedProcessType === 'DRAWING' ? 'process-theme--drawing' : resolvedProcessType === 'FDM' ? 'process-theme--fdm' : 'process-theme--resina'}`}>
      <div className="sales-page-header">
        <Button variant="ghost" type="button" onClick={onBackToKanban}>
          {'<-'} Voltar
        </Button>
        <h2>Detalhes do pedido</h2>
        {typeof onEditSale === 'function' && (
          <Button
            type="button"
            onClick={() => {
              if (sale) onEditSale(sale);
            }}
            disabled={!sale || locked}
          >
            Alterar pedido
          </Button>
        )}
      </div>

      <div className="sales-page-table-wrap">
        {loading ? (
          <p className="muted">Carregando...</p>
        ) : !sale ? (
          <p className="form-error">{error || 'Pedido nao encontrado.'}</p>
        ) : (
          <>
            <div className="detail-info-grid">
              <div className="detail-card">
                <div className="detail-card-title">Identificacao</div>
                <div className="detail-row"><span>Cliente</span><strong>{sale.customer_name_snapshot || 'Nao informado'}</strong></div>
                <div className="detail-row"><span>Pedido</span><span>#{sale.id}</span></div>
                <div className="detail-row"><span>Data da venda</span><span>{formatDate(sale.sale_date)}</span></div>
                <div className="detail-row"><span>Previsao de entrega</span><span>{formatDate(sale.due_date) || '-'}</span></div>
                <div className="detail-row"><span>Processo</span><span>{sale.type === 'FDM' ? 'FDM' : 'Resina'}</span></div>
                <div className="detail-row"><span>Material</span><span>{sale.material_type || '-'}{sale.material_color ? ` / ${sale.material_color}` : ''}</span></div>
                {sale.weight_grams != null && <div className="detail-row"><span>{sale.type === 'FDM' ? 'Peso (g)' : 'Volume (ml)'}</span><span>{sale.weight_grams}</span></div>}
                {sale.print_time_hours != null && <div className="detail-row"><span>Tempo de impressao (h)</span><span>{sale.print_time_hours}</span></div>}
                {sale.notes && <div className="detail-row" style={{ marginTop: '6px', flexDirection: 'column', gap: '2px' }}><span>Observacoes</span><span style={{ color: '#333' }}>{sale.notes}</span></div>}
              </div>
              <div className="detail-card">
                <div className="detail-card-title">Financeiro</div>
                {sale.subtotal != null && Number(sale.subtotal) !== Number(sale.total) && <div className="detail-row"><span>Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></div>}
                {sale.discount_total > 0 && <div className="detail-row"><span>Desconto</span><span className="text-discount">- {formatCurrency(sale.discount_total)}</span></div>}
                <div className="detail-row detail-row--highlight"><span>Total</span><strong>{formatCurrency(sale.total || 0)}</strong></div>
                <div className="detail-row" style={{ marginTop: '10px' }}><span>Status do pedido</span><span>{STATUS_LABELS[sale.status] || sale.status}</span></div>
                <div className="detail-row"><span>Status do pagamento</span><span>{PAYMENT_STATUS_LABELS[sale.payment_status] || sale.payment_status}</span></div>
                <div className="detail-row"><span>Forma de pagamento</span><span>{PAYMENT_METHOD_LABELS[sale.payment_method] || sale.payment_method || '-'}</span></div>
                <div className="detail-row" style={{ marginTop: '10px', borderTop: '1px solid #e2d9c7', paddingTop: '6px' }}><span>Criado por</span><span>{sale.created_by_name || '-'}</span></div>
                <div className="detail-row"><span>Criado em</span><span>{sale.created_logged_at ? new Date(sale.created_logged_at).toLocaleString('pt-BR') : '-'}</span></div>
                {sale.edit_history?.length > 0 && <div className="detail-row"><span>Ultima edicao</span><span>{new Date(sale.edit_history[sale.edit_history.length - 1].created_at).toLocaleString('pt-BR')} por {sale.edit_history[sale.edit_history.length - 1].username || '-'}</span></div>}
              </div>
            </div>

            <form className="sales-filters sale-detail-status-form" onSubmit={handleSave} style={{ marginTop: '16px' }}>
              <p className="new-sale-section-label">Status e pagamento</p>
              <div className="sale-detail-status-grid">
                <label className="filter-field">
                  <span>Status do pedido</span>
                  <select
                    value={editForm?.status || sale.status}
                    disabled={locked}
                    onChange={(e) => setEditForm((prev) => ({ ...(prev || {}), status: e.target.value }))}
                  >
                    {SALE_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
                  </select>
                </label>
                <label className="filter-field">
                  <span>Status do pagamento</span>
                  <select
                    value={editForm?.payment_status || sale.payment_status}
                    disabled={locked}
                    onChange={(e) => setEditForm((prev) => ({ ...(prev || {}), payment_status: e.target.value }))}
                  >
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s] || s}</option>)}
                  </select>
                </label>
                <label className="filter-field">
                  <span>Forma de pagamento</span>
                  <select
                    value={editForm?.payment_method ?? sale.payment_method ?? ''}
                    disabled={locked}
                    onChange={(e) => setEditForm((prev) => ({ ...(prev || {}), payment_method: e.target.value }))}
                  >
                    <option value="">Nao informado</option>
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m] || m}</option>)}
                  </select>
                </label>
                <label className="filter-field">
                  <span>Desconto (R$)</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={locked}
                    value={editForm?.discount_total ?? String(Number(sale.discount_total || 0))}
                    onChange={(e) => setEditForm((prev) => ({ ...(prev || {}), discount_total: e.target.value }))}
                  />
                </label>
                <label className="sale-detail-notify-field">
                  <input
                    type="checkbox"
                    checked={!!(editForm?.customer_notified ?? sale.customer_notified)}
                    disabled={(editForm?.status || sale.status) !== 'DONE' || locked}
                    onChange={(e) => setEditForm((prev) => ({ ...(prev || {}), customer_notified: e.target.checked }))}
                  />
                  <span className="sale-detail-notify-text">Cliente avisado</span>
                </label>
              </div>
              {locked && <p className="form-error">Pedido entregue e pago: alteracoes bloqueadas.</p>}
              {error && <p className="form-error">{error}</p>}
              <div className="filter-actions sale-detail-actions">
                <Button type="submit" disabled={locked || saving}>
                  {saving ? 'Salvando...' : 'Salvar alteracoes'}
                </Button>
                <Button variant="outline" type="button" onClick={() => printSaleOrder(sale)}>
                  Imprimir pedido (PDF)
                </Button>
              </div>
            </form>

            <h4>Itens do pedido</h4>
            {!sale.items || sale.items.length === 0 ? (
              <p className="muted">Sem itens registrados.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Descricao</th>
                    <th>Qtd</th>
                    <th>Unitario</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{Number(item.qty)}</td>
                      <td>{formatCurrency(item.unit_price)}</td>
                      <td>{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h4>Pagamentos</h4>
            {!sale.payments || sale.payments.length === 0 ? (
              <p className="muted">Sem pagamentos registrados.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Metodo</th>
                    <th>Valor</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{new Date(p.paid_at).toLocaleString('pt-BR')}</td>
                      <td>{PAYMENT_METHOD_LABELS[p.method] || p.method}</td>
                      <td>{formatCurrency(p.amount)}</td>
                      <td>{p.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h4>Historico do pedido</h4>
            {!sale.status_history || sale.status_history.length === 0 ? (
              <p className="muted">Sem historico registrado.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Evento</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.status_history.map((h, idx) => (
                    <tr key={`${h.created_at}-${idx}`}>
                      <td>{new Date(h.created_at).toLocaleString('pt-BR')}</td>
                      <td>{h.kind === 'PAYMENT' ? 'Pagamento' : h.kind === 'NOTICE' ? 'Aviso' : 'Status'}</td>
                      <td>
                        {h.kind === 'PAYMENT'
                          ? PAYMENT_STATUS_LABELS[h.payment_status] || h.payment_status
                          : h.kind === 'NOTICE'
                            ? `Cliente avisado: ${h.customer_notified ? 'Sim' : 'Nao'}`
                            : STATUS_LABELS[h.status] || h.status}
                      </td>
                      <td>{h.username || 'usuario'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
