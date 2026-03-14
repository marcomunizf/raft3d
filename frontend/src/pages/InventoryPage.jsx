import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import {
  createInventoryItem,
  fetchInventory,
  fetchInventoryItemLog,
  updateInventoryItem,
} from '../domains/inventory/inventory.service.js';
import {
  createMaterial,
  fetchMaterials,
} from '../domains/inventory/materials.service.js';
import {
  DEFAULT_MATERIALS_BY_PROCESS,
  getMaterialLabel,
  PROCESS_LABELS,
} from '../domains/inventory/materials.constants.js';
import { formatDateTime } from '../domains/shared/formatters.js';

const EMPTY_STOCK_FORM = {
  process: 'RESINA',
  brand: '',
  material_type: '',
  material_color: '',
  current_qty: '',
  min_qty: '',
};

const EMPTY_MATERIAL_FORM = {
  process: 'RESINA',
  type: '',
  color: '',
  brand: '',
};

export default function InventoryPage({
  onBack,
  onOpenMaterials,
  defaultType = 'RESINA',
  processType = 'RESINA',
  availableTypes = ['RESINA', 'FDM'],
}) {
  const singleType = availableTypes.length === 1 ? availableTypes[0] : null;
  const initialType = singleType || defaultType;

  const [items, setItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error, setError] = useState('');

  const [modal, setModal] = useState(null); // 'new' | 'edit' | 'log' | 'new-material'
  const [newForm, setNewForm] = useState({ ...EMPTY_STOCK_FORM, process: initialType || 'RESINA' });
  const [newMaterialForm, setNewMaterialForm] = useState({ ...EMPTY_MATERIAL_FORM, process: initialType || 'RESINA' });
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [modalError, setModalError] = useState('');
  const [logEntries, setLogEntries] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    load(initialType);
    loadMaterials();
  }, []);

  const materialOptions = useMemo(() => {
    return buildMaterialOptions(materials, initialType);
  }, [materials, initialType]);

  async function load(type) {
    setLoading(true);
    setError('');
    try {
      const params = type ? { process: type } : {};
      const data = await fetchInventory(params);
      setItems(data);
    } catch {
      setError('Erro ao carregar estoque.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMaterials() {
    setLoadingMaterials(true);
    try {
      const data = await fetchMaterials();
      setMaterials(data);
    } catch {
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  }

  function handleTypeFilter(type) {
    setTypeFilter(type);
    load(type);
  }

  function openEdit(item) {
    const process = item.process || item.type || initialType || 'RESINA';
    setSelected(item);
    setEditForm({
      process,
      brand: item.material_brand || item.brand || '',
      material_type: item.material_type || '',
      material_color: item.material_color || '',
      current_qty: String(item.current_qty ?? ''),
      min_qty: String(item.min_qty ?? ''),
      material_id: item.material_id || '',
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

  function resolveMaterialId(form) {
    const byCombo = materials.find(m =>
      m.process === form.process &&
      normalizeText(m.brand) === normalizeText(form.brand) &&
      normalizeText(m.type) === normalizeText(form.material_type) &&
      normalizeText(m.color) === normalizeText(form.material_color)
    );

    return byCombo?.id || '';
  }

  async function handleCreate(e) {
    e.preventDefault();
    setModalError('');

    const materialId = resolveMaterialId(newForm);
    if (!materialId) {
      setModalError('Material não encontrado. Cadastre o material antes de criar o estoque.');
      return;
    }

    try {
      await createInventoryItem({
        material_id: materialId,
        current_qty: Number(newForm.current_qty) || 0,
        min_qty: Number(newForm.min_qty) || 0,
      });
      setModal(null);
      setNewForm({ ...EMPTY_STOCK_FORM, process: initialType || 'RESINA' });
      await load(typeFilter);
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao salvar item.');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setModalError('');

    const materialId = resolveMaterialId(editForm);
    if (!materialId) {
      setModalError('Material não encontrado. Selecione um material cadastrado.');
      return;
    }

    try {
      await updateInventoryItem(selected.id, {
        material_id: materialId,
        current_qty: Number(editForm.current_qty),
        min_qty: Number(editForm.min_qty),
      });
      setModal(null);
      setSelected(null);
      await load(typeFilter);
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao atualizar item.');
    }
  }

  async function handleCreateMaterial(e) {
    e.preventDefault();
    setModalError('');

    try {
      await createMaterial({
        process: newMaterialForm.process,
        type: newMaterialForm.type,
        color: newMaterialForm.color,
        brand: newMaterialForm.brand,
      });
      await loadMaterials();
      setModal(null);
      setNewMaterialForm({ ...EMPTY_MATERIAL_FORM, process: initialType || 'RESINA' });
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Erro ao cadastrar material.');
    }
  }

  const resolvedProcessType = processType === 'DRAWING' ? 'DRAWING' : (processType || initialType || 'RESINA') === 'FDM' ? 'FDM' : 'RESINA';

  return (
    <div className={`sales-page process-theme ${resolvedProcessType === 'DRAWING' ? 'process-theme--drawing' : resolvedProcessType === 'FDM' ? 'process-theme--fdm' : 'process-theme--resina'}`}>
      <div className="sales-page-header">
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          {'<-'} Voltar
        </button>
        <h2>Estoque</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setModalError('');
              setNewMaterialForm({ ...EMPTY_MATERIAL_FORM, process: initialType || 'RESINA' });
              setModal('new-material');
            }}
          >
            Cadastro de material
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => onOpenMaterials?.()}>
            Lista de materiais
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              setModalError('');
              setNewForm({ ...EMPTY_STOCK_FORM, process: initialType || 'RESINA' });
              setModal('new');
            }}
          >
            + Novo item
          </button>
        </div>
      </div>

      {availableTypes.length > 1 && (
        <div className="sales-filters">
          <div className="sales-filters-row">
            <label className="filter-field">
              <span>Processo</span>
              <select value={typeFilter} onChange={e => handleTypeFilter(e.target.value)}>
                <option value="">Todos</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{PROCESS_LABELS[t] || t}</option>
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
                <th>Qtd atual</th>
                <th>Qtd mínima</th>
                <th>Status</th>
                <th>Log</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="muted" style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum item no estoque.
                  </td>
                </tr>
              ) : (
                items.map(item => {
                  const process = item.process || item.type || 'RESINA';
                  const low = Number(item.current_qty) <= Number(item.min_qty);
                  const label = item.material_type || item.material_color
                    ? getMaterialLabel(process, item.material_type, item.material_color)
                    : item.name || '-';
                  return (
                    <tr key={item.id} className="row-clickable" onClick={() => openEdit(item)}>
                      <td><strong>{label}</strong></td>
                      <td>{item.material_brand || item.brand || '-'}</td>
                      <td>{Number(item.current_qty)}</td>
                      <td>{Number(item.min_qty)}</td>
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
                          title="Ver histórico"
                        >
                          Log
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
            <StockForm
              form={newForm}
              setForm={setNewForm}
              onSubmit={handleCreate}
              availableTypes={availableTypes}
              materials={materials}
              materialOptions={materialOptions}
              modalError={modalError}
              submitLabel="Salvar"
            />
          </div>
        </Modal>
      )}

      {modal === 'edit' && selected && editForm && (
        <Modal title="Editar item de estoque" onClose={() => { setModal(null); setSelected(null); }}>
          <div className="modal-section">
            <StockForm
              form={editForm}
              setForm={setEditForm}
              onSubmit={handleUpdate}
              availableTypes={availableTypes}
              materials={materials}
              materialOptions={materialOptions}
              modalError={modalError}
              submitLabel="Salvar alterações"
            />
          </div>
        </Modal>
      )}

      {modal === 'new-material' && (
        <Modal title="Cadastro de material" onClose={() => setModal(null)}>
          <div className="modal-section">
            <form className="form-grid" onSubmit={handleCreateMaterial}>
              <label>
                Processo
                <select
                  value={newMaterialForm.process}
                  onChange={e => setNewMaterialForm(prev => ({ ...prev, process: e.target.value }))}
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
                  list={`material-types-${newMaterialForm.process}`}
                  value={newMaterialForm.type}
                  onChange={e => setNewMaterialForm(prev => ({ ...prev, type: e.target.value }))}
                />
                <datalist id={`material-types-${newMaterialForm.process}`}>
                  {materialOptions[newMaterialForm.process].types.map(value => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </label>
              <label>
                Cor
                <input
                  type="text"
                  required
                  list={`material-colors-${newMaterialForm.process}`}
                  value={newMaterialForm.color}
                  onChange={e => setNewMaterialForm(prev => ({ ...prev, color: e.target.value }))}
                />
                <datalist id={`material-colors-${newMaterialForm.process}`}>
                  {materialOptions[newMaterialForm.process].colors.map(value => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </label>
              <label>
                Marca
                <input
                  type="text"
                  required
                  list={`material-brands-${newMaterialForm.process}`}
                  value={newMaterialForm.brand}
                  onChange={e => setNewMaterialForm(prev => ({ ...prev, brand: e.target.value }))}
                />
                <datalist id={`material-brands-${newMaterialForm.process}`}>
                  {materialOptions[newMaterialForm.process].brands.map(value => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </label>

              {loadingMaterials && <div className="muted">Carregando sugestões...</div>}
              {modalError && <div className="form-error" style={{ gridColumn: '1 / -1' }}>{modalError}</div>}
              <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                <button className="btn btn-primary" type="submit">Salvar</button>
                <button className="btn btn-ghost" type="button" onClick={() => setModal(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {modal === 'log' && selected && (
        <Modal title="Histórico de estoque" onClose={() => { setModal(null); setSelected(null); }}>
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
                    <th>Usuário</th>
                    <th>Ação</th>
                    <th>Alterações</th>
                  </tr>
                </thead>
                <tbody>
                  {logEntries.map(entry => (
                    <tr key={entry.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(entry.created_at)}</td>
                      <td>{entry.username || '-'}</td>
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

function StockForm({
  form,
  setForm,
  onSubmit,
  availableTypes,
  materials,
  materialOptions,
  modalError,
  submitLabel,
}) {
  const options = getStockSelectOptions(materials, materialOptions, form);

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label>
        Processo
        <select
          value={form.process}
          onChange={e => setForm(prev => ({
            ...prev,
            process: e.target.value,
            brand: '',
            material_type: '',
            material_color: '',
          }))}
          disabled={availableTypes.length === 1}
        >
          {availableTypes.map(t => (
            <option key={t} value={t}>{PROCESS_LABELS[t] || t}</option>
          ))}
        </select>
      </label>
      <label>
        Marca
        <select
          required
          value={form.brand}
          onChange={e => setForm(prev => ({ ...prev, brand: e.target.value, material_type: '', material_color: '' }))}
        >
          <option value="">Selecione</option>
          {options.brands.map(value => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Tipo
        <select
          required
          value={form.material_type}
          onChange={e => setForm(prev => ({ ...prev, material_type: e.target.value, material_color: '' }))}
        >
          <option value="">Selecione</option>
          {options.types.map(value => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Cor
        <select
          required
          value={form.material_color}
          onChange={e => setForm(prev => ({ ...prev, material_color: e.target.value }))}
        >
          <option value="">Selecione</option>
          {options.colors.map(value => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Quantidade atual
        <input
          type="number"
          min="0"
          step="0.001"
          required
          value={form.current_qty}
          onChange={e => setForm(prev => ({ ...prev, current_qty: e.target.value }))}
        />
      </label>
      <label>
        Quantidade mínima
        <input
          type="number"
          min="0"
          step="0.001"
          required
          value={form.min_qty}
          onChange={e => setForm(prev => ({ ...prev, min_qty: e.target.value }))}
        />
      </label>

      {modalError && <div className="form-error" style={{ gridColumn: '1 / -1' }}>{modalError}</div>}
      <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
        <button className="btn btn-primary" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}

const ACTION_LABELS = {
  material_id: 'Material',
  process: 'Processo',
  name: 'Nome',
  brand: 'Marca',
  category: 'Categoria',
  type: 'Tipo',
  unit: 'Medida',
  current_qty: 'Qtd atual',
  min_qty: 'Qtd mínima',
  is_active: 'Ativo',
};

function LogData({ data }) {
  if (!data || Object.keys(data).length === 0) return <span className="muted">-</span>;
  const entries = Object.entries(data).filter(([k]) => k !== 'entity');
  if (entries.length === 0) return <span className="muted">-</span>;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '13px' }}>
      {entries.map(([key, val]) => (
        <li key={key}>
          <strong>{ACTION_LABELS[key] || key}:</strong>{' '}
          {val === null || val === undefined ? '-' : String(val)}
        </li>
      ))}
    </ul>
  );
}

function normalizeText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function uniqSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function buildMaterialOptions(materials, fallbackType) {
  const base = {
    RESINA: {
      types: [...DEFAULT_MATERIALS_BY_PROCESS.RESINA.types],
      colors: [...DEFAULT_MATERIALS_BY_PROCESS.RESINA.colors],
      brands: [...DEFAULT_MATERIALS_BY_PROCESS.RESINA.brands],
    },
    FDM: {
      types: [...DEFAULT_MATERIALS_BY_PROCESS.FDM.types],
      colors: [...DEFAULT_MATERIALS_BY_PROCESS.FDM.colors],
      brands: [...DEFAULT_MATERIALS_BY_PROCESS.FDM.brands],
    },
  };

  for (const material of materials) {
    if (!base[material.process]) continue;
    base[material.process].types.push(material.type);
    base[material.process].colors.push(material.color);
    base[material.process].brands.push(material.brand);
  }

  base.RESINA.types = uniqSorted(base.RESINA.types);
  base.RESINA.colors = uniqSorted(base.RESINA.colors);
  base.RESINA.brands = uniqSorted(base.RESINA.brands);
  base.FDM.types = uniqSorted(base.FDM.types);
  base.FDM.colors = uniqSorted(base.FDM.colors);
  base.FDM.brands = uniqSorted(base.FDM.brands);

  if (!base[fallbackType]) {
    base[fallbackType] = { types: [], colors: [], brands: [] };
  }

  return base;
}

function getStockSelectOptions(materials, materialOptions, form) {
  const process = form.process || 'RESINA';
  const source = materialOptions[process] || { brands: [], types: [], colors: [] };
  const scoped = materials.filter(m => m.process === process);
  const brands = scoped.length ? uniqSorted(scoped.map(m => m.brand)) : source.brands;
  const types = scoped.length
    ? uniqSorted(scoped.filter(m => !form.brand || normalizeText(m.brand) === normalizeText(form.brand)).map(m => m.type))
    : source.types;
  const colors = scoped.length
    ? uniqSorted(scoped.filter(m =>
      (!form.brand || normalizeText(m.brand) === normalizeText(form.brand)) &&
      (!form.material_type || normalizeText(m.type) === normalizeText(form.material_type))
    ).map(m => m.color))
    : source.colors;

  return {
    brands,
    types,
    colors,
  };
}
