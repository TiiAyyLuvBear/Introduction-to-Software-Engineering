/**
 * Balance Routes
 * 
 * Base path: /api/balance
 * 
 * Endpoints:
 * - GET    /api/balance          -> Lấy tổng balance của user
 * - POST   /api/balance/recalculate -> Recalculate balance (verify & fix)
 * - GET    /api/balance/history  -> Lấy balance history theo thời gian
 */

import express from 'express'
import {
    getBalance,
    recalculateBalanceController,
    getBalanceHistoryController
} from '../controllers/balanceController.js'
import authenticate from '../middleware/auth.js'

const router = express.Router()

// GET /api/balance - Lấy tổng balance
router.get('/', authenticate, getBalance)

// POST /api/balance/recalculate - Recalculate balance
router.post('/recalculate', authenticate, recalculateBalanceController)

// GET /api/balance/history - Lấy balance history
router.get('/history', authenticate, getBalanceHistoryController)

export default router
