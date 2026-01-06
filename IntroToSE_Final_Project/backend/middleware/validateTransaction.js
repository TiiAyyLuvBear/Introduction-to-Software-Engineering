/**
 * Transaction Validation Middleware
 * 
 * Validate request data trước khi đến controller
 * Đảm bảo data đúng format và hợp lệ
 */

import mongoose from 'mongoose'

/**
 * Validate Create Transaction Request
 * 
 * Required: amount, type
 * Optional: walletId, categoryId, category, account, date, note, goalId
 */
export const validateCreateTransaction = (req, res, next) => {
    const { amount, type, walletId, categoryId, goalId } = req.body

    // Validate REQUIRED: amount
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
            status: 400,
            message: 'Amount must be a positive number'
        })
    }

    // Validate REQUIRED: type
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
            status: 400,
            message: 'Type must be income or expense'
        })
    }

    // Validate OPTIONAL: walletId (nếu có)
    if (walletId && walletId !== 'uncategorized' && walletId !== 'default') {
        if (!mongoose.Types.ObjectId.isValid(walletId)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid walletId format'
            })
        }
    }

    // Validate OPTIONAL: categoryId (nếu có)
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid categoryId format'
        })
    }

    // Validate OPTIONAL: goalId (nếu có)
    if (goalId && !mongoose.Types.ObjectId.isValid(goalId)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid goalId format'
        })
    }

    // All validations passed
    next()
}

/**
 * Validate Update Transaction Request
 * 
 * All fields optional, but if provided must be valid
 */
export const validateUpdateTransaction = (req, res, next) => {
    const { amount, type, walletId, categoryId, goalId } = req.body
    const { id } = req.params

    // Validate transaction ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid transaction ID format'
        })
    }

    // Validate amount (nếu có)
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
        return res.status(400).json({
            status: 400,
            message: 'Amount must be a positive number'
        })
    }

    // Validate type (nếu có)
    if (type !== undefined && !['income', 'expense'].includes(type)) {
        return res.status(400).json({
            status: 400,
            message: 'Type must be income or expense'
        })
    }

    // Validate walletId (nếu có)
    if (walletId && walletId !== 'uncategorized' && walletId !== 'default') {
        if (!mongoose.Types.ObjectId.isValid(walletId)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid walletId format'
            })
        }
    }

    // Validate categoryId (nếu có)
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid categoryId format'
        })
    }

    // Validate goalId (nếu có)
    if (goalId && !mongoose.Types.ObjectId.isValid(goalId)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid goalId format'
        })
    }

    // All validations passed
    next()
}

/**
 * Validate Delete Transaction Request
 */
export const validateDeleteTransaction = (req, res, next) => {
    const { id } = req.params

    // Validate transaction ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid transaction ID format'
        })
    }

    // All validations passed
    next()
}

/**
 * Validate Transfer Money Request
 * 
 * Required: fromWalletId, toWalletId, amount
 * Optional: date, note
 */
export const validateTransferMoney = (req, res, next) => {
    const { fromWalletId, toWalletId, amount } = req.body

    // Validate fromWalletId
    if (!fromWalletId || !mongoose.Types.ObjectId.isValid(fromWalletId)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid fromWalletId'
        })
    }

    // Validate toWalletId
    if (!toWalletId || !mongoose.Types.ObjectId.isValid(toWalletId)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid toWalletId'
        })
    }

    // Validate wallets are different
    if (fromWalletId === toWalletId) {
        return res.status(400).json({
            status: 400,
            message: 'From wallet and to wallet must be different'
        })
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
            status: 400,
            message: 'Amount must be a positive number'
        })
    }

    // All validations passed
    next()
}

export default {
    validateCreateTransaction,
    validateUpdateTransaction,
    validateDeleteTransaction,
    validateTransferMoney
}
