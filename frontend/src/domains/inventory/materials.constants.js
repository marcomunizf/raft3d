export const DEFAULT_MATERIALS_BY_PROCESS = {
  RESINA: {
    types: ['Standart', 'Semi-flexível', 'Alta performance', 'Lavável', 'Alta temperatura', 'Cristal', 'Dental'],
    colors: ['Cinza', 'Bege', 'Transparente', 'Preta', 'Branca'],
    brands: ['3DLAB', '3DFila', 'Sunlu'],
  },
  FDM: {
    types: ['PLA', 'ABS', 'PETG', 'TPU', 'ASA', 'Tritan', 'PLA Flex', 'Nylon'],
    colors: ['Preto', 'Branco', 'Cinza', 'Vermelho', 'Azul', 'Amarelo', 'Verde', 'Roxo', 'Rosa', 'Transparente', 'Laranja', 'Azul Claro', 'Marrom', 'Verde limão', 'Alumínio', 'Bege'],
    brands: ['3DFila', '3DLAB', 'Volt3D'],
  },
};

export const PROCESS_LABELS = {
  RESINA: 'Resina',
  FDM: 'FDM',
};

export function getMaterialLabel(process, type, color) {
  const prefix = process === 'FDM' ? 'Filamento' : 'Resina';
  if (!type && !color) return prefix;
  return `${prefix} ${type || '-'} ${color || '-'}`.replace(/\s+/g, ' ').trim();
}
