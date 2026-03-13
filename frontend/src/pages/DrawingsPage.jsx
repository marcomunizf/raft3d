import * as T from 'react';
import Modal from '../components/Modal.jsx';
import CustomerSearch from '../domains/customers/CustomerSearch.jsx';
import {
  createDrawing,
  deleteDrawing,
  fetchDrawingDesigners,
  fetchDrawings,
  sendDrawingToProduction,
  updateDrawing,
} from '../domains/drawings/drawings.service.js';
import { formatCurrency, formatDate } from '../domains/shared/formatters.js';

const DRAWING_STATUSES = [
  { key: 'ORCAMENTO', label: 'Orcamento' },
  { key: 'DESENHANDO', label: 'Desenhando' },
  { key: 'PRONTO', label: 'Desenho Pronto' },
  { key: 'ENVIAR_PARA_PRODUCAO', label: 'Enviar para Producao' },
];
const SLA_LABELS = {
  'sla-red': 'Urgente',
  'sla-yellow': 'Atencao',
  'sla-green': 'No prazo',
};

function getDrawingSlaVariant(endDate, status) {
  if (!endDate || status === 'ENVIAR_PARA_PRODUCAO') return 'sla-green';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(endDate);
  deadline.setHours(0, 0, 0, 0);
  const days = Math.floor((deadline - now) / 86400000);

  // Desenho com ate 2 dias de prazo entra como urgente.
  if (days <= 2) return 'sla-red';
  if (days <= 4) return 'sla-yellow';
  return 'sla-green';
}

