/**
 * Linha de tabela para estado vazio.
 *
 * Props:
 *   colSpan  - número de colunas
 *   message  - mensagem a exibir
 */
export default function EmptyRow({ colSpan = 1, message = 'Nenhum registro encontrado.' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8 text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}
