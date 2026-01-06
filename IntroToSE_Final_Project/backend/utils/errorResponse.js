/**
 * Error Response Utilities
 * 
 * Standardized error response format cho toàn bộ backend
 * Format: { status, message, data? }
 */

/**
 * Send error response
 * 
 * @param {Object} res - Express response object
 * @param {Number} status - HTTP status code
 * @param {String} message - Error message
 * @param {Object} data - Optional additional data
 */
export const sendError = (res, status, message, data = null) => {
    const response = {
        status,
        message
    }

    if (data) {
        response.data = data
    }

    return res.status(status).json(response)
}

/**
 * Send success response
 * 
 * @param {Object} res - Express response object
 * @param {Number} status - HTTP status code (default 200)
 * @param {String} message - Success message
 * @param {Object} data - Response data
 */
export const sendSuccess = (res, status = 200, message, data = null) => {
    const response = {
        status,
        message
    }

    if (data) {
        response.data = data
    }

    return res.status(status).json(response)
}

/**
 * Common error responses
 */

export const sendBadRequest = (res, message = 'Bad Request') => {
    return sendError(res, 400, message)
}

export const sendUnauthorized = (res, message = 'Unauthorized') => {
    return sendError(res, 401, message)
}

export const sendForbidden = (res, message = 'Forbidden') => {
    return sendError(res, 403, message)
}

export const sendNotFound = (res, message = 'Not Found') => {
    return sendError(res, 404, message)
}

export const sendServerError = (res, message = 'Internal Server Error') => {
    return sendError(res, 500, message)
}

/**
 * Global Error Handler Middleware
 * 
 * Catch all errors và return standardized format
 */
export const errorHandler = (err, req, res, next) => {
    console.error('[ERROR]', err)

    // Custom error với status
    if (err.status) {
        return sendError(res, err.status, err.message)
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return sendError(res, 400, 'Validation Error', {
            errors: Object.values(err.errors).map(e => e.message)
        })
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return sendError(res, 400, `Invalid ${err.path}: ${err.value}`)
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0]
        return sendError(res, 400, `${field} already exists`)
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, 401, 'Invalid token')
    }

    if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token expired')
    }

    // Default server error
    return sendError(res, 500, 'Internal Server Error')
}

export default {
    sendError,
    sendSuccess,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendServerError,
    errorHandler
}
