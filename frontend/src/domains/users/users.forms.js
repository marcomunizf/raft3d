export function createEmptyUserForm() {
  return {
    usuario: '',
    senha: '',
    role: 'FUNCIONARIO',
    permissions: [],
  };
}

export function createEmptyPasswordForm() {
  return {
    senha_atual: '',
    nova_senha: '',
    confirma_senha: '',
  };
}