function parseMoneyValue(value) {
  if (value === '' || value === null || typeof value === 'undefined') return null;
  const parsed = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

export default function DrawingsPage({
  permissions = [],
  onBack,
  embedded = false,
  createSignal = 0,
}) {
  const [drawings, setDrawings] = T.useState([]);
  const [loading, setLoading] = T.useState(false);
  const [error, setError] = T.useState('');
  const [showCreate, setShowCreate] = T.useState(false);
  const [selectedDrawing, setSelectedDrawing] = T.useState(null);
  const [designers, setDesigners] = T.useState([]);
  const [draggingId, setDraggingId] = T.useState(null);
  const [overColumn, setOverColumn] = T.useState(null);
  const lastCreateSignalRef = T.useRef(createSignal);
  const [detailForm, setDetailForm] = T.useState({
    drawing_value: '',
    print_value: '',
  });
  const [form, setForm] = T.useState({
    title: '',
    description: '',
    customer_id: null,
    customer_name_snapshot: '',
    type: 'RESINA',
    designer_id: '',
    start_date: '',
    end_date: '',
    drawing_value: '',
    print_value: '',
  });

  const canManage = permissions.includes('projetista') || permissions.includes('producao');

  const loadDrawings = T.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDrawings();
      setDrawings(Array.isArray(data) ? data : []);
    } catch {
      setError('Erro ao carregar desenhos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDesigners = T.useCallback(async () => {
    try {
      const data = await fetchDrawingDesigners();
      setDesigners(Array.isArray(data) ? data : []);
    } catch {
      setDesigners([]);
    }
  }, []);

  T.useEffect(() => {
    loadDrawings();
    loadDesigners();
  }, [loadDrawings, loadDesigners]);

  T.useEffect(() => {
    if (!embedded || !canManage || !createSignal) return;
    if (createSignal <= lastCreateSignalRef.current) return;
    lastCreateSignalRef.current = createSignal;
    setShowCreate(true);
  }, [embedded, canManage, createSignal]);

  T.useEffect(() => {
    if (!selectedDrawing) return;
    setDetailForm({
      drawing_value:
        selectedDrawing.drawing_value === null || typeof selectedDrawing.drawing_value === 'undefined'
          ? ''
          : String(selectedDrawing.drawing_value),
      print_value:
        selectedDrawing.print_value === null || typeof selectedDrawing.print_value === 'undefined'
          ? ''
          : String(selectedDrawing.print_value),
    });
  }, [selectedDrawing]);

  const handleMove = async (drawing, nextStatus) => {
    if (!drawing || !nextStatus || drawing.status === nextStatus) return;
    setLoading(true);
    setError('');
    try {
      if (nextStatus === 'ENVIAR_PARA_PRODUCAO') {
        if (drawing.status !== 'PRONTO') {
          setError('Somente desenhos em "Desenho Pronto" podem ser enviados para producao.');
          return;
        }
        await sendDrawingToProduction(drawing.id);
      } else {
        await updateDrawing(drawing.id, { status: nextStatus });
      }
      await loadDrawings();
    } catch {
      setError('Erro ao atualizar o status do desenho.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      customer_id: null,
      customer_name_snapshot: '',
      type: 'RESINA',
      designer_id: '',
      start_date: '',
      end_date: '',
      drawing_value: '',
      print_value: '',
    });
  };

  const handleCreate = async () => {
    setError('');

    if (!form.title.trim()) {
      setError('O titulo e obrigatorio.');
      return;
    }

    try {
      await createDrawing({
        title: form.title,
        description: form.description && form.description.trim() ? form.description.trim() : undefined,
        customer_id: form.customer_id || null,
        customer_name_snapshot: form.customer_name_snapshot || null,
        type: form.type,
        designer_id: form.designer_id || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        drawing_value: parseMoneyValue(form.drawing_value),
        print_value: parseMoneyValue(form.print_value),
      });

      setShowCreate(false);
      resetForm();
      await loadDrawings();
    } catch {
      setError('Erro ao criar orcamento de desenho.');
    }
  };

  const handleDragStart = (event, drawingId) => {
    setDraggingId(drawingId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event, columnKey) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setOverColumn(columnKey);
  };

  const handleDrop = async (event, columnKey) => {
    event.preventDefault();
    setOverColumn(null);
    if (!draggingId) return;

    const drawing = drawings.find((item) => item.id === draggingId);
    setDraggingId(null);
    if (!drawing) return;

    await handleMove(drawing, columnKey);
  };

  const grouped = DRAWING_STATUSES.reduce((acc, status) => {
    acc[status.key] = drawings.filter((drawing) => drawing.status === status.key);
    return acc;
  }, {});

  const statusLabelByKey = DRAWING_STATUSES.reduce((acc, item) => {
    acc[item.key] = item.label;
    return acc;
  }, {});

  const handleSaveValues = async () => {
    if (!selectedDrawing) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        drawing_value: parseMoneyValue(detailForm.drawing_value),
        print_value: parseMoneyValue(detailForm.print_value),
      };
      await updateDrawing(selectedDrawing.id, payload);
      setSelectedDrawing((prev) => (prev ? { ...prev, ...payload } : prev));
      await loadDrawings();
    } catch {
      setError('Erro ao salvar valores do desenho.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrawing = async () => {
    if (!selectedDrawing) return;
    const confirmed = window.confirm('Tem certeza que deseja excluir este desenho?');
    if (!confirmed) return;

    setLoading(true);
    setError('');
    try {
      await deleteDrawing(selectedDrawing.id);
      setSelectedDrawing(null);
      await loadDrawings();
    } catch {
      setError('Erro ao excluir desenho.');
    } finally {
      setLoading(false);
    }
  };

  const board = (
    <section className="kanban-board" style={{ gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))' }}>
      {DRAWING_STATUSES.map((status) => (
        <div
          key={status.key}
          className={`kanban-column${overColumn === status.key ? ' kanban-column--over' : ''}`}
          onDragOver={(event) => handleDragOver(event, status.key)}
          onDragLeave={() => setOverColumn(null)}
          onDrop={(event) => handleDrop(event, status.key)}
        >
          <div className="kanban-column-header">
            <h3>{status.label}</h3>
            <span className="kanban-count">{(grouped[status.key] || []).length}</span>
          </div>
          <div className="kanban-cards">
            {(grouped[status.key] || []).map((drawing) => (
              <div
                key={drawing.id}
                className={`kanban-card kanban-card--${getDrawingSlaVariant(drawing.end_date, drawing.status)}${draggingId === drawing.id ? ' kanban-card--dragging' : ''}`}
                draggable={canManage}
                onDragStart={(event) => handleDragStart(event, drawing.id)}
              >
                <div className="kanban-card-top">
                  <span className="kanban-card-client">{drawing.customer_name_snapshot || drawing.title}</span>
                  <span className={`sla-badge sla-badge--${getDrawingSlaVariant(drawing.end_date, drawing.status)}`}>
                    {SLA_LABELS[getDrawingSlaVariant(drawing.end_date, drawing.status)]}
                  </span>
                </div>
                <div className="kanban-card-file">
                  {drawing.title}
                </div>
                <div className="kanban-card-meta">
                  <span className="kanban-card-value">{formatCurrency(drawing.drawing_value)}</span>
                  <span className="kanban-card-date">Entrega: {formatDate(drawing.end_date)}</span>
                </div>
                <div className="muted" style={{ fontSize: '13px' }}>
                  Impressao: {drawing.print_value == null ? '-' : formatCurrency(drawing.print_value)}
                </div>
                <div className="muted" style={{ fontSize: '13px' }}>
                  Projetista: {drawing.designer_name || '-'}
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="pill pill--status">{statusLabelByKey[drawing.status] || drawing.status}</span>
                  <span className="tag">{drawing.type === 'FDM' ? 'FDM' : 'Resina'}</span>
                </div>

                {status.key === 'ENVIAR_PARA_PRODUCAO' && (
                  <div className="muted" style={{ fontSize: '12px' }}>
                    Enviado para orcamento de {drawing.type === 'FDM' ? 'FDM' : 'Resina'}
                  </div>
                )}

                <div className="kanban-card-footer">
                  <button
                    className="btn btn-ghost btn-card-detail"
                    type="button"
                    onClick={() => setSelectedDrawing(drawing)}
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}

            {!loading && (grouped[status.key] || []).length === 0 && (
              <p className="kanban-empty muted">Nenhum desenho</p>
            )}
            {loading && <div className="muted">Carregando...</div>}
          </div>
        </div>
      ))}
    </section>
  );

  const createModal = showCreate && (
    <Modal title="Novo orcamento" onClose={() => setShowCreate(false)}>
      <div className="modal-section">
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            handleCreate();
          }}
        >
          <label style={{ gridColumn: '1 / -1' }}>
            Titulo
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            Cliente
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

          <label>
            Tipo
            <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}>
              <option value="RESINA">Resina</option>
              <option value="FDM">FDM</option>
            </select>
          </label>

          <label>
            Projetista
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

          <label>
            Inicio do desenho
            <input
              type="date"
              value={form.start_date}
              onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
            />
          </label>

          <label>
            Fim do desenho
            <input
              type="date"
              value={form.end_date}
              onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
            />
          </label>

          <label>
            Valor do desenho (R$)
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.drawing_value}
              onChange={(event) => setForm((prev) => ({ ...prev, drawing_value: event.target.value }))}
              placeholder="0,00"
            />
          </label>

          <label>
            Valor da impressao (R$)
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.print_value}
              onChange={(event) => setForm((prev) => ({ ...prev, print_value: event.target.value }))}
              placeholder="Opcional"
            />
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            Descricao
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>

          {error && (
            <div className="form-error" style={{ gridColumn: '1 / -1' }}>
              {error}
            </div>
          )}

          <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
            <button className="btn btn-primary" type="submit">
              Criar orcamento
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setShowCreate(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );

  const detailModal = selectedDrawing && (
    <Modal title="Detalhes do desenho" onClose={() => setSelectedDrawing(null)}>
      <div className="modal-section">
        <div className="detail-header">
          <h3>{selectedDrawing.title}</h3>
          <p className="muted">Cliente: {selectedDrawing.customer_name_snapshot || '-'}</p>
          <p className="muted">Tipo: {selectedDrawing.type === 'FDM' ? 'FDM' : 'Resina'}</p>
        </div>
        <div className="form-grid">
          <label>
            Projetista
            <input type="text" value={selectedDrawing.designer_name || '-'} readOnly />
          </label>
          <label>
            Status
            <input
              type="text"
              value={DRAWING_STATUSES.find((item) => item.key === selectedDrawing.status)?.label || selectedDrawing.status}
              readOnly
            />
          </label>
          <label>
            Valor do desenho (R$)
            <input
              type="number"
              step="0.01"
              min="0"
              value={detailForm.drawing_value}
              onChange={(event) => setDetailForm((prev) => ({ ...prev, drawing_value: event.target.value }))}
            />
          </label>
          <label>
            Valor da impressao (R$)
            <input
              type="number"
              step="0.01"
              min="0"
              value={detailForm.print_value}
              onChange={(event) => setDetailForm((prev) => ({ ...prev, print_value: event.target.value }))}
              placeholder="Preencher depois"
            />
          </label>
          <label>
            Inicio do desenho
            <input type="text" value={formatDate(selectedDrawing.start_date)} readOnly />
          </label>
          <label>
            Fim do desenho
            <input type="text" value={formatDate(selectedDrawing.end_date)} readOnly />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Descricao
            <textarea rows={3} value={selectedDrawing.description || '-'} readOnly />
          </label>
        </div>
        <div className="modal-actions">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={handleDeleteDrawing}
            style={{ color: '#b14c24', borderColor: '#e4b79a' }}
          >
            Excluir desenho
          </button>
          <button className="btn btn-primary" type="button" onClick={handleSaveValues}>
            Salvar valores
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => setSelectedDrawing(null)}>
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );

  if (embedded) {
    return (
      <>
        {error && <div className="alert alert-error">{error}</div>}
        {board}
        {createModal}
        {detailModal}
      </>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div className="dashboard">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">Desenho</p>
              <h1>Kanban de Desenhos</h1>
              <span className="muted">Gerencie desenhos tecnicos e envie para producao</span>
            </div>
            <div className="user-menu" style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost" type="button" onClick={onBack}>
                Voltar
              </button>
              {canManage && (
                <button className="btn btn-primary" type="button" onClick={() => setShowCreate(true)}>
                  + Orçamento
                </button>
              )}
            </div>
          </header>

          {error && <div className="alert alert-error">{error}</div>}
          {board}
        </div>
      </div>
      {createModal}
      {detailModal}
    </div>
  );
}
