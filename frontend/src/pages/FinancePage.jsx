import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import {
  createFinanceEntry,
  fetchFinanceEntries,
  fetchFinanceSummary,
  updateFinanceEntry,
  updateFinanceEntryStatus,
} from '../domains/finance/finance.service.js';
import { fetchCustomers } from '../domains/customers/customers.service.js';
import { formatCurrency, formatDate } from '../domains/shared/formatters.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ENTRY_TYPES = {
  INCOME: 'Receita',
  EXPENSE: 'Custo',
};

const ENTRY_STATUSES = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
};

const PROCESS_TYPES = {
  GENERAL: 'Geral',
  RESINA: 'Resina',
  FDM: 'FDM',
  DRAWING: 'Desenho',
};

const PAYMENT_METHODS = ['PIX', 'CARD', 'CASH', 'TRANSFER', 'BOLETO', 'OUTRO'];

const EMPTY_FORM = {
  entry_type: 'INCOME',
  category: '',
  description: '',
  amount: '',
  entry_date: new Date().toISOString().slice(0, 10),
  due_date: '',
  paid_date: '',
  status: 'PENDING',
  process_type: 'GENERAL',
  payment_method: '',
  customer_id: '',
  customer_name_snapshot: '',
  supplier_name_snapshot: '',
  notes: '',
};

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { start, end };
}

function normalizePayload(form) {
  return {
    entry_type: form.entry_type,
    category: form.category.trim(),
    description: form.description.trim(),
    amount: Number(form.amount || 0),
    entry_date: form.entry_date,
    due_date: form.due_date || null,
    paid_date: form.paid_date || null,
    status: form.status,
    process_type: form.process_type,
    payment_method: form.payment_method || null,
    customer_id: form.customer_id || null,
    customer_name_snapshot: form.customer_name_snapshot || null,
    supplier_name_snapshot: form.supplier_name_snapshot || null,
    notes: form.notes || null,
  };
}

