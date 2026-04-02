import { useEffect, useState } from 'react';
import {
  deleteDrawing,
  fetchDrawingById,
  updateDrawing,
} from '../domains/drawings/drawings.service.js';
import { formatCurrency, formatDate } from '../domains/shared/formatters.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DRAWING_STATUS_LABELS = {
  ORCAMENTO: 'Orcamento',
  DESENHANDO: 'Desenhando',
  PRONTO: 'Desenho Pronto',
  IMPRESSAO_TESTE: 'Impressao de teste',
  ENVIAR_PARA_PRODUCAO: 'Enviar para Producao',
};

function parseMoneyValue(value) {
  if (value === '' || value === null || typeof value === 'undefined') return null;
  const parsed = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

export default function DrawingDetailsPage({
  drawingId,
  onBackToKanban,
  onChanged,
  canManage = false,
}) {
  const [drawing, setDrawing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [valuesForm, setValuesForm] = useState({
    drawing_value: '',
    print_value: '',
  });

  useEffect(() => {
    if (!drawingId) return;
    let active = true;
    setLoading(true);
    setError('');
    fetchDrawingById(drawingId)
      .then((data) => {
        if (!active) return;
        setDrawing(data);
        setValuesForm({
          drawing_value:
            data?.drawing_value === null || typeof data?.drawing_value === 'undefined'
              ? ''
              : String(data.drawing_value),
          print_value:
            data?.print_value === null || typeof data?.print_value === 'undefined'
              ? ''
              : String(data.print_value),
        });
      })
      .catch((err) => {
        if (!active) return;
        setDrawing(null);
        setError(err?.response?.data?.message || 'Erro ao carregar detalhes do desenho.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [drawingId]);

  async function handleSaveValues(e) {
    e.preventDefault();
    if (!drawing) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        drawing_value: parseMoneyValue(valuesForm.drawing_value),
        print_value: parseMoneyValue(valuesForm.print_value),
      };
      const updated = await updateDrawing(drawing.id, payload);
      setDrawing(updated);
      setValuesForm({
        drawing_value:
          updated?.drawing_value === null || typeof updated?.drawing_value === 'undefined'
            ? ''
            : String(updated.drawing_value),
        print_value:
          updated?.print_value === null || typeof updated?.print_value === 'undefined'
            ? ''
            : String(updated.print_value),
      });
      if (typeof onChanged === 'function') {
        await onChanged();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao salvar valores do desenho.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!drawing) return;
    const confirmed = window.confirm('Tem certeza que deseja excluir este desenho?');
    if (!confirmed) return;

    setSaving(true);
    setError('');
    try {
      await deleteDrawing(drawing.id);
      if (typeof onChanged === 'function') {
        await onChanged();
      }
      onBackToKanban?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao excluir desenho.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sales-page process-theme process-theme--drawing">
      <div className="sales-page-header">
        <Button variant="ghost" type="button" onClick={onBackToKanban}>
          {'<-'} Voltar para kanban
        </Button>
        <h2>Detalhes do desenho</h2>
        <div />
      </div>

      <div className="sales-page-table-wrap">
        {loading ? (
          <p className="muted">Carregando...</p>
        ) : !drawing ? (
          <p className="form-error">{error || 'Desenho nao encontrado.'}</p>
        ) : (
          <>
            <div className="detail-info-grid">
              <div className="detail-card">
                <div className="detail-card-title">Identificacao</div>
                <div className="detail-row"><span>Titulo</span><strong>{drawing.title || '-'}</strong></div>
                <div className="detail-row"><span>Cliente</span><span>{drawing.customer_name_snapshot || '-'}</span></div>
                <div className="detail-row"><span>Tipo</span><span>{drawing.type === 'FDM' ? 'FDM' : 'Resina'}</span></div>
                <div className="detail-row"><span>Status</span><span>{DRAWING_STATUS_LABELS[drawing.status] || drawing.status}</span></div>
                <div className="detail-row"><span>Projetista</span><span>{drawing.designer_name || '-'}</span></div>
                <div className="detail-row"><span>Inicio</span><span>{formatDate(drawing.start_date)}</span></div>
                <div className="detail-row"><span>Fim</span><span>{formatDate(drawing.end_date)}</span></div>
                <div className="detail-row" style={{ marginTop: '8px', flexDirection: 'column', gap: '4px' }}>
                  <span>Descricao</span>
                  <span style={{ color: '#2c2417' }}>{drawing.description || '-'}</span>
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-card-title">Valores</div>
                <div className="detail-row"><span>Valor do desenho</span><strong>{formatCurrency(drawing.drawing_value || 0)}</strong></div>
                <div className="detail-row"><span>Valor da impressao</span><strong>{drawing.print_value == null ? '-' : formatCurrency(drawing.print_value)}</strong></div>
                <div className="detail-row"><span>Criado em</span><span>{drawing.created_at ? new Date(drawing.created_at).toLocaleString('pt-BR') : '-'}</span></div>
              </div>
            </div>

            <form className="sales-filters sale-detail-status-form" onSubmit={handleSaveValues} style={{ marginTop: '16px' }}>
              <p className="new-sale-section-label">Atualizar valores</p>
              <div className="sale-detail-status-grid">
                <label className="filter-field">
                  <span>Valor do desenho (R$)</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valuesForm.drawing_value}
                    disabled={!canManage}
                    onChange={(e) => setValuesForm((prev) => ({ ...prev, drawing_value: e.target.value }))}
                  />
                </label>
                <label className="filter-field">
                  <span>Valor da impressao (R$)</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valuesForm.print_value}
                    disabled={!canManage}
                    onChange={(e) => setValuesForm((prev) => ({ ...prev, print_value: e.target.value }))}
                  />
                </label>
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="filter-actions sale-detail-actions">
                {canManage && (
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar valores'}
                  </Button>
                )}
                {canManage && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="text-[var(--accent-strong)]"
                  >
                    Excluir desenho
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
