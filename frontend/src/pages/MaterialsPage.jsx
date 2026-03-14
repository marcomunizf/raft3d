import { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import { getMaterialLabel, PROCESS_LABELS } from '../domains/inventory/materials.constants.js';
import { deactivateMaterial, fetchMaterials, updateMaterial } from '../domains/inventory/materials.service.js';

const EMPTY_FILTERS = {
  process: '',
  type: '',
  brand: '',
  color: '',
};

export default function MaterialsPage({ onBack, defaultType = 'RESINA', availableTypes = ['RESINA', 'FDM'], processType = 'RESINA' }) {
  const singleType = availableTypes.length === 1 ? availableTypes[0] : null;
  const initialType = singleType || defaultType || '';

  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, process: initialType });
  const [materials, setMaterials] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ process: 'RESINA', type: '', color: '', brand: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    load({ ...EMPTY_FILTERS, process: initialType });
    loadAllMaterials();
  }, []);

  async function load(nextFilters) {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (nextFilters.process) params.process = nextFilters.process;
      if (nextFilters.type) params.type = nextFilters.type;
      if (nextFilters.brand) params.brand = nextFilters.brand;
      if (nextFilters.color) params.color = nextFilters.color;
      const data = await fetchMaterials(params);
      setMaterials(data);
    } catch {
      setError('Erro ao carregar materiais.');
    } finally {
      setLoading(false);
    }
  }

  async function loadAllMaterials() {
    try {
      const data = await fetchMaterials();
      setAllMaterials(data);
    } catch {
      setAllMaterials([]);
    }
  }

  function handleFilter(field, value) {
    const next = { ...filters, [field]: value };
    setFilters(next);
    load(next);
  }

  async function handleDelete(item) {
    const ok = window.confirm(`Tem certeza que deseja excluir o material ${item.brand} - ${item.type} - ${item.color}?`);
    if (!ok) return;

    setError('');
    setDeletingId(item.id);
    try {
      await deactivateMaterial(item.id);
      await load(filters);
      await loadAllMaterials();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setError('Nao foi possivel excluir: material em uso no estoque ativo. Desative os itens de estoque vinculados e tente novamente.');
      } else {
        setError(err?.response?.data?.message || 'Erro ao excluir material.');
      }
    } finally {
      setDeletingId('');
    }
  }

  function openEdit(item) {
    setError('');
    setEditingItem(item);
    setEditForm({
      process: item.process || 'RESINA',
      type: item.type || '',
      color: item.color || '',
      brand: item.brand || '',
    });
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingItem) return;

    setError('');
    setSavingEdit(true);
    try {
      await updateMaterial(editingItem.id, editForm);
      await load(filters);
      await loadAllMaterials();
      setEditingItem(null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setError('Nao foi possivel salvar: ja existe material com o mesmo Processo, Tipo, Cor e Marca.');
      } else {
        setError(err?.response?.data?.message || 'Erro ao atualizar material.');
      }
    } finally {
      setSavingEdit(false);
    }
  }

  const typeOptions = unique(materials.map(m => m.type));
  const brandOptions = unique(materials.map(m => m.brand));
  const colorOptions = unique(materials.map(m => m.color));
  const editTypeOptions = unique(
    allMaterials
      .filter(m => m.process === editForm.process)
      .map(m => m.type),
  );
  const editColorOptions = unique(
    allMaterials
      .filter(m => m.process === editForm.process)
      .map(m => m.color),
  );
  const editBrandOptions = unique(
    allMaterials
      .filter(m => m.process === editForm.process)
      .map(m => m.brand),
  );

  const resolvedProcessType = processType === 'DRAWING' ? 'DRAWING' : (processType || initialType || 'RESINA') === 'FDM' ? 'FDM' : 'RESINA';

  return (
    <div className={`sales-page process-theme ${resolvedProcessType === 'DRAWING' ? 'process-theme--drawing' : resolvedProcessType === 'FDM' ? 'process-theme--fdm' : 'process-theme--resina'}`}>
      <div className="sales-page-header">
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          {'<-'} Voltar
        </button>
        <h2>Lista de materiais</h2>
      </div>

      <form className="sales-filters" onSubmit={e => e.preventDefault()}>
        <div className="sales-filters-row">
          <label className="filter-field">
            <span>Processo</span>
            <select value={filters.process} onChange={e => handleFilter('process', e.target.value)}>
              <option value="">Todos</option>
              {availableTypes.map(t => (
                <option key={t} value={t}>{PROCESS_LABELS[t] || t}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Tipo</span>
            <select value={filters.type} onChange={e => handleFilter('type', e.target.value)}>
              <option value="">Todos</option>
              {typeOptions.map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Marca</span>
            <select value={filters.brand} onChange={e => handleFilter('brand', e.target.value)}>
              <option value="">Todas</option>
              {brandOptions.map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Cor</span>
            <select value={filters.color} onChange={e => handleFilter('color', e.target.value)}>
              <option value="">Todas</option>
              {colorOptions.map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
      </form>

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
                <th>Processo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr>
                  <td colSpan="4" className="muted" style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum material cadastrado.
                  </td>
                </tr>
              ) : (
                materials.map(item => (
                  <tr key={item.id}>
                    <td><strong>{getMaterialLabel(item.process, item.type, item.color)}</strong></td>
                    <td>{item.brand}</td>
                    <td>{PROCESS_LABELS[item.process] || item.process}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn--xs"
                        type="button"
                        onClick={() => openEdit(item)}
                        disabled={deletingId === item.id}
                        title="Editar material"
                        style={{ marginRight: '8px' }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-ghost btn--xs"
                        type="button"
                        onClick={() => handleDelete(item)}
                        title="Excluir material"
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {editingItem && (
        <Modal title="Editar material" onClose={() => setEditingItem(null)}>
          <div className="modal-section">
            <form className="form-grid" onSubmit={handleSaveEdit}>
              <label>
                Processo
                <select
                  value={editForm.process}
                  onChange={e => setEditForm(prev => ({ ...prev, process: e.target.value }))}
                >
                  {availableTypes.map(t => (
                    <option key={t} value={t}>{PROCESS_LABELS[t] || t}</option>
                  ))}
                </select>
              </label>
              <label>
                Tipo
                <input
                  type="text"
                  required
                  list={`edit-material-type-${editForm.process}`}
                  value={editForm.type}
                  onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                />
                <datalist id={`edit-material-type-${editForm.process}`}>
                  {editTypeOptions.map(value => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </label>
              <label>
                Cor
                <input
                  type="text"
                  required
                  list={`edit-material-color-${editForm.process}`}
                  value={editForm.color}
                  onChange={e => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                />
                <datalist id={`edit-material-color-${editForm.process}`}>
                  {editColorOptions.map(value => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </label>
              <label>
                Marca
                <input
                  type="text"
                  required
                  list={`edit-material-brand-${editForm.process}`}
                  value={editForm.brand}
                  onChange={e => setEditForm(prev => ({ ...prev, brand: e.target.value }))}
                />
                <datalist id={`edit-material-brand-${editForm.process}`}>
                  {editBrandOptions.map(value => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </label>
              <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                <button className="btn btn-primary" type="submit" disabled={savingEdit}>
                  {savingEdit ? 'Salvando...' : 'Salvar'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setEditingItem(null)} disabled={savingEdit}>
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
