// TODO: M1-04 - User Profile API
// Người khác sẽ implement:
// - POST /api/auth/sync-user (Lưu user khi login lần đầu)
// - GET /api/auth/me (Lấy thông tin user)
// - PUT /api/auth/me (Cập nhật profile)
import {
    sendSuccess,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendServerError,
    sendCreated,
    sendNoContent
} from "../utils/response.js";
import User from "../models/User.js";

/**
 * Controller: Login
 * API: POST /api/auth/login
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} JSON response containing user info
 */
export const login = async (req, res) => {
    try {
        const user = req.user;

        return sendSuccess(res, {
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                roles: user.roles,
            }
        }, 'Login successfully');
    } catch (error) {
        console.log(error);
        return sendServerError(res, '[AUTH CONTROLLER ALERT]: Login failed');
    }
};

/**
 * Controller: Register
 * API: POST /api/auth/register
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} JSON response containing user info
 */

export const register = async (req, res) => {
    try {
        const user = req.user;

        return sendSuccess(res, {
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                roles: user.roles,
            }
        }, 'Register successfully');
    } catch (error) {
        console.log(error);
        return sendServerError(res, '[AUTH CONTROLLER ALERT]: Register failed');
    }
};

export default {
    login,
    register
};
