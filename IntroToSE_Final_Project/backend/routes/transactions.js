import express from 'express'
import { getTransactions, createTransaction, deleteTransaction, updateTransaction, transferMoney } from '../controllers/transactionsController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, getTransactions)
router.post('/', authenticate, createTransaction)
router.post('/transfer', authenticate, transferMoney)
router.put('/:id', authenticate, updateTransaction)
router.delete('/:id', authenticate, deleteTransaction)

export default router
