import { Button } from '@/components/ui/button';

/**
 * Cabeçalho padrão de página com botão voltar, título e ação opcional.
 *
 * Props:
 *   onBack       - callback do botão "← Voltar"
 *   title        - string do título
 *   action       - { label, onClick, disabled? } — botão de ação primária (opcional)
 */
export default function PageHeader({ onBack, title, action }) {
  return (
    <div className="sales-page-header">
      {onBack && (
        <Button variant="ghost" type="button" onClick={onBack}>
          ← Voltar
        </Button>
      )}
      <h2>{title}</h2>
      {action && (
        <Button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
