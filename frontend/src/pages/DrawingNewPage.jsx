import CustomerSearch from '../domains/customers/CustomerSearch.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function DrawingNewPage({
  form,
  setForm,
  designers = [],
  loading = false,
  error = '',
  onBack,
  onCreate,
}) {
  return (
    <div className="sales-page process-theme process-theme--drawing">
      <div className="sales-page-header">
        <Button variant="ghost" type="button" onClick={onBack}>
          {'<-'} Voltar para kanban
        </Button>
        <h2>Novo orcamento de desenho</h2>
        <Button type="button" onClick={onCreate} disabled={loading}>
          {loading ? 'Salvando...' : 'Criar orcamento'}
        </Button>
      </div>

      <form className="sales-filters" onSubmit={(event) => { event.preventDefault(); onCreate(); }}>
        <p className="new-sale-section-label">Dados do desenho</p>
        <div className="sales-filters-row">
          <label className="filter-field filter-field--wide">
            <span>Cliente</span>
            <CustomerSearch
              value={form.customer_name_snapshot || ''}
              onSelect={(customerId, customerName) =>
                setForm((prev) => ({
                  ...prev,
                  customer_id: customerId,
                  customer_name_snapshot: customerName || '',
                }))
              }
              placeholder="Buscar por nome ou CPF/CNPJ"
            />
          </label>
          <label className="filter-field">
            <span>Tipo</span>
            <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}>
              <option value="RESINA">Resina</option>
              <option value="FDM">FDM</option>
            </select>
          </label>
          <label className="filter-field">
            <span>Projetista</span>
            <select
              value={form.designer_id}
              onChange={(event) => setForm((prev) => ({ ...prev, designer_id: event.target.value }))}
            >
              <option value="">Nao selecionado</option>
              {designers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Fim do desenho</span>
            <Input
              type="date"
              value={form.end_date}
              onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
            />
          </label>
        </div>
      </form>

      <div className="sales-page-table-wrap" style={{ paddingTop: '14px' }}>
        <p className="new-sale-section-label">Valores e descricao</p>
        <div className="sales-filters-row" style={{ marginBottom: '12px' }}>
          <label className="filter-field">
            <span>Valor do desenho (R$)</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.drawing_value}
              onChange={(event) => setForm((prev) => ({ ...prev, drawing_value: event.target.value }))}
              placeholder="0,00"
            />
          </label>
          <label className="filter-field">
            <span>Valor da impressao (R$)</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.print_value}
              onChange={(event) => setForm((prev) => ({ ...prev, print_value: event.target.value }))}
              placeholder="Opcional"
            />
          </label>
        </div>
        <label className="filter-field filter-field--wide">
          <span>Descricao</span>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>

        {error && <p className="form-error" style={{ marginTop: '10px' }}>{error}</p>}

      </div>
    </div>
  );
}
