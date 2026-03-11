const { authService } = require('../services/auth.service');
const { Joi, validate } = require('../utils/validation');

const loginSchema = Joi.object({
  usuario: Joi.string().trim().required(),
  senha: Joi.string().trim().required(),
});

const confirmPasswordSchema = Joi.object({
  senha: Joi.string().trim().required(),
});

async function login(req, res, next) {
  try {
    const payload = validate(loginSchema, req.body);
    const result = await authService.login(payload);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function confirmPassword(req, res, next) {
  try {
    const payload = validate(confirmPasswordSchema, req.body);
    const result = await authService.confirmPassword(req.user?.sub, payload.senha);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { authController: { login, confirmPassword } };
