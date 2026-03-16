import { useState, useEffect } from 'react';
import Modal from '../components/Modal.jsx';
import CustomerSearch from '../domains/customers/CustomerSearch.jsx';
import { fetchSales, createSale, updateSaleStatus, fetchSaleDetails } from '../domains/sales/sales.service.js';
import {
  STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  SALE_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from '../domains/sales/sales.constants.js';
import { getDashboardSlaVariant, DASHBOARD_SLA_LABEL } from '../domains/dashboard/dashboard.ui.js';
import { formatDate, formatCurrency } from '../domains/shared/formatters.js';
import { createEmptySaleForm } from '../domains/sales/sales.forms.js';
import { fetchMaterials } from '../domains/inventory/materials.service.js';

const EMPTY_FILTERS = {
  start_date: '',
  end_date: '',
  customer_name: '',
  status: '',
  payment_status: '',
  payment_method: '',
  type: '',
};

function buildServerParams(f) {
  const params = {};
  if (f.start_date) params.start_date = f.start_date;
  if (f.end_date) params.end_date = f.end_date;
  if (f.status) params.status = f.status;
  if (f.payment_status) params.payment_status = f.payment_status;
  if (f.type) params.type = f.type;
  return params;
}

export default function SalesPage({ onBack, defaultType = '', availableTypes = ['RESINA', 'FDM'], processType = '' }) {
  const singleType = availableTypes.length === 1 ? availableTypes[0] : null;
  const initialType = singleType || defaultType;

  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, type: initialType });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modal, setModal] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newForm, setNewForm] = useState({
    ...createEmptySaleForm(),
    type: initialType || 'RESINA',
  });
  const [modalError, setModalError] = useState('');
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    loadSales(buildServerParams({ ...EMPTY_FILTERS, type: initialType }));
    loadMaterials();
  }, []);

  async function loadMaterials() {
    try {
      const data = await fetchMaterials();
      setMaterials(data);
    } catch {
      setMaterials([]);
    }
  }

  async function loadSales(params) {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSales(params);
      setSales(data);
    } catch {
      setError('Erro ao carregar vendas.');
    } finally {
      setLoading(false);
    }
  }

  // For selects: update state and immediately re-fetch
  function handleSelectFilter(field, value) {
    const next = { ...filters, [field]: value };
    setFilters(next);
    loadSales(buildServerParams(next));
  }

  // For date inputs: only update state, apply on Buscar click
  function handleDateChange(field, value) {
    setFilters(prev => ({ ...prev, [field]: value }));
  }

  // For client-side text filters: only update state
  function handleClientFilter(field, value) {
    setFilters(prev => ({ ...prev, [field]: value }));
  }

  function handleSearch(e) {
    e.preventDefault();
    loadSales(buildServerParams(filters));
  }

  function handleClear() {
    const reset = { ...EMPTY_FILTERS, type: singleType || '' };
    setFilters(reset);
    loadSales(buildServerParams(reset));
  }

  // client-side filtering for customer_name and payment_method
  const displayedSales = sales.filter(s => {
    if (
      filters.customer_name &&
      !s.customer_name_snapshot?.toLowerCase().includes(filters.customer_name.toLowerCase())
    )
      return false;
    if (filters.payment_method && s.payment_method !== filters.payment_method) return false;
    return true;
  });

  async function openSaleDetails(sale) {
    setModalError('');
    setDetailLoading(true);
    setSelectedSale(null);
    setModal('sale-detail');
    try {
      const details = await fetchSaleDetails(sale.id);
      setSelectedSale(details);
      setEditForm({
        status: details.status,
        payment_status: details.payment_status,
        payment_method: details.payment_method || '',
        customer_notified: Boolean(details.customer_notified),
      });
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao carregar detalhes do pedido.');
    } finally {
      setDetailLoading(false);
    }
  }

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
      .map((item) => `<tr><td>${item.description || '-'}</td><td>${Number(item.qty || 0)}</td><td>${formatCurrency(item.unit_price || 0)}</td><td>${formatCurrency(item.line_total || 0)}</td></tr>`)
      .join('');
    const paymentRows = (sale.payments || [])
      .map((p) => `<tr><td>${new Date(p.paid_at).toLocaleString('pt-BR')}</td><td>${PAYMENT_METHOD_LABELS[p.method] || p.method}</td><td>${formatCurrency(p.amount || 0)}</td><td>${p.notes || '-'}</td></tr>`)
      .join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Pedido ${sale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1, h2 { margin: 0 0 8px; }
            .meta { color: #555; margin-bottom: 18px; }
            .section { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>RAFT 3D</h1>
          <div class="meta">Impressao: ${printedAt}</div>
          <div class="section">
            <h2>Detalhes do pedido</h2>
            <p><strong>ID:</strong> ${sale.id}</p>
            <p><strong>Cliente:</strong> ${sale.customer_name_snapshot || '-'}</p>
            <p><strong>Processo:</strong> ${sale.type === 'FDM' ? 'FDM' : 'Resina'}</p>
            <p><strong>Venda:</strong> ${formatDate(sale.sale_date)} | <strong>Entrega:</strong> ${formatDate(sale.due_date)}</p>
            <p><strong>Status:</strong> ${STATUS_LABELS[sale.status] || sale.status} | <strong>Pagamento:</strong> ${PAYMENT_STATUS_LABELS[sale.payment_status] || sale.payment_status}</p>
            <p><strong>Metodo:</strong> ${PAYMENT_METHOD_LABELS[sale.payment_method] || sale.payment_method || '-'}</p>
            <p><strong>Total:</strong> ${formatCurrency(sale.total || 0)}</p>
            <p><strong>Material:</strong> ${sale.material_type || '-'}${sale.material_color ? ` / ${sale.material_color}` : ''}</p>
            <p><strong>${sale.type === 'FDM' ? 'Peso (g)' : 'Volume (ml)'}:</strong> ${sale.weight_grams ?? '-'}</p>
            <p><strong>Tempo de impressao (h):</strong> ${sale.print_time_hours ?? '-'}</p>
            <p><strong>Criado por:</strong> ${sale.created_by_name || '-'}</p>
            <p><strong>Criado em:</strong> ${sale.created_logged_at ? new Date(sale.created_logged_at).toLocaleString('pt-BR') : '-'}</p>
            <p><strong>Ultima edicao:</strong> ${sale.edit_history?.length ? `${new Date(sale.edit_history[sale.edit_history.length - 1].created_at).toLocaleString('pt-BR')} por ${sale.edit_history[sale.edit_history.length - 1].username || '-'}` : '-'}</p>
            <p><strong>Observacoes:</strong> ${sale.notes || '-'}</p>
          </div>
          <div class="section">
            <h2>Itens</h2>
            ${itemRows ? `<table><thead><tr><th>Descricao</th><th>Qtd</th><th>Unitario</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table>` : '<p>Sem itens.</p>'}
          </div>
          <div class="section">
            <h2>Pagamentos</h2>
            ${paymentRows ? `<table><thead><tr><th>Data</th><th>Metodo</th><th>Valor</th><th>Notas</th></tr></thead><tbody>${paymentRows}</tbody></table>` : '<p>Sem pagamentos.</p>'}
          </div>
          <div class="section">
            <h2>Historico</h2>
            ${historyRows ? `<table><thead><tr><th>Data</th><th>Tipo</th><th>Evento</th><th>Usuario</th></tr></thead><tbody>${historyRows}</tbody></table>` : '<p>Sem historico.</p>'}
          </div>
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

  async function handleSaveEdit(e) {
    e.preventDefault();
    setModalError('');
    try {
      await updateSaleStatus(selectedSale.id, editForm);
      const details = await fetchSaleDetails(selectedSale.id);
      setSelectedSale(details);
      setEditForm({
        status: details.status,
        payment_status: details.payment_status,
        payment_method: details.payment_method || '',
        customer_notified: Boolean(details.customer_notified),
      });
      loadSales(buildServerParams(filters));
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao atualizar venda.');
    }
  }

  async function handleCreateSale(e) {
    e.preventDefault();
    setModalError('');
    try {
      const subtotal = Number(newForm.subtotal) || Number(newForm.total) || 0;
      const total = Number(newForm.total) || subtotal;
      await createSale({
        ...newForm,
        subtotal,
        discount_total: Number(newForm.discount_total) || 0,
        total,
        material_type: newForm.material_type || null,
        material_color: newForm.material_color || null,
        weight_grams: newForm.weight_grams !== ''
          ? Number(newForm.weight_grams)
          : null,
        print_time_hours: newForm.print_time_hours !== ''
          ? Number(newForm.print_time_hours)
          : null,
        due_date: newForm.due_date || null,
        customer_name_snapshot: newForm.customer_name_snapshot || 'Venda generica',
      });
      setModal(null);
      setNewForm({ ...createEmptySaleForm(), type: initialType || 'RESINA' });
      loadSales(buildServerParams(filters));
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao salvar venda.');
    }
  }

  const resolvedProcessType = processType === 'DRAWING' ? 'DRAWING' : (processType || initialType || 'RESINA') === 'FDM' ? 'FDM' : 'RESINA';

  return (
    <div className={`sales-page process-theme ${resolvedProcessType === 'DRAWING' ? 'process-theme--drawing' : resolvedProcessType === 'FDM' ? 'process-theme--fdm' : 'process-theme--resina'}`}>
      <div className="sales-page-header">
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          ← Voltar
        </button>
        <h2>Pedidos</h2>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setNewForm({ ...createEmptySaleForm(), type: initialType || 'RESINA' });
            setModalError('');
            setModal('new-sale');
          }}
        >
          + Nova venda
        </button>
      </div>

      <form className="sales-filters" onSubmit={handleSearch}>
        <div className="sales-filters-row">
          <label className="filter-field">
            <span>De</span>
            <input
              type="date"
              value={filters.start_date}
              onChange={e => handleDateChange('start_date', e.target.value)}
            />
          </label>
          <label className="filter-field">
            <span>Ate</span>
            <input
              type="date"
              value={filters.end_date}
              onChange={e => handleDateChange('end_date', e.target.value)}
            />
          </label>
          <label className="filter-field filter-field--wide">
            <span>Cliente</span>
            <input
              type="text"
              placeholder="Nome do cliente..."
              value={filters.customer_name}
              onChange={e => handleClientFilter('customer_name', e.target.value)}
            />
          </label>
          <label className="filter-field">
            <span>Status</span>
            <select
              value={filters.status}
              onChange={e => handleSelectFilter('status', e.target.value)}
            >
              <option value="">Todos</option>
              {SALE_STATUSES.map(s => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] || s}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Pagamento</span>
            <select
              value={filters.payment_status}
              onChange={e => handleSelectFilter('payment_status', e.target.value)}
            >
              <option value="">Todos</option>
              {PAYMENT_STATUSES.map(s => (
                <option key={s} value={s}>
                  {PAYMENT_STATUS_LABELS[s] || s}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Tipo pag.</span>
            <select
              value={filters.payment_method}
              onChange={e => handleClientFilter('payment_method', e.target.value)}
            >
              <option value="">Todos</option>
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m] || m}
                </option>
              ))}
            </select>
          </label>
          {availableTypes.length > 1 && (
            <label className="filter-field">
              <span>Processo</span>
              <select
                value={filters.type}
                onChange={e => handleSelectFilter('type', e.target.value)}
              >
                <option value="">Todos</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>
                    {t === 'FDM' ? 'FDM' : 'Resina'}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="filter-actions">
            <button className="btn btn-primary" type="submit">
              Buscar
            </button>
            <button className="btn btn-ghost" type="button" onClick={handleClear}>
              Limpar
            </button>
          </div>
        </div>
      </form>

      {error && (
        <p className="form-error" style={{ padding: '0 24px' }}>
          {error}
        </p>
      )}

      <div className="sales-page-table-wrap">
        {loading ? (
          <p className="muted" style={{ padding: '24px' }}>
            Carregando...
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Total</th>
                <th>Entrega</th>
                <th>SLA</th>
                <th>Status</th>
                <th>Pagamento</th>
                <th>Tipo pag.</th>
              </tr>
            </thead>
            <tbody>
              {displayedSales.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="muted"
                    style={{ textAlign: 'center', padding: '32px' }}
                  >
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              ) : (
                displayedSales.map(sale => {
                  const sla = getDashboardSlaVariant(sale.due_date, sale.status, sale.customer_notified);
                  return (
                    <tr
                      key={sale.id}
                      className="row-clickable"
                      onClick={() => openSaleDetails(sale)}
                    >
                      <td>{formatDate(sale.sale_date)}</td>
                      <td>
                        <strong>{sale.customer_name_snapshot}</strong>
                      </td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            background:
                              sale.type === 'FDM' ? 'var(--raft-magenta)' : 'var(--raft-green)',
                            color: '#fff',
                          }}
                        >
                          {sale.type === 'FDM' ? 'FDM' : 'Resina'}
                        </span>
                      </td>
                      <td>{formatCurrency(sale.total)}</td>
                      <td>{formatDate(sale.due_date)}</td>
                      <td>
                        {sla ? (
                          <span className={`pill pill--${sla}`}>{DASHBOARD_SLA_LABEL[sla]}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className="pill pill--status">
                          {STATUS_LABELS[sale.status] || sale.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`pill pill--pay pill--pay-${sale.payment_status?.toLowerCase()}`}
                        >
                          {PAYMENT_STATUS_LABELS[sale.payment_status] || sale.payment_status}
                        </span>
                      </td>
                      <td>
                        {sale.payment_method
                          ? PAYMENT_METHOD_LABELS[sale.payment_method] || sale.payment_method
                          : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'sale-detail' && (
        <Modal title="Detalhes do pedido" onClose={() => setModal(null)}>
          <div className="modal-section">
            {detailLoading ? (
              <p className="muted">Carregando...</p>
            ) : !selectedSale ? (
              <p className="muted">Pedido nao encontrado.</p>
            ) : (
              <>
                <h4>Detalhes do pedido</h4>
                <div className="detail-header">
                  <p><strong>{selectedSale.customer_name_snapshot || 'Cliente nao informado'}</strong></p>
                  <p className="muted">ID: {selectedSale.id}</p>
                  <p className="muted">
                    Venda: {formatDate(selectedSale.sale_date)} | Entrega: {formatDate(selectedSale.due_date)}
                  </p>
                  <p className="muted">
                    Total: {formatCurrency(selectedSale.total)} | Processo: {selectedSale.type === 'FDM' ? 'FDM' : 'Resina'}
                  </p>
                  <p className="muted">
                    Material: {selectedSale.material_type || '-'}{selectedSale.material_color ? ` / ${selectedSale.material_color}` : ''}
                  </p>
                  <p className="muted">
                    {selectedSale.type === 'FDM' ? 'Peso (g)' : 'Volume (ml)'}: {selectedSale.weight_grams ?? '-'} | Tempo de impressao (h): {selectedSale.print_time_hours ?? '-'}
                  </p>
                  <p className="muted">
                    Metodo: {PAYMENT_METHOD_LABELS[selectedSale.payment_method] || selectedSale.payment_method || '-'} | Pagamento: {PAYMENT_STATUS_LABELS[selectedSale.payment_status] || selectedSale.payment_status}
                  </p>
                  <p className="muted">
                    Criado por: {selectedSale.created_by_name || '-'} | Criado em: {selectedSale.created_logged_at ? new Date(selectedSale.created_logged_at).toLocaleString('pt-BR') : '-'}
                  </p>
                  <p className="muted">
                    Ultima edicao: {selectedSale.edit_history?.length
                      ? `${new Date(selectedSale.edit_history[selectedSale.edit_history.length - 1].created_at).toLocaleString('pt-BR')} por ${selectedSale.edit_history[selectedSale.edit_history.length - 1].username || '-'}`
                      : '-'}
                  </p>
                  <p className="muted">Observacoes: {selectedSale.notes || '-'}</p>
                </div>

                <form className="form-grid" onSubmit={handleSaveEdit}>
                  <label>
                    Status do pedido
                    <select
                      value={editForm?.status || selectedSale.status}
                      disabled={selectedSale.status === 'DELIVERED' && selectedSale.payment_status === 'PAID'}
                      onChange={e => setEditForm(prev => ({ ...(prev || {}), status: e.target.value }))}
                    >
                      {SALE_STATUSES.map(s => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s] || s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Status do pagamento
                    <select
                      value={editForm?.payment_status || selectedSale.payment_status}
                      disabled={selectedSale.status === 'DELIVERED' && selectedSale.payment_status === 'PAID'}
                      onChange={e => setEditForm(prev => ({ ...(prev || {}), payment_status: e.target.value }))}
                    >
                      {PAYMENT_STATUSES.map(s => (
                        <option key={s} value={s}>
                          {PAYMENT_STATUS_LABELS[s] || s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Forma de pagamento
                    <select
                      value={editForm?.payment_method ?? selectedSale.payment_method ?? ''}
                      disabled={selectedSale.status === 'DELIVERED' && selectedSale.payment_status === 'PAID'}
                      onChange={e => setEditForm(prev => ({ ...(prev || {}), payment_method: e.target.value }))}
                    >
                      <option value="">Nao informado</option>
                      {PAYMENT_METHODS.map(m => (
                        <option key={m} value={m}>
                          {PAYMENT_METHOD_LABELS[m] || m}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '26px' }}>
                    <input
                      type="checkbox"
                      checked={!!(editForm?.customer_notified ?? selectedSale.customer_notified)}
                      disabled={(editForm?.status || selectedSale.status) !== 'DONE' || (selectedSale.status === 'DELIVERED' && selectedSale.payment_status === 'PAID')}
                      onChange={e => setEditForm(prev => ({ ...(prev || {}), customer_notified: e.target.checked }))}
                    />
                    Cliente avisado
                  </label>

                  {selectedSale.status === 'DELIVERED' && selectedSale.payment_status === 'PAID' && (
                    <div className="form-error" style={{ gridColumn: '1 / -1' }}>
                      Pedido entregue e pago: alteracoes bloqueadas.
                    </div>
                  )}

                  {modalError && (
                    <div className="form-error" style={{ gridColumn: '1 / -1' }}>
                      {modalError}
                    </div>
                  )}

                  <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={selectedSale.status === 'DELIVERED' && selectedSale.payment_status === 'PAID'}
                    >
                      Salvar alteracoes
                    </button>
                    <button className="btn btn-outline" type="button" onClick={() => printSaleOrder(selectedSale)}>
                      Imprimir pedido (PDF)
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => setModal(null)}>
                      Fechar
                    </button>
                  </div>
                </form>

                <h4>Itens do pedido</h4>
                {!selectedSale.items || selectedSale.items.length === 0 ? (
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
                      {selectedSale.items.map((item) => (
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
                {!selectedSale.payments || selectedSale.payments.length === 0 ? (
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
                      {selectedSale.payments.map((p) => (
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
                {!selectedSale.status_history || selectedSale.status_history.length === 0 ? (
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
                      {selectedSale.status_history.map((h, idx) => (
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
        </Modal>
      )}

      {modal === 'new-sale' && (
        <Modal title="Nova venda" onClose={() => setModal(null)}>
          <div className="modal-section">
            <form className="form-grid" onSubmit={handleCreateSale}>
              <label style={{ gridColumn: '1 / -1' }}>
                Cliente
                <CustomerSearch
                  value={newForm.customer_name_snapshot}
                  onSelect={(id, name) =>
                    setNewForm(prev => ({
                      ...prev,
                      customer_id: id,
                      customer_name_snapshot: name,
                    }))
                  }
                  placeholder="Buscar por nome ou CPF/CNPJ..."
                />
              </label>
              <label>
                Data da venda
                <input
                  type="date"
                  value={newForm.sale_date}
                  required
                  onChange={e => setNewForm(prev => ({ ...prev, sale_date: e.target.value }))}
                />
              </label>
              <label>
                Previsao de entrega
                <input
                  type="date"
                  value={newForm.due_date}
                  onChange={e => setNewForm(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </label>
              <label>
                Valor (R$)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  required
                  value={newForm.total}
                  onChange={e =>
                    setNewForm(prev => ({
                      ...prev,
                      total: e.target.value,
                      subtotal: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Processo
                <select
                  value={newForm.type}
                  onChange={e =>
                    setNewForm(prev => ({
                      ...prev,
                      type: e.target.value,
                      material_type: '',
                      material_color: '',
                      weight_grams: '',
                      print_time_hours: '',
                    }))
                  }
                  disabled={availableTypes.length === 1}
                >
                  {availableTypes.map(t => (
                    <option key={t} value={t}>
                      {t === 'FDM' ? 'FDM' : 'Resina'}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo
                <input
                  type="text"
                  list={`sale-material-type-${newForm.type}`}
                  value={newForm.material_type || ''}
                  onChange={e => setNewForm(prev => ({ ...prev, material_type: e.target.value }))}
                />
                <datalist id={`sale-material-type-${newForm.type}`}>
                  {unique(
                    materials
                      .filter(m => m.process === newForm.type)
                      .map(m => m.type),
                  ).map(value => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </label>
              <label>
                Cor
                <input
                  type="text"
                  list={`sale-material-color-${newForm.type}`}
                  value={newForm.material_color || ''}
                  onChange={e => setNewForm(prev => ({ ...prev, material_color: e.target.value }))}
                />
                <datalist id={`sale-material-color-${newForm.type}`}>
                  {unique(
                    materials
                      .filter(m => m.process === newForm.type)
                      .map(m => m.color),
                  ).map(value => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </label>
              <label>
                {newForm.type === 'FDM' ? 'Peso (em gramas)' : 'Peso (em ml)'}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newForm.weight_grams || ''}
                  onChange={e => setNewForm(prev => ({ ...prev, weight_grams: e.target.value }))}
                />
              </label>
              <label>
                Tempo de impressao (horas)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newForm.print_time_hours || ''}
                  onChange={e =>
                    setNewForm(prev => ({ ...prev, print_time_hours: e.target.value }))
                  }
                />
              </label>
              <label>
                Status do pedido
                <select
                  value={newForm.status}
                  onChange={e => setNewForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  {SALE_STATUSES.map(s => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s] || s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Pagamento
                <select
                  value={newForm.payment_status}
                  onChange={e =>
                    setNewForm(prev => ({ ...prev, payment_status: e.target.value }))
                  }
                >
                  {PAYMENT_STATUSES.map(s => (
                    <option key={s} value={s}>
                      {PAYMENT_STATUS_LABELS[s] || s}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Observacoes
                <textarea
                  rows="3"
                  placeholder="Detalhes da venda"
                  value={newForm.notes}
                  onChange={e => setNewForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </label>
              {modalError && (
                <div className="form-error" style={{ gridColumn: '1 / -1' }}>
                  {modalError}
                </div>
              )}
              <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                <button className="btn btn-primary" type="submit">
                  Salvar venda
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setModal(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
