const { Router } = require('express');
const { salesController } = require('../controllers/sales.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

router.get('/', salesController.list);
router.post('/', requireRole('ADMIN', 'FUNCIONARIO'), salesController.create);
router.get('/:id', salesController.getById);
router.put('/:id', requireRole('ADMIN', 'FUNCIONARIO'), salesController.update);
router.patch('/:id/status', requireRole('ADMIN', 'FUNCIONARIO'), salesController.updateStatus);
router.post('/:id/cancel', requireRole('ADMIN', 'FUNCIONARIO'), salesController.cancel);
router.get('/:id/payments', salesController.listPayments);
router.post('/:id/payments', requireRole('ADMIN'), salesController.addPayment);
router.patch('/:id/items/:itemId/status', requireRole('ADMIN', 'FUNCIONARIO'), salesController.updateItemStatus);

module.exports = { salesRouter: router };
