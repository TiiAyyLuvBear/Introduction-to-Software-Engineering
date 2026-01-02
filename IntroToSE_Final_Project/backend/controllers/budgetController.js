import Budget from '../models/Budget.js'
import Wallet from '../models/Wallet.js'
import mongoose from 'mongoose'

/**
 * Controller: Tạo budget mới
 * 
 * Endpoint: POST /api/budgets
 * Body: { walletId, name, amount, period, startDate, endDate, categoryId }
 */
export async function createBudget(req, res) {
    try {
        const { walletId, name, amount, period, startDate, endDate, categoryId } = req.body

        // Basic validation
        if (!walletId || !amount || !startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required fields (walletId, amount, startDate, endDate)' })
        }

        // TC16: Budget amount must be greater than 0
        if (amount <= 0) {
            return res.status(400).json({ error: 'Budget amount must be greater than 0' })
        }

        // TODO: Verify wallet ownership/permission here if req.user is available
        // const wallet = await Wallet.findOne({ _id: walletId, userId: req.user.id })
        // if (!wallet) return res.status(404).json({ error: 'Wallet not found' })

        const budgetData = {
            userId: req.body.userId || req.user?.id, // Assuming auth middleware sets req.user
            walletId,
            name,
            amount,
            period,
            startDate,
            endDate,
            categoryId
        }

        // If auth middleware is not yet fully integrated, we surely need userId. 
        // For now, if no req.user, we expect userId in body for testing ease with existing verification script logic,
        // though in production it should come from token.
        if (!budgetData.userId) {
            return res.status(400).json({ error: 'User ID is required' })
        }

        const newBudget = await Budget.createBudget(budgetData)
        res.status(201).json(newBudget)
    } catch (err) {
        console.error('Create Budget Error:', err)
        res.status(500).json({ error: err.message || 'Server error' })
    }
}

/**
 * Controller: Lấy danh sách budgets
 * 
 * Endpoint: GET /api/budgets
 * Query: walletId, period, status
 */
export async function getBudgets(req, res) {
    try {
        const { walletId, period, status } = req.query
        const userId = req.query.userId || req.user?.id // Temporary allow query param for testing if no auth

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' })
        }

        const options = { status, period, walletId }
        // Clean undefined
        Object.keys(options).forEach(key => options[key] === undefined && delete options[key])

        const budgets = await Budget.getUserBudgets(userId, options)
        res.json(budgets)
    } catch (err) {
        console.error('Get Budgets Error:', err)
        res.status(500).json({ error: 'Server error' })
    }
}

/**
 * Controller: Lấy chi tiết budget
 * 
 * Endpoint: GET /api/budgets/:id
 */
export async function getBudgetById(req, res) {
    try {
        const { id } = req.params
        const budget = await Budget.findById(id).populate('categoryId', 'name type color')

        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' })
        }

        res.json(budget.getDisplayInfo())
    } catch (err) {
        console.error('Get Budget By ID Error:', err)
        res.status(500).json({ error: 'Server error' })
    }
}

/**
 * Controller: Cập nhật budget
 * 
 * Endpoint: PUT /api/budgets/:id
 */
export async function updateBudget(req, res) {
    try {
        const { id } = req.params
        const updates = req.body

        // Validate updates (e.g., prevent changing walletId ownership easily without checks)
        delete updates.userId
        delete updates.walletId // Usually shouldn't change wallet

        const budget = await Budget.findByIdAndUpdate(id, updates, { new: true })
        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' })
        }

        res.json(budget.getDisplayInfo())
    } catch (err) {
        console.error('Update Budget Error:', err)
        res.status(500).json({ error: 'Server error' })
    }
}

/**
 * Controller: Xóa budget
 * 
 * Endpoint: DELETE /api/budgets/:id
 */
export async function deleteBudget(req, res) {
    try {
        const { id } = req.params

        // Soft delete or hard delete? Model has 'status', let's soft delete to 'deleted' or just findByIdAndDelete
        // Requirement says "Delete", and Budget has 'status' enum ['active', 'paused', 'completed']. 
        // Let's do hard delete for now as standard CRUD, or check if specific status logic exists.
        // Existing schema doesn't have 'deleted' status. Let's hard delete.

        const budget = await Budget.findByIdAndDelete(id)
        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' })
        }

        res.json({ success: true, message: 'Budget deleted' })
    } catch (err) {
        console.error('Delete Budget Error:', err)
        res.status(500).json({ error: 'Server error' })
    }
}
