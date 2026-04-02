const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { usersController } = require('../controllers/users.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

const userMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Listar e criar — apenas ADMIN
router.get('/', requireRole('ADMIN'), usersController.list);
router.post('/', userMutationLimiter, requireRole('ADMIN'), usersController.create);

// Detalhe — apenas ADMIN
router.get('/:id', requireRole('ADMIN'), usersController.getById);

// Atualizar dados (nome, email, role) — apenas ADMIN
router.put('/:id', requireRole('ADMIN'), usersController.update);

// Alterar senha — ADMIN altera qualquer um; FUNCIONARIO altera a própria
// (controle de ownership feito no service)
router.patch('/:id/password', userMutationLimiter, requireRole('ADMIN', 'FUNCIONARIO'), usersController.updatePassword);

// Inativar — apenas ADMIN
router.patch('/:id/deactivate', requireRole('ADMIN'), usersController.deactivate);
router.delete('/:id', requireRole('ADMIN'), usersController.remove);

module.exports = { usersRouter: router };
