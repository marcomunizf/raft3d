const { Router } = require('express');
const { materialsController } = require('../controllers/materials.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

router.get('/', materialsController.list);
router.post('/', requireRole('ADMIN', 'FUNCIONARIO'), materialsController.create);
router.put('/:id', requireRole('ADMIN', 'FUNCIONARIO'), materialsController.update);
router.patch('/:id/deactivate', requireRole('ADMIN', 'FUNCIONARIO'), materialsController.deactivate);

module.exports = { materialsRouter: router };
