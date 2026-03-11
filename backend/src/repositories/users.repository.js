const { db } = require('../config/database');

async function list() {
  const result = await db.query(
    'SELECT id, name, email, role, permissions, is_active, created_at FROM users ORDER BY created_at ASC'
  );
  return result.rows;
}

async function findByEmail(email) {
  const result = await db.query(
    'SELECT id, name, email, role, permissions, is_active, password_hash FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return result.rows[0] || null;
}

async function findByLogin(login) {
  const result = await db.query(
    'SELECT id, name, email, role, permissions, is_active, password_hash FROM users WHERE email = $1 AND is_active = true LIMIT 1',
    [login]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    'SELECT id, name, email, role, permissions, is_active, password_hash FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return result.rows[0] || null;
}

async function getAdminId() {
  const result = await db.query(
    "SELECT id FROM users WHERE role = 'ADMIN' AND is_active = true ORDER BY created_at ASC LIMIT 1"
  );
  return result.rows[0] ? result.rows[0].id : null;
}

async function create(data) {
  const result = await db.query(
    'INSERT INTO users (name, email, password_hash, role, permissions, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, permissions, is_active, created_at',
    [data.name, data.email, data.password_hash, data.role, data.permissions || [], data.is_active ?? true]
  );
  return result.rows[0];
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let index = 1;

  const map = { name: data.name, email: data.email, role: data.role, permissions: data.permissions };

  Object.keys(map).forEach((key) => {
    if (typeof map[key] !== 'undefined') {
      fields.push(key + ' = $' + index);
      values.push(map[key]);
      index += 1;
    }
  });

  if (!fields.length) {
    const row = await findById(id);
    if (!row) return null;
    const { password_hash, ...safe } = row;
    return safe;
  }

  values.push(id);
  const result = await db.query(
    'UPDATE users SET ' + fields.join(', ') + ' WHERE id = $' + index + ' RETURNING id, name, email, role, permissions, is_active, created_at',
    values
  );
  return result.rows[0] || null;
}

async function updatePassword(id, passwordHash) {
  const result = await db.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
    [passwordHash, id]
  );
  return result.rows[0] || null;
}

async function deactivate(id) {
  const result = await db.query(
    'UPDATE users SET is_active = false WHERE id = $1 RETURNING id, name, email, role, permissions, is_active',
    [id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query(
    'DELETE FROM users WHERE id = $1 RETURNING id, name, email, role, permissions, is_active',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  usersRepository: {
    list,
    findByEmail,
    findByLogin,
    findById,
    getAdminId,
    create,
    update,
    updatePassword,
    deactivate,
    remove,
  },
};
