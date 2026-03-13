import { useState, useEffect } from 'react';
import Modal from '../components/Modal.jsx';
import { fetchInventory, createInventoryItem, updateInventoryItem, fetchInventoryItemLog } from '../domains/inventory/inventory.service.js';
import { formatDateTime } from '../domains/shared/formatters.js';
import { createEmptyItemForm } from '../domains/inventory/inventory.forms.js';
import { MEASURE_OPTIONS } from '../domains/inventory/inventory.constants.js';

const EMPTY_FORM = createEmptyItemForm();

export default function InventoryPage({ onBack, defaultType = 'RESINA', availableTypes = ['RESINA', 'FDM'] }) {
  const singleType = availableTypes.length === 1 ? availableTypes[0] : null;
  const initialType = singleType || defaultType;

  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modal, setModal] = useState(null); // 'new' | 'edit' | 'log'
  const [newForm, setNewForm] = useState({ ...EMPTY_FORM, type: initialType });
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [modalError, setModalError] = useState('');
  const [logEntries, setLogEntries] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    load(initialType);
  }, []);

  async function load(type) {
    setLoading(true);
    setError('');
    try {
      const params = type ? { type } : {};
      const data = await fetchInventory(params);
      setItems(data);
    } catch {
      setError('Erro ao carregar estoque.');
    } finally {
      setLoading(false);
    }
  }

  function handleTypeFilter(type) {
    setTypeFilter(type);
    load(type);
  }

  function openEdit(item) {
    setSelected(item);
    setEditForm({
      name: item.name,
      brand: item.brand || '',
      category: item.category,
      type: item.type,
      unit: item.unit,
      current_qty: String(item.current_qty),
      min_qty: String(item.min_qty),
    });
    setModalError('');
    setModal('edit');
  }

  async function openLog(item, e) {
    e.stopPropagation();
    setSelected(item);
    setLogEntries([]);
    setLogLoading(true);
    setModal('log');
    try {
      const data = await fetchInventoryItemLog(item.id);
      setLogEntries(data);
    } catch {
      setLogEntries([]);
    } finally {
      setLogLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setModalError('');
    try {
      await createInventoryItem({
        ...newForm,
        min_qty: Number(newForm.min_qty) || 0,
        current_qty: Number(newForm.current_qty) || 0,
      });
      setModal(null);
      setNewForm({ ...EMPTY_FORM, type: initialType });
      load(typeFilter);
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao salvar item.');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setModalError('');
    try {
      await updateInventoryItem(selected.id, {
        ...editForm,
        min_qty: Number(editForm.min_qty),
        current_qty: Number(editForm.current_qty),
      });
      setModal(null);
      setSelected(null);
      load(typeFilter);
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao atualizar item.');
    }
  }

  return (
    <div className="sales-page">
      <div className="sales-page-header">
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          ← Voltar
        </button>
        <h2>Estoque</h2>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setNewForm({ ...EMPTY_FORM, type: initialType });
            setModalError('');
            setModal('new');
          }}
        >
          + Novo item
        </button>
      </div>

      {availableTypes.length > 1 && (
        <div className="sales-filters">
          <div className="sales-filters-row">
            <label className="filter-field">
              <span>Tipo</span>
              <select value={typeFilter} onChange={e => handleTypeFilter(e.target.value)}>
                <option value="">Todos</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{t === 'FDM' ? 'FDM' : 'Resina'}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {error && <p className="form-error" style={{ padding: '0 24px' }}>{error}</p>}

      <div className="sales-page-table-wrap">
        {loading ? (
          <p className="muted" style={{ padding: '24px' }}>Carregando...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Marca</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Qtd atual</th>
                <th>Minimo</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="muted" style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum item no estoque.
                  </td>
                </tr>
              ) : (
                items.map(item => {
                  const low = Number(item.current_qty) <= Number(item.min_qty);
                  return (
                    <tr key={item.id} className="row-clickable" onClick={() => openEdit(item)}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.brand || '—'}</td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            background: item.type === 'FDM' ? 'var(--raft-magenta)' : 'var(--raft-green)',
                            color: '#fff',
                          }}
                        >
                          {item.type === 'FDM' ? 'FDM' : 'Resina'}
                        </span>
                      </td>
                      <td>{item.category === 'RAW_MATERIAL' ? 'Mat. prima' : 'Consumivel'}</td>
                      <td>{Number(item.current_qty)} {item.unit}</td>
                      <td>{Number(item.min_qty)} {item.unit}</td>
                      <td>
                        <span className={`pill pill--${low ? 'sla-red' : 'sla-green'}`}>
                          {low ? 'Baixo' : 'OK'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn--xs"
                          type="button"
                          onClick={e => openLog(item, e)}
                          title="Ver historico"
                        >
                          📋 Log
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'new' && (
        <Modal title="Novo item de estoque" onClose={() => setModal(null)}>
          <div className="modal-section">
            <form className="form-grid" onSubmit={handleCreate}>
              <label>
                Nome
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label>
                Marca
                <input
                  type="text"
                  value={newForm.brand}
                  onChange={e => setNewForm(p => ({ ...p, brand: e.target.value }))}
                />
              </label>
              <label>
                Tipo
                <select
                  value={newForm.type}
                  onChange={e => setNewForm(p => ({ ...p, type: e.target.value }))}
                  disabled={availableTypes.length === 1}
                >
                  {availableTypes.map(t => (
                    <option key={t} value={t}>{t === 'FDM' ? 'FDM' : 'Resina'}</option>
                  ))}
                </select>
              </label>
              <label>
                Categoria
                <select value={newForm.category} onChange={e => setNewForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="RAW_MATERIAL">Materia-prima</option>
                  <option value="CONSUMABLE">Consumivel</option>
                </select>
              </label>
              <label>
                Medida
                <select value={newForm.unit} onChange={e => setNewForm(p => ({ ...p, unit: e.target.value }))}>
                  {MEASURE_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
              <label>
                Qtd atual
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  required
                  value={newForm.current_qty}
                  onChange={e => setNewForm(p => ({ ...p, current_qty: e.target.value }))}
                />
              </label>
              <label>
                Qtd minima
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  required
                  value={newForm.min_qty}
                  onChange={e => setNewForm(p => ({ ...p, min_qty: e.target.value }))}
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
        <Modal title={`Editar: ${selected.name}`} onClose={() => { setModal(null); setSelected(null); }}>
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
                Marca
                <input
                  type="text"
                  value={editForm.brand}
                  onChange={e => setEditForm(p => ({ ...p, brand: e.target.value }))}
                />
              </label>
              <label>
                Tipo
                <select
                  value={editForm.type}
                  onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}
                  disabled={availableTypes.length === 1}
                >
                  {availableTypes.map(t => (
                    <option key={t} value={t}>{t === 'FDM' ? 'FDM' : 'Resina'}</option>
                  ))}
                </select>
              </label>
              <label>
                Categoria
                <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="RAW_MATERIAL">Materia-prima</option>
                  <option value="CONSUMABLE">Consumivel</option>
                </select>
              </label>
              <label>
                Medida
                <select value={editForm.unit} onChange={e => setEditForm(p => ({ ...p, unit: e.target.value }))}>
                  {MEASURE_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
              <label>
                Qtd atual
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  required
                  value={editForm.current_qty}
                  onChange={e => setEditForm(p => ({ ...p, current_qty: e.target.value }))}
                />
              </label>
              <label>
                Qtd minima
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  required
                  value={editForm.min_qty}
                  onChange={e => setEditForm(p => ({ ...p, min_qty: e.target.value }))}
                />
              </label>
              {modalError && <div className="form-error" style={{ gridColumn: '1 / -1' }}>{modalError}</div>}
              <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                <button className="btn btn-primary" type="submit">Salvar alteracoes</button>
                <button className="btn btn-ghost" type="button" onClick={() => { setModal(null); setSelected(null); }}>Cancelar</button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {modal === 'log' && selected && (
        <Modal
          title={`Historico: ${selected.name}`}
          onClose={() => { setModal(null); setSelected(null); }}
        >
          <div className="modal-section">
            {logLoading ? (
              <p className="muted">Carregando...</p>
            ) : logEntries.length === 0 ? (
              <p className="muted">Nenhum registro encontrado.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data / Hora</th>
                    <th>Usuario</th>
                    <th>Acao</th>
                    <th>Alteracoes</th>
                  </tr>
                </thead>
                <tbody>
                  {logEntries.map(entry => (
                    <tr key={entry.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(entry.created_at)}</td>
                      <td>{entry.username || '—'}</td>
                      <td>
                        <span className={`pill pill--${entry.action === 'CREATE' ? 'sla-green' : entry.action === 'DELETE' ? 'sla-red' : 'sla-yellow'}`}>
                          {entry.action === 'CREATE' ? 'Criado' : entry.action === 'UPDATE' ? 'Editado' : 'Desativado'}
                        </span>
                      </td>
                      <td>
                        <LogData data={entry.data} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

const ACTION_LABELS = {
  name: 'Nome',
  brand: 'Marca',
  category: 'Categoria',
  type: 'Tipo',
  unit: 'Medida',
  current_qty: 'Qtd atual',
  min_qty: 'Qtd minima',
  is_active: 'Ativo',
};

function LogData({ data }) {
  if (!data || Object.keys(data).length === 0) return <span className="muted">—</span>;
  const entries = Object.entries(data).filter(([k]) => k !== 'entity');
  if (entries.length === 0) return <span className="muted">—</span>;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '13px' }}>
      {entries.map(([key, val]) => (
        <li key={key}>
          <strong>{ACTION_LABELS[key] || key}:</strong>{' '}
          {val === null || val === undefined ? '—' : String(val)}
        </li>
      ))}
    </ul>
  );
}
