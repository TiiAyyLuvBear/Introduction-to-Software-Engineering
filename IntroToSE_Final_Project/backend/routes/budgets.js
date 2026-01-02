import express from 'express'
import {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget
} from '../controllers/budgetController.js'

const router = express.Router()

/**
 * Budget Routes - API endpoints for Budget Management
 * 
 * Base Path: /api/budgets
 */

// @route   POST /api/budgets
// @desc    Create new budget (M3-02)
// @access  Private (TODO: Add auth middleware)
router.post('/', createBudget)

// @route   GET /api/budgets
// @desc    Get all budgets (with filters: walletId, period, status)
// @access  Private
router.get('/', getBudgets)

// @route   GET /api/budgets/:id
// @desc    Get specific budget details
// @access  Private
router.get('/:id', getBudgetById)

// @route   PUT /api/budgets/:id
// @desc    Update budget
// @access  Private
router.put('/:id', updateBudget)

// @route   DELETE /api/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete('/:id', deleteBudget)

export default router
