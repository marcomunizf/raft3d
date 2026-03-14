const { Router } = require('express');
const { dashboardController } = require('../controllers/dashboard.controller');

const router = Router();

router.get('/summary', dashboardController.getSummary);
router.get('/sales-series', dashboardController.getSalesSeries);
router.get('/kanban', dashboardController.getKanban);
router.get('/monthly-history', dashboardController.getMonthlyHistory);
router.get('/weight-price-by-material', dashboardController.getWeightPriceByMaterial);

module.exports = { dashboardRouter: router };
