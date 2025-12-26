import express from 'express'
import { getTransactions, createTransaction, deleteTransaction, updateTransaction, transferMoney } from '../controllers/transactionsController.js'
import authenticate from '../middleware/auth.js'
import {
    validateCreateTransaction,
    validateUpdateTransaction,
    validateDeleteTransaction,
    validateTransferMoney
} from '../middleware/validateTransaction.js'

const router = express.Router()

// GET /api/transactions - Lấy danh sách transactions
router.get('/', authenticate, getTransactions)

// POST /api/transactions - Tạo transaction mới
router.post('/', authenticate, validateCreateTransaction, createTransaction)

// POST /api/transactions/transfer - Chuyển tiền giữa wallets
router.post('/transfer', authenticate, validateTransferMoney, transferMoney)

// PUT /api/transactions/:id - Cập nhật transaction
router.put('/:id', authenticate, validateUpdateTransaction, updateTransaction)

// DELETE /api/transactions/:id - Xóa transaction
router.delete('/:id', authenticate, validateDeleteTransaction, deleteTransaction)

export default router
