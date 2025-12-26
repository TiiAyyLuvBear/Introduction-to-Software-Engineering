// services/accountsService.js
import Account from '../models/Account.js';
import mongoose from 'mongoose';

/**
 * Service: Lấy danh sách accounts với phân trang
 * 
 * @param {Object} options - { page, limit }
 * @returns {Object} { items, total, page, limit }
 */
export const getAccounts = async ({ page = 1, limit = 20 }) => {
    try {
        const validPage = Math.max(1, parseInt(page) || 1);
        const validLimit = Math.min(100, parseInt(limit) || 20);
        const skip = (validPage - 1) * validLimit;

        // Sort theo tên để dễ tìm
        const [items, total] = await Promise.all([
            Account.find().sort({ name: 1 }).skip(skip).limit(validLimit),
            Account.countDocuments()
        ]);

        return { items, total, page: validPage, limit: validLimit };
    } catch (error) {
        throw error;
    }
};

/**
 * Service: Lấy chi tiết 1 account theo ID
 * 
 * @param {String} id - Account ID
 * @returns {Object} Account object
 */
export const getAccountById = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid account ID');
        }

        const account = await Account.findById(id);
        if (!account) {
            throw new Error('Account not found');
        }

        return account;
    } catch (error) {
        throw error;
    }
};

/**
 * Service: Tạo account mới
 * 
 * @param {Object} accountData - { name, balance?, currency?, userId? }
 * @returns {Object} Created account
 */
export const createAccount = async (accountData) => {
    try {
        const { name, balance, currency, userId } = accountData;

        // Validate name (bắt buộc)
        if (!name) {
            throw new Error('Account name is required');
        }

        const newAccount = new Account({
            name,
            balance: balance || 0,
            currency: currency || 'USD',
            userId
        });

        const savedAccount = await newAccount.save();
        return savedAccount;
    } catch (error) {
        throw error;
    }
};

/**
 * Service: Cập nhật account
 * 
 * @param {String} id - Account ID
 * @param {Object} updates - { name?, balance?, currency? }
 * @returns {Object} Updated account
 */
export const updateAccount = async (id, updates) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid account ID');
        }

        const updatedAccount = await Account.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        );

        if (!updatedAccount) {
            throw new Error('Account not found');
        }

        return updatedAccount;
    } catch (error) {
        throw error;
    }
};

/**
 * Service: Xóa account
 * 
 * @param {String} id - Account ID
 * @returns {Object} { success: true }
 * 
 * TODO: Cảnh báo nếu account có transactions
 * Có 2 approach:
 * 1. Chặn xóa nếu có transactions liên quan
 * 2. Xóa account và set account=null cho các transactions
 * 
 * Hiện tại: Cho phép xóa tự do (approach 2)
 */
export const deleteAccount = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid account ID');
        }

        const deletedAccount = await Account.findByIdAndDelete(id);

        if (!deletedAccount) {
            throw new Error('Account not found');
        }

        return { success: true };
    } catch (error) {
        throw error;
    }
};

export default {
    getAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount
};
