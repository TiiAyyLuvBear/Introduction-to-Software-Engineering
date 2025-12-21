import express from 'express'
import {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal,
} from '../controllers/goalsController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, getGoals)
router.get('/:id', authenticate, getGoal)
router.post('/', authenticate, createGoal)
router.post('/:id/contribute', authenticate, contributeToGoal)
router.put('/:id', authenticate, updateGoal)
router.delete('/:id', authenticate, deleteGoal)

export default router
