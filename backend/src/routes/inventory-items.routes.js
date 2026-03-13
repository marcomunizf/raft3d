const { Router } = require('express');
const { inventoryItemsController } = require('../controllers/inventory-items.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

router.get('/', inventoryItemsController.list);
router.get('/:id/log', inventoryItemsController.getLog);
router.get('/:id', inventoryItemsController.getById);
router.post('/', requireRole('ADMIN', 'FUNCIONARIO'), inventoryItemsController.create);
router.put('/:id', requireRole('ADMIN', 'FUNCIONARIO'), inventoryItemsController.update);
router.patch('/:id/deactivate', requireRole('ADMIN'), inventoryItemsController.deactivate);

module.exports = { inventoryItemsRouter: router };
