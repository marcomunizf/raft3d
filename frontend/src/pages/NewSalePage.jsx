import { useEffect, useMemo, useState } from 'react';
import CustomerSearch from '../domains/customers/CustomerSearch.jsx';
import { createSale } from '../domains/sales/sales.service.js';
import { createEmptySaleForm, createEmptySaleItem } from '../domains/sales/sales.forms.js';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, PAYMENT_STATUSES, PAYMENT_STATUS_LABELS, SALE_STATUSES, STATUS_LABELS } from '../domains/sales/sales.constants.js';
import { fetchMaterials } from '../domains/inventory/materials.service.js';
import { formatCurrency } from '../domains/shared/formatters.js';

function uniqueSorted(values) {
  return Array.from(new Set((values || []).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
}

export default function NewSalePage({ onBack, onSaved, defaultType = 'RESINA', availableTypes = ['RESINA', 'FDM'], processType = 'RESINA' }) {
  const singleType = availableTypes.length === 1 ? availableTypes[0] : null;
  const initialType = singleType || defaultType || 'RESINA';

  const [form, setForm] = useState({ ...createEmptySaleForm(initialType), items: [] });
  const [draftItem, setDraftItem] = useState(createEmptySaleItem());
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const resolvedProcessType = processType === 'DRAWING' ? 'DRAWING' : processType === 'FDM' ? 'FDM' : 'RESINA';

  useEffect(() => {
    fetchMaterials().then(setMaterials).catch(() => setMaterials([]));
  }, []);

  const itemTotal = useMemo(() => {
    return (form.items || []).reduce((sum, item) => sum + Number(item.line_total || 0), 0);
  }, [form.items]);

  function addItem() {
    setError('');
    const value = Number(draftItem.line_total || 0);
    if (!(draftItem.description || '').trim() || !(value > 0)) {
      setError('Preencha nome do arquivo e valor do item.');
      return;
    }

    const next = {
      description: draftItem.description,
      qty: 1,
      unit_price: value,
      line_total: value,
      item_type: draftItem.item_type || '',
      item_color: draftItem.item_color || '',
      weight_grams: draftItem.weight_grams === '' ? null : Number(draftItem.weight_grams),
      print_time_hours: draftItem.print_time_hours === '' ? null : Number(draftItem.print_time_hours),
      is_done: false,
    };

    setForm((prev) => ({ ...prev, items: [...(prev.items || []), next] }));
    setDraftItem(createEmptySaleItem());
  }

  function removeItem(index) {
    setForm((prev) => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (!form.items || form.items.length === 0) {
      setError('Adicione pelo menos um item na venda.');
      return;
    }

    setSaving(true);
    try {
      await createSale({
        ...form,
        subtotal: itemTotal,
        discount_total: 0,
        total: itemTotal,
        material_type: null,
        material_color: null,
        weight_grams: null,
        print_time_hours: null,
        due_date: form.due_date || null,
        payment_method: form.payment_method || null,
        customer_name_snapshot: form.customer_name_snapshot || 'Venda generica',
        items: (form.items || []).map((item) => ({
          ...item,
          qty: 1,
          unit_price: Number(item.line_total || item.unit_price || 0),
          line_total: Number(item.line_total || 0),
        })),
      });

      if (typeof onSaved === 'function') {
        await onSaved();
      }
      onBack?.();
    } catch (err) {
      const detail = err?.response?.data?.details?.[0]?.message;
      setError(detail ? detail.replaceAll('"', '') : (err?.response?.data?.message || 'Erro ao salvar venda.'));
    } finally {
      setSaving(false);
    }
  }

  const materialTypes = uniqueSorted(materials.filter((m) => m.process === form.type).map((m) => m.type));
  const materialColors = uniqueSorted(materials.filter((m) => m.process === form.type).map((m) => m.color));

  return (
    <div className={`sales-page process-theme ${resolvedProcessType === 'DRAWING' ? 'process-theme--drawing' : resolvedProcessType === 'FDM' ? 'process-theme--fdm' : 'process-theme--resina'}`}>
      <div className="sales-page-header">
        <button className="btn btn-ghost" type="button" onClick={onBack}>{'<-'} Voltar</button>
        <h2>Nova venda</h2>
        <button className="btn btn-primary" type="button" onClick={submit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar venda'}</button>
      </div>

      <form className="sales-filters" onSubmit={submit}>
        <div className="sales-filters-row">
          <label className="filter-field filter-field--wide">
            <span>Cliente</span>
            <CustomerSearch
              value={form.customer_name_snapshot}
              onSelect={(id, name) => setForm((prev) => ({ ...prev, customer_id: id, customer_name_snapshot: name }))}
              placeholder="Buscar por nome ou CPF/CNPJ"
            />
          </label>
        </div>

        <div className="sales-filters-row" style={{ marginTop: '12px' }}>
          <label className="filter-field">
            <span>Data da venda</span>
            <input type="date" required value={form.sale_date} onChange={(e) => setForm((prev) => ({ ...prev, sale_date: e.target.value }))} />
          </label>
          <label className="filter-field">
            <span>Previsao de entrega</span>
            <input type="date" value={form.due_date} onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))} />
          </label>
          <label className="filter-field">
            <span>Processo</span>
            <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
              {availableTypes.map((t) => <option key={t} value={t}>{t === 'RESINA' ? 'Resina' : 'FDM'}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Status do pedido</span>
            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              {SALE_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Status do pagamento</span>
            <select value={form.payment_status} onChange={(e) => setForm((prev) => ({ ...prev, payment_status: e.target.value }))}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s] || s}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Forma de pagamento</span>
            <select value={form.payment_method} onChange={(e) => setForm((prev) => ({ ...prev, payment_method: e.target.value }))}>
              <option value="">Nao informado</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m] || m}</option>)}
            </select>
          </label>
        </div>
      </form>

      <div className="sales-page-table-wrap" style={{ paddingTop: '14px' }}>
        <h3 style={{ marginBottom: '10px' }}>Adicionar item</h3>
        <div className="sales-filters-row" style={{ marginBottom: '12px' }}>
          <label className="filter-field filter-field--wide"><span>Nome do arquivo</span><input type="text" value={draftItem.description} onChange={(e) => setDraftItem((p) => ({ ...p, description: e.target.value }))} /></label>
          <label className="filter-field"><span>Tipo</span><><input type="text" list={`new-sale-item-type-${form.type}`} value={draftItem.item_type || ''} onChange={(e) => setDraftItem((p) => ({ ...p, item_type: e.target.value }))} /><datalist id={`new-sale-item-type-${form.type}`}>{materialTypes.map((v) => <option key={v} value={v} />)}</datalist></></label>
          <label className="filter-field"><span>Cor</span><><input type="text" list={`new-sale-item-color-${form.type}`} value={draftItem.item_color || ''} onChange={(e) => setDraftItem((p) => ({ ...p, item_color: e.target.value }))} /><datalist id={`new-sale-item-color-${form.type}`}>{materialColors.map((v) => <option key={v} value={v} />)}</datalist></></label>
          <label className="filter-field"><span>{form.type === 'FDM' ? 'Peso (g)' : 'Volume (ml)'}</span><input type="number" min="0" step="0.01" value={draftItem.weight_grams || ''} onChange={(e) => setDraftItem((p) => ({ ...p, weight_grams: e.target.value }))} /></label>
          <label className="filter-field"><span>Tempo (h)</span><input type="number" min="0" step="0.01" value={draftItem.print_time_hours || ''} onChange={(e) => setDraftItem((p) => ({ ...p, print_time_hours: e.target.value }))} /></label>
          <label className="filter-field"><span>Valor</span><input type="number" min="0" step="0.01" value={draftItem.line_total || ''} onChange={(e) => setDraftItem((p) => ({ ...p, line_total: e.target.value }))} /></label>
          <div className="filter-actions"><button className="btn btn-outline" type="button" onClick={addItem}>+ criar</button></div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Tipo</th>
              <th>Cor</th>
              <th>{form.type === 'FDM' ? 'Peso (g)' : 'Volume (ml)'}</th>
              <th>Tempo</th>
              <th>Valor</th>
              <th>Acao</th>
            </tr>
          </thead>
          <tbody>
            {(form.items || []).length === 0 ? (
              <tr><td colSpan="7" className="muted" style={{ textAlign: 'center', padding: '24px' }}>Nenhum item adicionado.</td></tr>
            ) : (
              (form.items || []).map((item, index) => (
                <tr key={`new-sale-item-${index}`}>
                  <td>{item.description}</td>
                  <td>{item.item_type || '-'}</td>
                  <td>{item.item_color || '-'}</td>
                  <td>{item.weight_grams ?? '-'}</td>
                  <td>{item.print_time_hours ?? '-'}</td>
                  <td>{formatCurrency(item.line_total || 0)}</td>
                  <td><button className="btn btn-ghost btn--xs" type="button" onClick={() => removeItem(index)}>Excluir</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Valor total: {formatCurrency(itemTotal)}</strong>
          <button className="btn btn-primary" type="button" onClick={submit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar venda'}</button>
        </div>

        <div style={{ marginTop: '14px' }}>
          <label className="filter-field filter-field--wide">
            <span>Observacoes</span>
            <textarea rows="3" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </label>
        </div>

        {error && <p className="form-error" style={{ marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
}
