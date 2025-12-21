import express from 'express'
import {
  createBudget,
  getBudgets,
  getOverspend,
  getBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetsController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, getBudgets)
router.get('/overspend', authenticate, getOverspend)
router.get('/:id', authenticate, getBudget)
router.post('/', authenticate, createBudget)
router.put('/:id', authenticate, updateBudget)
router.delete('/:id', authenticate, deleteBudget)

export default router
