const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('./errorHandler');

// Verifies JWT and attaches the authenticated user to req.user.
// Role information ALWAYS comes from the database record, never from the
// token payload's convenience field alone — we re-fetch the user so a role
// change or deactivation takes effect immediately.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) throw new AppError('Not authorized, no token provided', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError('Not authorized, invalid or expired token', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new AppError('Not authorized, user not found or inactive', 401);

  req.user = user;
  next();
});

// Role-based authorization guard. Usage: authorize('admin') or authorize('admin','student')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new AppError('Forbidden: insufficient role privileges', 403);
  }
  next();
};

module.exports = { protect, authorize };
