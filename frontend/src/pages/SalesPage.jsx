import { useState, useEffect } from 'react';
import Modal from '../components/Modal.jsx';
import CustomerSearch from '../domains/customers/CustomerSearch.jsx';
import { fetchSales, createSale, updateSaleStatus } from '../domains/sales/sales.service.js';
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

export default function SalesPage({ onBack, defaultType = '', availableTypes = ['RESINA', 'FDM'] }) {
  const singleType = availableTypes.length === 1 ? availableTypes[0] : null;
  const initialType = singleType || defaultType;

  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, type: initialType });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modal, setModal] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [newForm, setNewForm] = useState({
    ...createEmptySaleForm(),
    type: initialType || 'RESINA',
  });
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    loadSales(buildServerParams({ ...EMPTY_FILTERS, type: initialType }));
  }, []);

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

  function openEditSale(sale) {
    setSelectedSale(sale);
    setEditForm({ status: sale.status, payment_status: sale.payment_status });
    setModalError('');
    setModal('edit-sale');
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setModalError('');
    try {
      await updateSaleStatus(selectedSale.id, editForm);
      setModal(null);
      setSelectedSale(null);
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

  return (
    <div className="sales-page">
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
              <span>Tipo</span>
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
                  const sla = getDashboardSlaVariant(sale.due_date, sale.status);
                  return (
                    <tr
                      key={sale.id}
                      className="row-clickable"
                      onClick={() => openEditSale(sale)}
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

      {modal === 'edit-sale' && selectedSale && (
        <Modal title="Alterar status da venda" onClose={() => setModal(null)}>
          <div className="modal-section">
            <div className="detail-header">
              <p className="muted">
                {selectedSale.customer_name_snapshot} — {formatCurrency(selectedSale.total)}
              </p>
              <p className="muted">
                Venda: {formatDate(selectedSale.sale_date)} | Entrega:{' '}
                {formatDate(selectedSale.due_date)}
              </p>
            </div>
            <form className="form-grid" onSubmit={handleSaveEdit}>
              <label>
                Status do pedido
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
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
                  value={editForm.payment_status}
                  onChange={e =>
                    setEditForm(prev => ({ ...prev, payment_status: e.target.value }))
                  }
                >
                  {PAYMENT_STATUSES.map(s => (
                    <option key={s} value={s}>
                      {PAYMENT_STATUS_LABELS[s] || s}
                    </option>
                  ))}
                </select>
              </label>
              {modalError && (
                <div className="form-error" style={{ gridColumn: '1 / -1' }}>
                  {modalError}
                </div>
              )}
              <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                <button className="btn btn-primary" type="submit">
                  Salvar
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setModal(null)}>
                  Cancelar
                </button>
              </div>
            </form>
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
                Valor total (R$)
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
                Tipo
                <select
                  value={newForm.type}
                  onChange={e => setNewForm(prev => ({ ...prev, type: e.target.value }))}
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
