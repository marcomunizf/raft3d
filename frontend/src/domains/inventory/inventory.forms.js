export function createEmptyItemForm(defaultType = 'RESINA', defaultUnit = 'Unidade') {
  return {
    name: '',
    brand: '',
    category: 'RAW_MATERIAL',
    type: defaultType,
    unit: defaultUnit,
    min_qty: '',
    current_qty: '',
  };
}
