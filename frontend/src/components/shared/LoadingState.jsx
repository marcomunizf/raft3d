/**
 * Indicador de carregamento inline (dentro de tabela ou lista).
 *
 * Props:
 *   colSpan  - número de colunas (quando usado em <tr><td>)
 *   message  - mensagem opcional (padrão: "Carregando...")
 *   asRow    - se true, renderiza como <tr><td> para uso em <tbody>
 */
export default function LoadingState({ colSpan = 1, message = 'Carregando...', asRow = false }) {
  if (asRow) {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center py-8 text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {message}
          </span>
        </td>
      </tr>
    );
  }

  return (
    <p className="text-muted-foreground py-6 px-4 flex items-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {message}
    </p>
  );
}
