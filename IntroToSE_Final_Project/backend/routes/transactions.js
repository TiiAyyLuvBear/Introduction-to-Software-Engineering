import express from 'express'
import { getTransactions, createTransaction, deleteTransaction, updateTransaction } from '../controllers/transactionsController.js'

const router = express.Router()

router.get('/', getTransactions)
router.post('/', createTransaction)
router.put('/:id', updateTransaction)
router.delete('/:id', deleteTransaction)

export default router
