/**
 * RESPONSE HELPERS
 * 
 * Các hàm helper để format response thống nhất cho toàn bộ API
 * Đảm bảo structure nhất quán: { success, data/error, message }
 */

/**
 * Format success response
 * @param {Object} res - Express response object
 * @param {Object} data - Dữ liệu trả về cho client
 * @param {String} message - Thông báo thành công (optional)
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

/**
 * Format error response
 * @param {Object} res - Express response object
 * @param {String} error - Thông báo lỗi
 * @param {String} code - Error code để frontend xử lý
 * @param {Number} statusCode - HTTP status code (default: 400)
 */
const sendError = (res, error = 'An error occurred', code = 'UNKNOWN_ERROR', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error,
    code
  });
};

/**
 * Format validation error response
 * @param {Object} res - Express response object
 * @param {Object|Array} errors - Chi tiết các lỗi validation
 */
const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: errors
  });
};

/**
 * Format unauthorized error response
 * @param {Object} res - Express response object
 * @param {String} message - Thông báo lỗi authentication
 */
const sendUnauthorized = (res, message = 'Authentication required') => {
  return res.status(401).json({
    success: false,
    error: message,
    code: 'UNAUTHORIZED'
  });
};

/**
 * Format forbidden error response
 * @param {Object} res - Express response object
 * @param {String} message - Thông báo lỗi authorization
 */
const sendForbidden = (res, message = 'Permission denied') => {
  return res.status(403).json({
    success: false,
    error: message,
    code: 'FORBIDDEN'
  });
};

/**
 * Format not found error response
 * @param {Object} res - Express response object
 * @param {String} resource - Tài nguyên không tìm thấy
 */
const sendNotFound = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    error: `${resource} not found`,
    code: 'NOT_FOUND'
  });
};

/**
 * Format server error response
 * @param {Object} res - Express response object
 * @param {String} message - Thông báo lỗi server
 */
const sendServerError = (res, message = 'Internal server error') => {
  return res.status(500).json({
    success: false,
    error: message,
    code: 'SERVER_ERROR'
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendServerError
};
