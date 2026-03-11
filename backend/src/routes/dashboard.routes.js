const { Router } = require('express');
const { dashboardController } = require('../controllers/dashboard.controller');

const router = Router();

router.get('/summary', dashboardController.getSummary);
router.get('/sales-series', dashboardController.getSalesSeries);
router.get('/kanban', dashboardController.getKanban);

module.exports = { dashboardRouter: router };
