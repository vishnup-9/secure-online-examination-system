// Central error handler. Never leaks stack traces to the client in production.
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.expose ? err.message : statusCode === 500 ? 'Internal server error' : err.message,
    ...(isProd ? {} : { stack: err.stack })
  });
};

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.expose = true;
  }
}

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFound, AppError };
