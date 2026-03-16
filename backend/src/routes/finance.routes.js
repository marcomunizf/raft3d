const { Router } = require('express');
const { financeController } = require('../controllers/finance.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

router.use(requireRole('ADMIN'));

router.get('/summary', financeController.getSummary);
router.get('/entries', financeController.listEntries);
router.post('/entries', financeController.createEntry);
router.put('/entries/:id', financeController.updateEntry);
router.patch('/entries/:id/status', financeController.updateEntryStatus);

module.exports = { financeRouter: router };
