const { Router } = require('express');
const { inventoryMovementsController } = require('../controllers/inventory-movements.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

router.get('/', inventoryMovementsController.list);
router.post('/', requireRole('ADMIN'), inventoryMovementsController.create);

module.exports = { inventoryMovementsRouter: router };
