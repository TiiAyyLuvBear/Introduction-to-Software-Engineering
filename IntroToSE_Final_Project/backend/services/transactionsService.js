/**
 * Transaction Service Layer
 * 
 * Xử lý business logic cho transactions:
 * - Tạo transaction mới với MongoDB Session (M1-06)
 * - Cập nhật transaction và rollback balance (M1-07)
 * - Xóa transaction và rollback balance (M1-07)
 * - Chuyển tiền giữa các wallets
 */

import mongoose from 'mongoose'
import Transaction from '../models/Transaction.js'
import Wallet from '../models/Wallet.js'
import { withMongoSession } from '../utils/mongoSession.js'
import { buildTransactionQuery } from '../utils/transactionFilter.js'
import { updateBalanceOnTransaction, rollbackBalanceOnTransaction } from './balanceService.js'
import { getOrCreateDefaultWallet } from './walletService.js'

function httpError(status, message, data) {
    const err = new Error(message)
    err.status = status
    if (data !== undefined) err.data = data
    return err
}

/**
 * Helper: Tính số tiền có dấu (signed amount)
 * @param {String} type - 'income' hoặc 'expense'
 * @param {Number} amount - Số tiền
 * @returns {Number} Số tiền có dấu (+/-)
 */
function signedAmount(type, amount) {
    return type === 'income' ? amount : -amount
}

/**
 * Helper: Kiểm tra user có quyền truy cập wallet không
 * @param {Object} wallet - Wallet document
 * @param {String} userId - User ID
 * @returns {Boolean}
 */
function canAccessWallet(wallet, userId) {
    if (!wallet || !userId) return false
    if (wallet.userId?.toString() === userId.toString()) return true
    if (wallet.ownerId?.toString() === userId.toString()) return true
    if (Array.isArray(wallet.members) && wallet.members.some(m => m.userId?.toString() === userId.toString())) return true
    return false
}

/**
 * Service: Tạo transaction mới
 * 
 * M1-06: Sử dụng MongoDB Session để đảm bảo tính toàn vẹn dữ liệu
 * - Tạo transaction
 * - Cập nhật balance của wallet
 * - Rollback nếu có lỗi
 * 
 * @param {String} userId - User ID
 * @param {Object} transactionData - { amount, type, walletId, categoryId?, category?, account?, date?, note? }
 * @returns {Object} Created transaction
 */
export const createTransactionService = async (userId, transactionData) => {
    let { amount, type, walletId, categoryId, category, account, date, note } = transactionData

    // Validate amount/type
    if (typeof amount !== 'number' || amount <= 0 || !['income', 'expense'].includes(type)) {
        throw new Error('Invalid payload: amount must be positive number, type must be income or expense')
    }

    // Handle walletId: null, undefined, hoặc 'uncategorized' -> dùng default wallet
    const useDefaultWallet = !walletId || walletId === 'uncategorized' || walletId === 'default'

    // Validate walletId nếu được cung cấp
    if (!useDefaultWallet && !mongoose.Types.ObjectId.isValid(walletId)) {
        throw new Error('Invalid walletId')
    }

    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error('Invalid categoryId')
    }

    // Sử dụng MongoDB Session để đảm bảo atomicity (M1-06)
    const created = await withMongoSession(async (session) => {
        let wallet

        // Nếu không có walletId hoặc là 'uncategorized', lấy/tạo default wallet
        if (useDefaultWallet) {
            wallet = await getOrCreateDefaultWallet(userId, session)
            walletId = wallet._id
        } else {
            // Tìm wallet và kiểm tra quyền truy cập
            wallet = await Wallet.findById(walletId).session(session)
            if (!wallet || !canAccessWallet(wallet, userId)) {
                throw httpError(404, 'Wallet not found or access denied')
            }
        }

        // Tạo transaction
        const tx = await Transaction.create([{
            userId,
            walletId: walletId || undefined,
            categoryId: categoryId || undefined,
            amount,
            type,
            category,
            account,
            date,
            note,
            goalId: transactionData.goalId || undefined, // Thêm goalId nếu có
        }], { session })

        // // Cập nhật balance của wallet
        // wallet.currentBalance += signedAmount(type, amount)
        // await wallet.save({ session })

        // // Tự động cập nhật Budget spent và Saving Goal (nếu có)
        // await updateBalanceOnTransaction(userId, tx[0], session)

        return tx[0]
    })

    return created
}

