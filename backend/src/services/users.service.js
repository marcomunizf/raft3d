const bcrypt = require('bcrypt');
const { usersRepository } = require('../repositories/users.repository');

const SALT_ROUNDS = 12;

async function list() {
  return usersRepository.list();
}

async function getById(id) {
  const user = await usersRepository.findById(id);
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

async function create(data) {
  const usuario = (data.usuario || data.email || data.name || '').trim();
  const displayName = (data.name || usuario).trim();
  const permissions = Array.isArray(data.permissions) ? data.permissions : [];

  const existing = await usersRepository.findByEmail(usuario);
  if (existing) {
    const error = new Error('Usuario already in use');
    error.statusCode = 409;
    error.code = 'CONFLICT';
    throw error;
  }

  const password_hash = await bcrypt.hash(data.senha, SALT_ROUNDS);

  return usersRepository.create({
    name: displayName,
    email: usuario,
    password_hash,
    role: data.role,
    permissions,
    is_active: true,
  });
}

async function update(id, data) {
  const user = await usersRepository.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const nextUsuario = (data.usuario || data.email || '').trim();
  if (nextUsuario && nextUsuario !== user.email) {
    const existing = await usersRepository.findByEmail(nextUsuario);
    if (existing) {
      const error = new Error('Usuario already in use');
      error.statusCode = 409;
      error.code = 'CONFLICT';
      throw error;
    }
  }

  const payload = {
    role: data.role,
    permissions: data.permissions,
  };

  if (typeof data.name !== 'undefined') payload.name = data.name;
  if (nextUsuario) payload.email = nextUsuario;
  if (data.usuario && typeof data.name === 'undefined') payload.name = nextUsuario;

  return usersRepository.update(id, payload);
}

async function updatePassword(id, currentUserId, currentUserRole, data) {
  // ADMIN pode alterar senha de qualquer usuário sem confirmar a senha atual.
  // FUNCIONARIO só pode alterar a própria senha, e deve confirmar a senha atual.
  const isOwnAccount = id === currentUserId;

  if (!isOwnAccount && currentUserRole !== 'ADMIN') {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const user = await usersRepository.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (isOwnAccount) {
    const valid = await bcrypt.compare(data.senha_atual, user.password_hash);
    if (!valid) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }
  }

  const password_hash = await bcrypt.hash(data.nova_senha, SALT_ROUNDS);
  await usersRepository.updatePassword(id, password_hash);
  return { ok: true };
}

async function deactivate(id) {
  const user = await usersRepository.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (user.role === 'ADMIN') {
    const error = new Error('Nao e possivel desativar usuario ADMIN.');
    error.statusCode = 400;
    error.code = 'BUSINESS_RULE';
    throw error;
  }

  return usersRepository.deactivate(id);
}

async function remove(id) {
  const user = await usersRepository.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (user.role === 'ADMIN') {
    const error = new Error('Nao e possivel excluir usuario ADMIN.');
    error.statusCode = 400;
    error.code = 'BUSINESS_RULE';
    throw error;
  }

  try {
    return await usersRepository.remove(id);
  } catch (err) {
    if (err && err.code === '23503') {
      const error = new Error('Usuario possui registros vinculados e nao pode ser excluido.');
      error.statusCode = 409;
      error.code = 'CONFLICT';
      throw error;
    }
    throw err;
  }
}

module.exports = { usersService: { list, getById, create, update, updatePassword, deactivate, remove } };
