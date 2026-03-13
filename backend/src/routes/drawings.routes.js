const { Router } = require('express');
const { drawingsController } = require('../controllers/drawings.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

// Only ADMIN/FUNCIONARIO can access drawing endpoints
router.get('/', requireRole('ADMIN', 'FUNCIONARIO'), drawingsController.list);
router.get('/designers', requireRole('ADMIN', 'FUNCIONARIO'), drawingsController.listDesigners);
router.post('/', requireRole('ADMIN', 'FUNCIONARIO'), drawingsController.create);
router.get('/:id', requireRole('ADMIN', 'FUNCIONARIO'), drawingsController.getById);
router.put('/:id', requireRole('ADMIN', 'FUNCIONARIO'), drawingsController.update);
router.delete('/:id', requireRole('ADMIN', 'FUNCIONARIO'), drawingsController.remove);
router.post('/:id/send-to-production', requireRole('ADMIN', 'FUNCIONARIO'), drawingsController.sendToProduction);

module.exports = { drawingsRouter: router };
