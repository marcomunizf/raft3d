const { Router } = require('express');
const { customersController } = require('../controllers/customers.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

router.get('/', customersController.list);
router.get('/:id/sales', customersController.getSales);
router.get('/:id', customersController.getById);
router.post('/', requireRole('ADMIN', 'FUNCIONARIO'), customersController.create);
router.put('/:id', requireRole('ADMIN', 'FUNCIONARIO'), customersController.update);
router.patch('/:id/deactivate', requireRole('ADMIN'), customersController.deactivate);

module.exports = { customersRouter: router };
