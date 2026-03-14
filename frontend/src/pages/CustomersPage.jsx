import { useState, useEffect } from 'react';
import Modal from '../components/Modal.jsx';
import { fetchCustomers, createCustomer, updateCustomer, fetchCustomerSales } from '../domains/customers/customers.service.js';
import { createEmptyCustomerForm } from '../domains/customers/customers.forms.js';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, STATUS_LABELS } from '../domains/sales/sales.constants.js';
import { formatDate, formatCurrency, formatDateTime } from '../domains/shared/formatters.js';

const EMPTY_FORM = createEmptyCustomerForm();

export default function CustomersPage({ onBack, processType = 'RESINA' }) {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modal, setModal] = useState(null); // 'new' | 'edit'
  const [newForm, setNewForm] = useState({ ...EMPTY_FORM });
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [customerSales, setCustomerSales] = useState([]);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    load('');
  }, []);

  async function load(q) {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCustomers(q ? { q } : {});
      setCustomers(data);
    } catch {
      setError('Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(value) {
    setQuery(value);
    clearTimeout(handleSearchChange._timer);
    handleSearchChange._timer = setTimeout(() => load(value), 280);
  }

  function openEdit(customer) {
    setSelected(customer);
    setEditForm({
      type: customer.type,
      name: customer.name,
      phone: customer.phone,
      document: customer.document || '',
      email: customer.email || '',
      notes: customer.notes || '',
    });
    setCustomerSales([]);
    setModalError('');
    setModal('edit');
    fetchCustomerSales(customer.id).then(setCustomerSales).catch(() => {});
  }

  async function handleCreate(e) {
    e.preventDefault();
    setModalError('');
    try {
      await createCustomer(newForm);
      setModal(null);
      setNewForm({ ...EMPTY_FORM });
      load(query);
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao salvar cliente.');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setModalError('');
    try {
      await updateCustomer(selected.id, editForm);
      setModal(null);
      setSelected(null);
      load(query);
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao atualizar cliente.');
    }
  }

  const resolvedProcessType = processType === 'DRAWING' ? 'DRAWING' : processType === 'FDM' ? 'FDM' : 'RESINA';

  return (
    <div className={`sales-page process-theme ${resolvedProcessType === 'DRAWING' ? 'process-theme--drawing' : resolvedProcessType === 'FDM' ? 'process-theme--fdm' : 'process-theme--resina'}`}>
      <div className="sales-page-header">
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          ← Voltar
        </button>
        <h2>Clientes</h2>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setNewForm({ ...EMPTY_FORM });
            setModalError('');
            setModal('new');
          }}
        >
          + Novo cliente
        </button>
      </div>

      <div className="sales-filters">
        <div className="sales-filters-row">
          <label className="filter-field filter-field--wide">
            <span>Buscar</span>
            <input
              type="text"
              placeholder="Nome, CPF/CNPJ..."
              value={query}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </label>
        </div>
      </div>

      {error && <p className="form-error" style={{ padding: '0 24px' }}>{error}</p>}

      <div className="sales-page-table-wrap">
        {loading ? (
          <p className="muted" style={{ padding: '24px' }}>Carregando...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>CPF/CNPJ</th>
                <th>Telefone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="muted" style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="row-clickable" onClick={() => openEdit(c)}>
                    <td><strong>{c.name}</strong></td>
                    <td><span className="pill">{c.type}</span></td>
                    <td>{c.document || '—'}</td>
                    <td>{c.phone}</td>
                    <td>{c.email || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'new' && (
        <Modal title="Novo cliente" onClose={() => setModal(null)}>
          <div className="modal-section">
            <form className="form-grid" onSubmit={handleCreate}>
              <label>
                Nome
                <input
                  type="text"
                  placeholder="Nome completo ou razao social"
                  required
                  value={newForm.name}
                  onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label>
                Tipo
                <select value={newForm.type} onChange={e => setNewForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="PF">Pessoa Fisica</option>
                  <option value="PJ">Pessoa Juridica</option>
                </select>
              </label>
              <label>
                Telefone / WhatsApp
                <input
                  type="text"
                  placeholder="11 99999-0000"
                  value={newForm.phone}
                  onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))}
                />
              </label>
              <label>
                CPF / CNPJ
                <input
                  type="text"
                  placeholder="Opcional"
                  value={newForm.document}
                  onChange={e => setNewForm(p => ({ ...p, document: e.target.value }))}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  placeholder="Opcional"
                  value={newForm.email}
                  onChange={e => setNewForm(p => ({ ...p, email: e.target.value }))}
                />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Observacoes
                <input
                  type="text"
                  placeholder="Opcional"
                  value={newForm.notes}
                  onChange={e => setNewForm(p => ({ ...p, notes: e.target.value }))}
                />
              </label>
              {modalError && <div className="form-error" style={{ gridColumn: '1 / -1' }}>{modalError}</div>}
              <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                <button className="btn btn-primary" type="submit">Salvar</button>
                <button className="btn btn-ghost" type="button" onClick={() => setModal(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {modal === 'edit' && selected && editForm && (
        <Modal
          title={(selected.name) || 'Editar cliente'}
          onClose={() => { setModal(null); setSelected(null); }}
        >
          <div className="modal-section">
            <form className="form-grid" onSubmit={handleUpdate}>
              <label>
                Nome
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label>
                Tipo
                <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="PF">Pessoa Fisica</option>
                  <option value="PJ">Pessoa Juridica</option>
                </select>
              </label>
              <label>
                Telefone / WhatsApp
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                />
              </label>
              <label>
                CPF / CNPJ
                <input
                  type="text"
                  value={editForm.document}
                  onChange={e => setEditForm(p => ({ ...p, document: e.target.value }))}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Observacoes
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                />
              </label>
              {modalError && <div className="form-error" style={{ gridColumn: '1 / -1' }}>{modalError}</div>}
              <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                <button className="btn btn-primary" type="submit">Salvar alteracoes</button>
                <button className="btn btn-ghost" type="button" onClick={() => { setModal(null); setSelected(null); }}>Cancelar</button>
              </div>
            </form>

            <div className="customer-sales-section">
              <h4>Pedidos do cliente</h4>
              {customerSales.length === 0 ? (
                <p className="muted">Nenhum pedido encontrado.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Item / Arquivo</th>
                      <th>Total</th>
                      <th>Entrega</th>
                      <th>Pagamento</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerSales.map(s => (
                      <tr key={s.id}>
                        <td>{formatDate(s.sale_date)}</td>
                        <td>{s.file_name || '—'}</td>
                        <td>{formatCurrency(s.total)}</td>
                        <td>{formatDate(s.due_date)}</td>
                        <td>
                          <span className={`pill pill--pay pill--pay-${s.payment_status?.toLowerCase()}`}>
                            {PAYMENT_STATUS_LABELS[s.payment_status] || s.payment_status}
                          </span>
                        </td>
                        <td>
                          <span className="pill pill--status">
                            {STATUS_LABELS[s.status] || s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