/**
 * Service: Cập nhật transaction
 * 
 * M1-07: Hoàn tiền cũ -> Trừ tiền mới (Rollback balance)
 * - Rollback balance cũ
 * - Áp dụng balance mới
 * - Hỗ trợ thay đổi wallet
 * 
 * @param {String} userId - User ID
 * @param {String} transactionId - Transaction ID
 * @param {Object} updates - { amount, type, walletId?, categoryId?, category?, account?, date?, note? }
 * @returns {Object} Updated transaction
 */
export const updateTransactionService = async (userId, transactionId, updates) => {
    const { amount, type, walletId, categoryId, category, account, date, note } = updates

    // Data đã được validate bởi middleware
    // Service chỉ xử lý business logic

    const updated = await withMongoSession(async (session) => {
        // Tìm transaction
        const tx = await Transaction.findOne({ _id: transactionId, userId }).session(session)
        if (!tx) {
            throw httpError(404, 'Transaction not found')
        }

        // Lưu lại transaction cũ để rollback
        const oldTransaction = { ...tx.toObject() }

        const oldWalletId = tx.walletId?.toString()
        const newWalletId = (walletId || tx.walletId)?.toString()

        // Tính toán balance cũ và mới
        const oldSigned = signedAmount(tx.type, tx.amount)
        const newSigned = signedAmount(type, amount)

        // Case 1: Thay đổi wallet (M1-07: Rollback balance từ wallet cũ, thêm vào wallet mới)
        if (oldWalletId !== newWalletId) {
            const oldWallet = await Wallet.findById(oldWalletId).session(session)
            const newWalletDoc = await Wallet.findById(newWalletId).session(session)

            if (!oldWallet || !canAccessWallet(oldWallet, userId)) {
                throw httpError(404, 'Old wallet not found or access denied')
            }
            if (!newWalletDoc || !canAccessWallet(newWalletDoc, userId)) {
                throw httpError(404, 'New wallet not found or access denied')
            }

            // Rollback balance từ wallet cũ
            oldWallet.currentBalance -= oldSigned
            // Thêm balance vào wallet mới
            newWalletDoc.currentBalance += newSigned

            await oldWallet.save({ session })
            await newWalletDoc.save({ session })
        } else {
            // Case 2: Cùng wallet (M1-07: Rollback và apply trong cùng 1 wallet)
            const wallet = await Wallet.findById(newWalletId).session(session)
            if (!wallet || !canAccessWallet(wallet, userId)) {
                throw httpError(404, 'Wallet not found or access denied')
            }

            // Rollback balance cũ và apply balance mới
            wallet.currentBalance += (newSigned - oldSigned)
            await wallet.save({ session })
        }

        // Rollback Budget và Saving Goal balance cũ
        await rollbackBalanceOnTransaction(userId, oldTransaction, session)

        // Cập nhật transaction
        tx.amount = amount
        tx.type = type
        tx.walletId = walletId || tx.walletId
        if (categoryId !== undefined) {
            tx.categoryId = categoryId ? categoryId : undefined
        }
        tx.category = category
        tx.account = account
        tx.date = date
        tx.note = note
        if (updates.goalId !== undefined) {
            tx.goalId = updates.goalId || undefined
        }

        await tx.save({ session })

        // Apply Budget và Saving Goal balance mới
        await updateBalanceOnTransaction(userId, tx, session)

        return tx
    })

    return updated
}

/**
 * Service: Xóa transaction
 * 
 * M1-07: Rollback balance khi xóa transaction
 * - Hoàn lại số tiền vào wallet
 * - Xóa transaction
 * 
 * @param {String} userId - User ID
 * @param {String} transactionId - Transaction ID
 * @returns {Boolean} Success
 */
