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
export const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
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
export const sendError = (res, error = 'An error occurred', code = 'UNKNOWN_ERROR', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error,
    code,
    message: error
  });
};

/**
 * Format validation error response
 * @param {Object} res - Express response object
 * @param {Object|Array} errors - Chi tiết các lỗi validation
 */
export const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    errors,
    message: 'Validation error'
  });
};

/**
 * Format unauthorized error response
 * @param {Object} res - Express response object
 * @param {String} message - Thông báo lỗi authentication
 */
export const sendUnauthorized = (res, message = 'Authentication required') => {
  return res.status(401).json({
    success: false,
    message
  });
};

/**
 * Format forbidden error response
 * @param {Object} res - Express response object
 * @param {String} message - Thông báo lỗi authorization
 */
export const sendForbidden = (res, message = 'Permission denied') => {
  return res.status(403).json({
    success: false,
    message
  });
};

/**
 * Format not found error response
 * @param {Object} res - Express response object
 * @param {String} resource - Tài nguyên không tìm thấy
 */
export const sendNotFound = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`
  });
};

/**
 * Format server error response
 * @param {Object} res - Express response object
 * @param {String} message - Thông báo lỗi server
 */
export const sendServerError = (res, message = 'Internal server error') => {
  return res.status(500).json({
    success: false,
    message
  });
};

/**
 * Format bad request error response
 * @param {Object} res - Express response object
 * @param {String} message - Thông báo lỗi bad request
 */
export const sendBadRequest = (res, message = 'Bad request') => {
  return res.status(400).json({
    success: false,
    message
  });
};

/**
 * Format created response
 * @param {Object} res - Express response object
 * @param {Object} data - Dữ liệu tài nguyên mới tạo
 * @param {String} message - Thông báo thành công
 */
export const sendCreated = (res, data = {}, message = 'Created successfully') => {
  return res.status(201).json({
    success: true,
    data,
    message
  });
};

/**
 * Format no content response
 * @param {Object} res - Express response object
 */
export const sendNoContent = (res) => {
  return res.status(204).send();
};

export default {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendServerError,
  sendBadRequest,
  sendCreated,
  sendNoContent
};
