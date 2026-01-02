import express from 'express'
import {
    createGoal,
    getGoals,
    getGoalById,
    updateGoal,
    deleteGoal,
    addContribution,
    removeContribution
} from '../controllers/savingGoalController.js'

const router = express.Router()

/**
 * Saving Goal Routes - API endpoints for Goal Management
 * Base Path: /api/saving-goals
 */

// Basic CRUD
router.post('/', createGoal)
router.get('/', getGoals)
router.get('/:id', getGoalById)
router.put('/:id', updateGoal)
router.delete('/:id', deleteGoal)

// Contribution Management
router.post('/:id/contributions', addContribution)
router.delete('/:id/contributions/:contributionId', removeContribution)

export default router
