export function getAvailableTypes(permissions = []) {
  const hasResina = permissions.includes('producao-resina');
  const hasFdm = permissions.includes('producao-fdm');
  const hasAll = permissions.includes('producao');

  if (hasAll || (hasResina && hasFdm)) return ['RESINA', 'FDM'];
  if (hasResina) return ['RESINA'];
  if (hasFdm) return ['FDM'];
  return [];
}