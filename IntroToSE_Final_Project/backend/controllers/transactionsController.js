/**
 * Transaction Controller - Thin Controller Pattern
 * 
 * Controller chỉ nhận request và gọi service
 * Validation được thực hiện bởi middleware
 * Business logic được xử lý bởi service
 * Error response: { status, message, data? }
 */

import {
  createTransactionService,
  updateTransactionService,
  deleteTransactionService,
  transferMoneyService,
  getTransactionsService
} from '../services/transactionsService.js'

import { sendSuccess, sendError, sendUnauthorized, sendServerError } from '../utils/errorResponse.js'

/**
 * GET /api/transactions
 * 
 * Lấy danh sách transactions của user
 */
export async function getTransactions(req, res) {
  try {
    const userId = req.user?.id;

    const transactionList = await getTransactionsService(userId, req.query)

    return sendSuccess(res, 200, 'Transactions retrieved successfully', transactionList)
  } catch (err) {
    console.error('[getTransactions]', err)
    if (err.status) return sendError(res, err.status, err.message)
    return sendServerError(res)
  }
}

/**
 * POST /api/transactions
 * 
 * Tạo transaction mới
 * Body: { amount, type, walletId?, categoryId?, category?, account?, date?, note?, goalId? }
 */
export async function createTransaction(req, res) {
  try {
    const userId = req.user?.id

    const created = await createTransactionService(userId, req.body)
    return sendSuccess(res, 201, 'Transaction created successfully', created)
  } catch (err) {
    console.error('[createTransaction]', err)
    if (err.status) return sendError(res, err.status, err.message)
    return sendServerError(res)
  }
}

/**
 * PUT /api/transactions/:id
 * 
 * Cập nhật transaction
 * Body: { amount, type, walletId?, categoryId?, category?, account?, date?, note?, goalId? }
 */
export async function updateTransaction(req, res) {
  try {
    const userId = req.user?.id

    const transactionId = String(req.params.id);
    const updated = await updateTransactionService(userId, transactionId, req.body)

    return sendSuccess(res, 200, 'Transaction updated successfully', updated)
  } catch (err) {
    res.json({
      status: err.status,
      message: err.message,
      data: err.data
    })
  }
}

/**
 * DELETE /api/transactions/:id
 * 
 * Xóa transaction
 */
export async function deleteTransaction(req, res) {
  try {
    const userId = req.user?.id;

    const transactionId = String(req.params.id);
    await deleteTransactionService(userId, transactionId);

    return sendSuccess(res, 200, 'Transaction deleted successfully')
  } catch (err) {
    res.json({
      status: err.status,
      message: err.message,
      data: err.data
    })
  }
}

/**
 * POST /api/transactions/transfer
 * 
 * Chuyển tiền giữa 2 wallets
 * Body: { fromWalletId, toWalletId, amount, date?, note? }
 */
export async function transferMoney(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return sendUnauthorized(res)

    const result = await transferMoneyService(userId, req.body)
    return sendSuccess(res, 201, 'Money transferred successfully', result)
  } catch (err) {
    console.error('[transferMoney]', err)
    if (err.status) return sendError(res, err.status, err.message)
    return sendServerError(res)
  }
}
