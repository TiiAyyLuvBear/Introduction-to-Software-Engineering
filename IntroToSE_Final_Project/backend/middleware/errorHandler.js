/**
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * 
 * Middleware này xử lý tất cả các lỗi xảy ra trong application
 * Bắt errors từ routes/controllers và format thành response thống nhất
 * 
 * Cách sử dụng: Đặt middleware này cuối cùng trong server.js
 * app.use(errorHandler);
 */

const { sendServerError } = require('../utils/response');

/**
 * Error handler middleware
 * Express tự động detect đây là error handler bằng 4 parameters
 */
const errorHandler = (err, req, res, next) => {
  // Log error details cho debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: `${field} already exists`,
      code: 'DUPLICATE_ERROR'
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      code: 'INVALID_ID'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Custom error với statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code || 'CUSTOM_ERROR'
    });
  }

  // Default server error
  sendServerError(res, process.env.NODE_ENV === 'development' ? err.message : 'Internal server error');
};

/**
 * Not found handler
 * Xử lý khi client request đến route không tồn tại
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
};

module.exports = { errorHandler, notFoundHandler };
