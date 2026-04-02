const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { salesController } = require('../controllers/sales.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

router.get('/', salesController.list);
router.post('/', mutationLimiter, requireRole('ADMIN', 'FUNCIONARIO'), salesController.create);
router.get('/:id', salesController.getById);
router.put('/:id', mutationLimiter, requireRole('ADMIN', 'FUNCIONARIO'), salesController.update);
router.patch('/:id/status', mutationLimiter, requireRole('ADMIN', 'FUNCIONARIO'), salesController.updateStatus);
router.post('/:id/cancel', mutationLimiter, requireRole('ADMIN', 'FUNCIONARIO'), salesController.cancel);
router.get('/:id/payments', salesController.listPayments);
router.post('/:id/payments', mutationLimiter, requireRole('ADMIN'), salesController.addPayment);
router.patch('/:id/items/:itemId/status', mutationLimiter, requireRole('ADMIN', 'FUNCIONARIO'), salesController.updateItemStatus);

module.exports = { salesRouter: router };
