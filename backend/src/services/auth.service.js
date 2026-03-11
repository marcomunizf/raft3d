const bcrypt = require('bcrypt');
const { usersRepository } = require('../repositories/users.repository');
const { signToken } = require('../utils/jwt');

async function login(payload) {
  const usuario = payload ? payload.usuario : null;
  const senha = payload ? payload.senha : null;

  if (!usuario || !senha) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const user = await usersRepository.findByLogin(usuario);

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const passwordValid = await bcrypt.compare(senha, user.password_hash);

  if (!passwordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email, permissions: user.permissions || [] });

  return {
    token,
    usuario: {
      id: user.id,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      is_active: user.is_active,
    },
  };
}

async function confirmPassword(userId, senha) {
  if (!userId || !senha) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const user = await usersRepository.findById(userId);

  if (!user || !user.is_active) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const passwordValid = await bcrypt.compare(senha, user.password_hash);

  if (!passwordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  return { ok: true };
}

module.exports = { authService: { login, confirmPassword } };
