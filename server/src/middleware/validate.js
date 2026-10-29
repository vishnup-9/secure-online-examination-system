const { AppError } = require('./errorHandler');

// Lightweight, dependency-free request validator.
// schema: { fieldName: { required, type, minLength, maxLength, min, max, enum } }
const validate = (schema) => (req, res, next) => {
  const errors = [];
  const body = req.body || {};

  Object.entries(schema).forEach(([field, rules]) => {
    const value = body[field];
    const exists = value !== undefined && value !== null && value !== '';

    if (rules.required && !exists) {
      errors.push(`${field} is required`);
      return;
    }
    if (!exists) return;

    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
    if (rules.type === 'number' && typeof value !== 'number') {
      errors.push(`${field} must be a number`);
    }
    if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push(`${field} must be a valid email`);
    }
    if (rules.minLength && String(value).length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }
    if (rules.maxLength && String(value).length > rules.maxLength) {
      errors.push(`${field} must be at most ${rules.maxLength} characters`);
    }
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
  });

  if (errors.length) throw new AppError(errors.join('; '), 422);
  next();
};

module.exports = validate;