export default function FinancePage({ onBack, processType = 'RESINA' }) {
  const month = currentMonthRange();
  const [activeType, setActiveType] = useState('INCOME');
  const [filters, setFilters] = useState({
    start_date: month.start,
    end_date: month.end,
    entry_type: 'INCOME',
    status: '',
    process_type: '',
    q: '',
  });
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [selected, setSelected] = useState(null);
  const [modalError, setModalError] = useState('');

  const resolvedProcessType = processType === 'DRAWING' ? 'DRAWING' : processType === 'FDM' ? 'FDM' : 'RESINA';

  const serverFilters = useMemo(() => {
    const params = {};
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.entry_type) params.entry_type = filters.entry_type;
    if (filters.status) params.status = filters.status;
    if (filters.process_type) params.process_type = filters.process_type;
    if (filters.q) params.q = filters.q;
    return params;
  }, [filters]);

  useEffect(() => {
    load();
    fetchCustomers().then(setCustomers).catch(() => setCustomers([]));
  }, []);

  async function load(params = serverFilters) {
    setLoading(true);
    setError('');
    try {
      const [summaryData, entriesData] = await Promise.all([
        fetchFinanceSummary(params),
        fetchFinanceEntries(params),
      ]);
      setSummary(summaryData);
      setEntries(entriesData);
    } catch {
      setError('Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(e) {
    e.preventDefault();
    load();
  }

  function clearFilters() {
    const next = {
      start_date: month.start,
      end_date: month.end,
      entry_type: activeType,
      status: '',
      process_type: '',
      q: '',
    };
    setFilters(next);
    load({
      start_date: next.start_date,
      end_date: next.end_date,
      entry_type: next.entry_type,
    });
  }

  function switchType(nextType) {
    setActiveType(nextType);
    const next = { ...filters, entry_type: nextType };
    setFilters(next);
    load({
      start_date: next.start_date,
      end_date: next.end_date,
      entry_type: next.entry_type,
      status: next.status || undefined,
      process_type: next.process_type || undefined,
      q: next.q || undefined,
    });
  }

  function openNew(entryType) {
    setSelected(null);
    setForm({
      ...EMPTY_FORM,
      entry_type: entryType,
      process_type: filters.process_type || 'GENERAL',
    });
    setModalError('');
    setModal('new');
  }

  function openEdit(entry) {
    setSelected(entry);
    setForm({
      entry_type: entry.entry_type,
      category: entry.category || '',
      description: entry.description || '',
      amount: String(entry.amount ?? ''),
      entry_date: entry.entry_date ? String(entry.entry_date).slice(0, 10) : '',
      due_date: entry.due_date ? String(entry.due_date).slice(0, 10) : '',
      paid_date: entry.paid_date ? String(entry.paid_date).slice(0, 10) : '',
      status: entry.status || 'PENDING',
      process_type: entry.process_type || 'GENERAL',
      payment_method: entry.payment_method || '',
      customer_id: entry.customer_id || '',
      customer_name_snapshot: entry.customer_name_snapshot || '',
      supplier_name_snapshot: entry.supplier_name_snapshot || '',
      notes: entry.notes || '',
    });
    setModalError('');
    setModal('edit');
  }

  async function submitForm(e) {
    e.preventDefault();
    setModalError('');

    if (form.entry_type === 'INCOME' && !form.customer_id) {
      setModalError('Selecione um cliente para a receita.');
      return;
    }

    if (form.entry_type === 'EXPENSE' && !(form.supplier_name_snapshot || '').trim()) {
      setModalError('Informe o fornecedor para o custo.');
      return;
    }

    const payload = normalizePayload(form);
    if (!payload.category || !payload.description || !payload.entry_date || !payload.amount) {
      setModalError('Preencha categoria, descricao, data e valor.');
      return;
    }

    try {
      if (modal === 'new') {
        await createFinanceEntry(payload);
      } else if (selected) {
        await updateFinanceEntry(selected.id, payload);
      }
      setModal(null);
      setSelected(null);
      await load();
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao salvar lancamento.');
    }
  }

  async function quickMarkAsPaid(entry) {
    try {
      await updateFinanceEntryStatus(entry.id, { status: 'PAID' });
      await load();
    } catch {
      setError('Nao foi possivel atualizar status para pago.');
    }
  }

  const dreRevenue = Number(summary?.revenue_total || 0);
  const dreExpense = Number(summary?.expense_total || 0);
  const dreNet = Number(summary?.net_profit || 0);
  const dreMargin = Number(summary?.margin_percent || 0);

  return (
    <div className={`sales-page process-theme ${resolvedProcessType === 'DRAWING' ? 'process-theme--drawing' : resolvedProcessType === 'FDM' ? 'process-theme--fdm' : 'process-theme--resina'}`}>
      <div className="sales-page-header">
        <Button variant="ghost" type="button" onClick={onBack}>
          {'<-'} Voltar
        </Button>
        <h2>Controle Financeiro</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="button" onClick={() => openNew('INCOME')}>
            + Nova receita
          </Button>
          <Button variant="outline" type="button" onClick={() => openNew('EXPENSE')}>
            + Novo custo
          </Button>
        </div>
      </div>

      <div className="sales-filters" style={{ paddingBottom: '10px' }}>
        <div className="sales-filters-row">
          <Button className={`btn ${activeType === 'INCOME' ? 'btn-primary' : 'btn-outline'}`} type="button" onClick={() => switchType('INCOME')}>Receitas</Button>
          <Button className={`btn ${activeType === 'EXPENSE' ? 'btn-primary' : 'btn-outline'}`} type="button" onClick={() => switchType('EXPENSE')}>Custos</Button>
        </div>
      </div>

      <form className="sales-filters" onSubmit={applyFilters}>
        <div className="sales-filters-row">
          <label className="filter-field">
            <span>De</span>
            <Input type="date" value={filters.start_date} onChange={(e) => setFilters((p) => ({ ...p, start_date: e.target.value }))} />
          </label>
          <label className="filter-field">
            <span>Ate</span>
            <Input type="date" value={filters.end_date} onChange={(e) => setFilters((p) => ({ ...p, end_date: e.target.value }))} />
          </label>
          <label className="filter-field">
            <span>Status</span>
            <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
              <option value="">Todos</option>
              {Object.entries(ENTRY_STATUSES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Processo</span>
            <select value={filters.process_type} onChange={(e) => setFilters((p) => ({ ...p, process_type: e.target.value }))}>
              <option value="">Todos</option>
              {Object.entries(PROCESS_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
          <label className="filter-field filter-field--wide">
            <span>Buscar</span>
            <Input
              type="text"
              placeholder="Descricao, categoria, cliente, fornecedor"
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
            />
          </label>
          <div className="filter-actions">
            <Button type="submit">Buscar</Button>
            <Button variant="outline" type="button" onClick={clearFilters}>Limpar</Button>
          </div>
        </div>
      </form>

      {error && <p className="form-error" style={{ padding: '12px 28px' }}>{error}</p>}

      <section className="kpi-grid" style={{ padding: '20px 28px 0 28px' }}>
        <div className="kpi-card">
          <p className="kpi-label">Receita</p>
          <h2 className="kpi-value">{formatCurrency(summary?.revenue_total || 0)}</h2>
          <span className="muted">competencia</span>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Custos</p>
          <h2 className="kpi-value">{formatCurrency(summary?.expense_total || 0)}</h2>
          <span className="muted">competencia</span>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Lucro liquido</p>
          <h2 className="kpi-value">{formatCurrency(summary?.net_profit || 0)}</h2>
          <span className="muted">margem {Number(summary?.margin_percent || 0).toFixed(1)}%</span>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">A receber atrasado</p>
          <h2 className="kpi-value">{formatCurrency(summary?.overdue_receivable || 0)}</h2>
          <span className="muted">pendente total {formatCurrency(summary?.pending_receivable || 0)}</span>
        </div>
      </section>

      <section className="dashboard-grid" style={{ padding: '20px 28px 0 28px' }}>
        <div className="chart-panel">
          <div className="panel-header">
            <h3>DRE do periodo</h3>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            <p><strong>Receita bruta:</strong> {formatCurrency(dreRevenue)}</p>
            <p><strong>(-) Custos e despesas:</strong> {formatCurrency(dreExpense)}</p>
            <p><strong>(=) Lucro liquido:</strong> {formatCurrency(dreNet)}</p>
            <p><strong>Margem liquida:</strong> {dreMargin.toFixed(1)}%</p>
          </div>
        </div>
        <div className="quick-panel">
          <div className="panel-header">
            <h3>Resumo financeiro</h3>
          </div>
          <ul>
            <li>Entrada de caixa: <strong>{formatCurrency(summary?.cash_in || 0)}</strong></li>
            <li>Saida de caixa: <strong>{formatCurrency(summary?.cash_out || 0)}</strong></li>
            <li>Saldo de caixa: <strong>{formatCurrency(summary?.cash_balance || 0)}</strong></li>
            <li>A pagar pendente: <strong>{formatCurrency(summary?.pending_payable || 0)}</strong></li>
          </ul>
        </div>
      </section>

      <div className="sales-page-table-wrap">
        {loading ? (
          <p className="muted" style={{ padding: '24px' }}>Carregando...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descricao</th>
                <th>Categoria</th>
                <th>{activeType === 'INCOME' ? 'Cliente' : 'Fornecedor'}</th>
                <th>Processo</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Pago em</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="10" className="muted" style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum lancamento encontrado.
                  </td>
                </tr>
              ) : entries.map((entry) => (
                <tr key={entry.id} className="row-clickable" onClick={() => openEdit(entry)}>
                  <td>{formatDate(entry.entry_date)}</td>
                  <td><strong>{entry.description}</strong></td>
                  <td>{entry.category}</td>
                  <td>{entry.entry_type === 'INCOME' ? (entry.customer_name_snapshot || '-') : (entry.supplier_name_snapshot || '-')}</td>
                  <td>{PROCESS_TYPES[entry.process_type] || entry.process_type}</td>
                  <td><span className="pill" data-variant={entry.status === 'PAID' ? 'ok' : entry.status === 'CANCELLED' ? 'accent' : 'warn'}>{ENTRY_STATUSES[entry.status] || entry.status}</span></td>
                  <td>{formatCurrency(entry.amount || 0)}</td>
                  <td>{formatDate(entry.due_date)}</td>
                  <td>{formatDate(entry.paid_date)}</td>
                  <td>
                    {entry.status === 'PENDING' ? (
                      <Button
                        variant="ghost"
                        className="btn--xs"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          quickMarkAsPaid(entry);
                        }}
                      >
                        Marcar pago
                      </Button>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modal === 'new' || modal === 'edit') && (
        <Modal title={form.entry_type === 'INCOME' ? (modal === 'new' ? 'Nova receita' : 'Editar receita') : (modal === 'new' ? 'Novo custo' : 'Editar custo')} onClose={() => setModal(null)}>
          <form className="form-grid" onSubmit={submitForm}>
            <label>
              Tipo
              <Input type="text" value={ENTRY_TYPES[form.entry_type]} disabled />
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                {Object.entries(ENTRY_STATUSES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>

            {form.entry_type === 'INCOME' ? (
              <label>
                Cliente
                <select
                  required
                  value={form.customer_id}
                  onChange={(e) => {
                    const id = e.target.value;
                    const customer = customers.find((c) => c.id === id);
                    setForm((p) => ({
                      ...p,
                      customer_id: id,
                      customer_name_snapshot: customer ? customer.name : '',
                    }));
                  }}
                >
                  <option value="">Selecione</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
            ) : (
              <label>
                Fornecedor
                <Input
                  type="text"
                  required
                  value={form.supplier_name_snapshot}
                  onChange={(e) => setForm((p) => ({ ...p, supplier_name_snapshot: e.target.value }))}
                />
              </label>
            )}

            <label>
              Categoria
              <Input type="text" required value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
            </label>
            <label>
              Valor
              <Input type="number" min="0" step="0.01" required value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
            </label>
            <label>
              Data (competencia)
              <Input type="date" required value={form.entry_date} onChange={(e) => setForm((p) => ({ ...p, entry_date: e.target.value }))} />
            </label>
            <label>
              Vencimento
              <Input type="date" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} />
            </label>
            <label>
              Pago em
              <Input type="date" value={form.paid_date} onChange={(e) => setForm((p) => ({ ...p, paid_date: e.target.value }))} />
            </label>
            <label>
              Processo
              <select value={form.process_type} onChange={(e) => setForm((p) => ({ ...p, process_type: e.target.value }))}>
                {Object.entries(PROCESS_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              Metodo de pagamento
              <select value={form.payment_method} onChange={(e) => setForm((p) => ({ ...p, payment_method: e.target.value }))}>
                <option value="">Nao informado</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Descricao
              <Input type="text" required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Observacoes
              <Textarea rows="3" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
            </label>
            {modalError && <p className="form-error" style={{ gridColumn: '1 / -1' }}>{modalError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', gridColumn: '1 / -1' }}>
              <Button variant="outline" type="button" onClick={() => setModal(null)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
