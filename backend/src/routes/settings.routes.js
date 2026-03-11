const { Router } = require('express');
const { settingsController } = require('../controllers/settings.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

router.get('/', settingsController.get);
router.put('/', requireRole('ADMIN'), settingsController.update);

module.exports = { settingsRouter: router };
