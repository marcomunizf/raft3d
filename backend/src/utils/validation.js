const Joi = require('joi');

function validate(schema, payload) {
  const { value, error } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const err = new Error('Validation error');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    err.details = error.details.map((detail) => ({
      path: detail.path.join('.'),
      message: detail.message,
    }));
    throw err;
  }

  return value;
}

module.exports = { Joi, validate };