export const deleteTransactionService = async (userId, transactionId) => {
    // console.log('deleteTransactionService', userId, transactionId);
    await withMongoSession(async (session) => {
        // Tìm transaction
        const tx = await Transaction.findOne({ _id: transactionId, userId }).session(session)
        if (!tx) {
            throw httpError(404, 'Transaction not found')
        }

        // Lưu lại transaction để rollback
        const oldTransaction = { ...tx.toObject() }

        // Tìm wallet
        const wallet = await Wallet.findById(tx.walletId).session(session)
        if (!wallet || !canAccessWallet(wallet, userId)) {
            throw httpError(404, 'Wallet not found or access denied')
        }

        // Rollback Wallet balance (M1-07)
        wallet.currentBalance -= signedAmount(tx.type, tx.amount)
        await wallet.save({ session })

        // Rollback Budget và Saving Goal balance
        await rollbackBalanceOnTransaction(userId, oldTransaction, session)

        // Xóa transaction
        await Transaction.deleteOne({ _id: tx._id }).session(session)
        return true
    })

    return false
}

/**
 * Service: Chuyển tiền giữa 2 wallets
 * 
 * Tạo 2 transactions:
 * - Expense từ wallet nguồn
 * - Income vào wallet đích
 * Sử dụng MongoDB Session để đảm bảo atomicity
 * 
 * @param {String} userId - User ID
 * @param {Object} transferData - { fromWalletId, toWalletId, amount, date?, note? }
 * @returns {Object} { fromTransaction, toTransaction }
 */
export const transferMoneyService = async (userId, transferData) => {
    const { fromWalletId, toWalletId, amount, date, note } = transferData

    // Data đã được validate bởi middleware
    // Service chỉ xử lý business logic

    if (!fromWalletId || !mongoose.Types.ObjectId.isValid(fromWalletId)) {
        throw httpError(400, 'Invalid fromWalletId')
    }
    if (!toWalletId || !mongoose.Types.ObjectId.isValid(toWalletId)) {
        throw httpError(400, 'Invalid toWalletId')
    }
    if (fromWalletId === toWalletId) {
        throw httpError(400, 'Wallets must be different')
    }
    if (typeof amount !== 'number' || amount <= 0) {
        throw httpError(400, 'Invalid amount')
    }

    const result = await withMongoSession(async (session) => {
        // Tìm cả 2 wallets
        const [fromWallet, toWallet] = await Promise.all([
            Wallet.findById(fromWalletId).session(session),
            Wallet.findById(toWalletId).session(session),
        ])

        if (!fromWallet || !canAccessWallet(fromWallet, userId)) {
            throw httpError(404, 'From wallet not found or access denied')
        }
        if (!toWallet || !canAccessWallet(toWallet, userId)) {
            throw httpError(404, 'To wallet not found or access denied')
        }

        const when = date ? new Date(date) : new Date()

        // Tạo 2 transactions
        const created = await Transaction.create([
            {
                userId,
                walletId: fromWallet._id,
                amount,
                type: 'expense',
                category: 'Transfer',
                date: when,
                note: note || `Transfer to ${toWallet.name}`,
            },
            {
                userId,
                walletId: toWallet._id,
                amount,
                type: 'income',
                category: 'Transfer',
                date: when,
                note: note || `Transfer from ${fromWallet.name}`,
            },
        ], { session })

        // Cập nhật balance của cả 2 wallets
        fromWallet.currentBalance += signedAmount('expense', amount)
        toWallet.currentBalance += signedAmount('income', amount)

        await Promise.all([
            fromWallet.save({ session }),
            toWallet.save({ session }),
        ])

        return { fromTransaction: created[0], toTransaction: created[1] }
    })

    return result
}

/**
 * Service: Lấy danh sách transactions
 * 
 * @param {String} userId - User ID
 * @param {Object} query - Query parameters từ request
 * @returns {Array} List of transactions
 */
export const getTransactionsService = async (userId, query) => {
    const { filter, sort, limit, skip } = buildTransactionQuery({ userId, query })
    const transactionList = await Transaction.find(filter).sort(sort).skip(skip).limit(limit)

    return transactionList;
}

export default {
    createTransactionService,
    updateTransactionService,
    deleteTransactionService,
    transferMoneyService,
    getTransactionsService,
}
