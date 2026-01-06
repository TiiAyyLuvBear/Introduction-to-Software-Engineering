import express from 'express'
import authenticate from '../middleware/auth.js'
import {
  getSummary,
  getByCategory,
  getByWallet,
  getPieChart,
  getBarChart,
} from '../controllers/reportsController.js'

const router = express.Router()

router.get('/summary', authenticate, getSummary)
router.get('/by-category', authenticate, getByCategory)
router.get('/by-wallet', authenticate, getByWallet)
router.get('/pie-chart', authenticate, getPieChart)
router.get('/bar-chart', authenticate, getBarChart)

export default router
