import * as T from 'react';
import DrawingDetailsPage from './DrawingDetailsPage.jsx';
import DrawingNewPage from './DrawingNewPage.jsx';
import {
  createDrawing,
  fetchDrawingDesigners,
  fetchDrawings,
  sendDrawingToProduction,
  updateDrawing,
} from '../domains/drawings/drawings.service.js';
import { formatCurrency, formatDate } from '../domains/shared/formatters.js';
import { getDrawingSlaVariant } from '../domains/shared/dates.js';
import { Button } from '@/components/ui/button';

const DRAWING_STATUSES = [
  { key: 'ORCAMENTO', label: 'Orcamento' },
  { key: 'DESENHANDO', label: 'Desenhando' },
  { key: 'PRONTO', label: 'Desenho Pronto' },
  { key: 'IMPRESSAO_TESTE', label: 'Impressao de teste' },
  { key: 'ENVIAR_PARA_PRODUCAO', label: 'Enviar para Producao' },
];
const SLA_LABELS = {
  'sla-red': 'Urgente',
  'sla-yellow': 'Atencao',
  'sla-green': 'No prazo',
};

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
  const [detailDrawingId, setDetailDrawingId] = T.useState(null);
  const [designers, setDesigners] = T.useState([]);
  const [draggingId, setDraggingId] = T.useState(null);
  const [overColumn, setOverColumn] = T.useState(null);
  const lastCreateSignalRef = T.useRef(createSignal);
  const [form, setForm] = T.useState({
    description: '',
    customer_id: null,
    customer_name_snapshot: '',
    type: 'RESINA',
    designer_id: '',
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

  const handleMove = async (drawing, nextStatus) => {
    if (!drawing || !nextStatus || drawing.status === nextStatus) return;
    setLoading(true);
    setError('');
    try {
      if (nextStatus === 'ENVIAR_PARA_PRODUCAO') {
        if (drawing.status !== 'IMPRESSAO_TESTE') {
          setError('Somente desenhos em "Impressao de teste" podem ser enviados para producao.');
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
      description: '',
      customer_id: null,
      customer_name_snapshot: '',
      type: 'RESINA',
      designer_id: '',
      end_date: '',
      drawing_value: '',
      print_value: '',
    });
  };

  const handleCreate = async () => {
    setError('');

    try {
      await createDrawing({
        description: form.description && form.description.trim() ? form.description.trim() : undefined,
        customer_id: form.customer_id || null,
        customer_name_snapshot: form.customer_name_snapshot || null,
        type: form.type,
        designer_id: form.designer_id || null,
        end_date: form.end_date || null,
        drawing_value: parseMoneyValue(form.drawing_value),
        print_value: parseMoneyValue(form.print_value),
      });

      setShowCreate(false);
      resetForm();
      await loadDrawings();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao criar orcamento de desenho.');
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

  const board = (
    <section className="kanban-board" style={{ gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))' }}>
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
                  <Button
                    variant="ghost"
                    type="button"
                    className="btn-card-detail"
                    onClick={() => setDetailDrawingId(drawing.id)}
                  >
                    Ver detalhes
                  </Button>
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

  if (detailDrawingId) {
    return (
      <DrawingDetailsPage
        drawingId={detailDrawingId}
        onBackToKanban={() => setDetailDrawingId(null)}
        onChanged={loadDrawings}
        canManage={canManage}
      />
    );
  }

  if (showCreate) {
    return (
      <DrawingNewPage
        form={form}
        setForm={setForm}
        designers={designers}
        loading={loading}
        error={error}
        onBack={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    );
  }

  if (embedded) {
    return (
      <>
        {error && <div className="alert alert-error">{error}</div>}
        {board}
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
              <Button variant="ghost" type="button" onClick={onBack}>
                Voltar
              </Button>
              {canManage && (
                <Button type="button" onClick={() => setShowCreate(true)}>
                  + Orcamento
                </Button>
              )}
            </div>
          </header>

          {error && <div className="alert alert-error">{error}</div>}
          {board}
        </div>
      </div>
    </div>
  );
}

