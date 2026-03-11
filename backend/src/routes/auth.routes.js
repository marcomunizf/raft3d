const { Router } = require('express');
const { authController } = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/login', authController.login);
router.post('/confirm-password', requireAuth, authController.confirmPassword);

module.exports = { authRouter: router };
