const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { financeController } = require('../controllers/finance.controller');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();

const financeMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

router.use(requireRole('ADMIN'));

router.get('/summary', financeController.getSummary);
router.get('/entries', financeController.listEntries);
router.post('/entries', financeMutationLimiter, financeController.createEntry);
router.put('/entries/:id', financeMutationLimiter, financeController.updateEntry);
router.patch('/entries/:id/status', financeMutationLimiter, financeController.updateEntryStatus);

module.exports = { financeRouter: router };
