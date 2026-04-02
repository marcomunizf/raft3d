import { useState, useEffect } from 'react';
import Modal from '../components/Modal.jsx';
import CustomerSearch from '../components/customers/CustomerSearch.jsx';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import PageHeader from '../components/shared/PageHeader.jsx';
import EmptyRow from '../components/shared/EmptyRow.jsx';
import LoadingState from '../components/shared/LoadingState.jsx';
import Pagination from '../components/shared/Pagination.jsx';
import { fetchSalesPaginated, createSale } from '../domains/sales/sales.service.js';
import {
  STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  SALE_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from '../domains/sales/sales.constants.js';
import { getSlaVariant } from '../domains/shared/dates.js';
import { DASHBOARD_SLA_LABEL } from '../domains/dashboard/dashboard.ui.js';
import { formatDate, formatCurrency } from '../domains/shared/formatters.js';
import { createEmptySaleForm } from '../domains/sales/sales.forms.js';
import { fetchMaterials } from '../domains/inventory/materials.service.js';
import SaleDetailsPage from './SaleDetailsPage.jsx';
import NewSalePage from './NewSalePage.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modal, setModal] = useState(null);
  const [detailSaleId, setDetailSaleId] = useState(null);
  const [saleBeingEdited, setSaleBeingEdited] = useState(null);
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

  async function loadSales(params, page = 1) {
    setLoading(true);
    setError('');
    try {
      const result = await fetchSalesPaginated({ ...params, page, limit: 50 });
      setSales(result.data);
      setPagination(result.meta);
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
    setDetailSaleId(sale.id);
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

  if (saleBeingEdited) {
    return (
      <NewSalePage
        mode="edit"
        saleId={saleBeingEdited.id}
        initialSaleData={saleBeingEdited}
        defaultType={saleBeingEdited.type || initialType || 'RESINA'}
        processType={resolvedProcessType}
        availableTypes={availableTypes}
        onBack={() => setSaleBeingEdited(null)}
        onSaved={async (updatedSale) => {
          await loadSales(buildServerParams(filters));
          setDetailSaleId(updatedSale?.id || saleBeingEdited.id);
          setSaleBeingEdited(null);
        }}
      />
    );
  }

  if (detailSaleId) {
    return (
      <SaleDetailsPage
        saleId={detailSaleId}
        onBackToKanban={onBack}
        processType={resolvedProcessType}
        onChanged={async () => { await loadSales(buildServerParams(filters)); }}
        onEditSale={(sale) => setSaleBeingEdited(sale)}
      />
    );
  }

  return (
    <div className={`sales-page process-theme ${resolvedProcessType === 'DRAWING' ? 'process-theme--drawing' : resolvedProcessType === 'FDM' ? 'process-theme--fdm' : 'process-theme--resina'}`}>
      <PageHeader
        onBack={onBack}
        title="Pedidos"
        action={{
          label: '+ Nova venda',
          onClick: () => {
            setNewForm({ ...createEmptySaleForm(), type: initialType || 'RESINA' });
            setModalError('');
            setModal('new-sale');
          },
        }}
      />

      <form className="sales-filters" onSubmit={handleSearch}>
        <div className="sales-filters-row">
          <label className="filter-field">
            <span>De</span>
            <Input
              type="date"
              value={filters.start_date}
              onChange={e => handleDateChange('start_date', e.target.value)}
            />
          </label>
          <label className="filter-field">
            <span>Ate</span>
            <Input
              type="date"
              value={filters.end_date}
              onChange={e => handleDateChange('end_date', e.target.value)}
            />
          </label>
          <label className="filter-field filter-field--wide">
            <span>Cliente</span>
            <Input
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
            <Button type="submit">
              Buscar
            </Button>
            <Button variant="ghost" type="button" onClick={handleClear}>
              Limpar
            </Button>
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
          <LoadingState />
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
                <EmptyRow colSpan={9} message="Nenhuma venda encontrada." />
              ) : (
                displayedSales.map(sale => {
                  const sla = getSlaVariant(sale.due_date, sale.status, sale.customer_notified);
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
                        <StatusBadge variant="type" value={sale.type} />
                      </td>
                      <td>{formatCurrency(sale.total)}</td>
                      <td>{formatDate(sale.due_date)}</td>
                      <td>
                        <StatusBadge variant="sla" value={sla} labels={DASHBOARD_SLA_LABEL} />
                      </td>
                      <td>
                        <StatusBadge variant="status" value={sale.status} labels={STATUS_LABELS} />
                      </td>
                      <td>
                        <StatusBadge variant="payment" value={sale.payment_status} labels={PAYMENT_STATUS_LABELS} />
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
      <Pagination
        meta={pagination}
        onChange={(page) => loadSales(buildServerParams(filters), page)}
      />
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
                <Input
                  type="date"
                  value={newForm.sale_date}
                  required
                  onChange={e => setNewForm(prev => ({ ...prev, sale_date: e.target.value }))}
                />
              </label>
              <label>
                Previsao de entrega
                <Input
                  type="date"
                  value={newForm.due_date}
                  onChange={e => setNewForm(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </label>
              <label>
                Valor (R$)
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  required
                  value={newForm.subtotal || newForm.total}
                  onChange={e =>
                    setNewForm(prev => ({
                      ...prev,
                      subtotal: e.target.value,
                      total: String(Math.max(0, Number(e.target.value) - (Number(prev.discount_total) || 0))),
                    }))
                  }
                />
              </label>
              <label>
                Desconto (R$)
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={newForm.discount_total}
                  onChange={e =>
                    setNewForm(prev => ({
                      ...prev,
                      discount_total: e.target.value,
                      total: String(Math.max(0, (Number(prev.subtotal) || Number(prev.total) || 0) - Number(e.target.value))),
                    }))
                  }
                />
              </label>
              <label>
                Total (R$)
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  readOnly
                  value={newForm.total}
                  style={{ background: '#f9f6f1', cursor: 'default' }}
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
                <Input
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
                <Input
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
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newForm.weight_grams || ''}
                  onChange={e => setNewForm(prev => ({ ...prev, weight_grams: e.target.value }))}
                />
              </label>
              <label>
                Tempo de impressao (horas)
                <Input
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
                <Textarea
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
                <Button type="submit">
                  Salvar venda
                </Button>
                <Button variant="ghost" type="button" onClick={() => setModal(null)}>
                  Cancelar
                </Button>
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
