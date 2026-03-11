const { Router } = require('express');
const { usersController } = require('../controllers/users.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

// Listar e criar — apenas ADMIN
router.get('/', requireRole('ADMIN'), usersController.list);
router.post('/', requireRole('ADMIN'), usersController.create);

// Detalhe — apenas ADMIN
router.get('/:id', requireRole('ADMIN'), usersController.getById);

// Atualizar dados (nome, email, role) — apenas ADMIN
router.put('/:id', requireRole('ADMIN'), usersController.update);

// Alterar senha — ADMIN altera qualquer um; FUNCIONARIO altera a própria
// (controle de ownership feito no service)
router.patch('/:id/password', requireRole('ADMIN', 'FUNCIONARIO'), usersController.updatePassword);

// Inativar — apenas ADMIN
router.patch('/:id/deactivate', requireRole('ADMIN'), usersController.deactivate);
router.delete('/:id', requireRole('ADMIN'), usersController.remove);

module.exports = { usersRouter: router };
