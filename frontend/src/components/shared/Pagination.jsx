import { Button } from '@/components/ui/button';

/**
 * Controle de paginação genérico.
 *
 * Props:
 *   meta     - { total, page, limit, pages } da resposta do backend
 *   onChange - callback(page) chamado ao navegar
 */
export default function Pagination({ meta, onChange }) {
  if (!meta || meta.pages <= 1) return null;

  const { page, pages, total, limit } = meta;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span className="pagination-info">
        {start}–{end} de {total}
      </span>
      <div className="pagination-controls">
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          type="button"
        >
          ← Anterior
        </Button>
        <span className="pagination-current">
          {page} / {pages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          type="button"
        >
          Próximo →
        </Button>
      </div>
    </div>
  );
}
