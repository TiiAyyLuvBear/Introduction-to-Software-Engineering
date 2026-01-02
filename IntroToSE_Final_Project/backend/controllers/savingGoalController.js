import SavingGoal from '../models/SavingGoal.js'
import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'
import { sendSuccess, sendError, sendNotFound, sendValidationError } from '../utils/response.js'

/**
 * Controller: Tạo Saving Goal mới
 * Endpoint: POST /api/saving-goals
 */
export async function createGoal(req, res) {
    try {
        const { name, targetAmount, deadline, description, walletId, priority, image } = req.body
        const userId = req.body.userId || req.user?.id || req.user?._id

        // Validate required fields
        if (!name || !targetAmount) {
            return sendValidationError(res, 'Name and targetAmount are required')
        }

        if (!userId) {
            return sendError(res, 'User identity missing', 'AUTH_ERROR', 400)
        }

        const goalData = {
            userId,
            name,
            targetAmount,
            deadline,
            description,
            walletId,
            priority,
            image
        }

        const newGoal = await SavingGoal.createGoal(goalData)
        sendSuccess(res, newGoal, 'Saving goal created', 201)
    } catch (err) {
        console.error('Create Goal Error:', err)
        sendError(res, err.message, 'CREATE_GOAL_ERROR', 500)
    }
}

/**
 * Controller: Lấy danh sách goals
 * Endpoint: GET /api/saving-goals
 * Query: status, priority
 */
export async function getGoals(req, res) {
    try {
        const userId = req.query.userId || req.user?.id || req.user?._id
        if (!userId) return sendError(res, 'User identity missing', 'AUTH_ERROR', 400)

        const { status, priority } = req.query
        const goals = await SavingGoal.getUserGoals(userId, { status, priority })

        sendSuccess(res, goals)
    } catch (err) {
        console.error('Get Goals Error:', err)
        sendError(res, err.message, 'GET_GOALS_ERROR', 500)
    }
}

/**
 * Controller: Lấy chi tiết goal
 * Endpoint: GET /api/saving-goals/:id
 */
export async function getGoalById(req, res) {
    try {
        const { id } = req.params
        const goal = await SavingGoal.findById(id).populate('walletId', 'name type balance')

        if (!goal) return sendNotFound(res, 'Saving Goal')

        sendSuccess(res, goal.getDisplayInfo())
    } catch (err) {
        console.error('Get Goal By ID Error:', err)
        sendError(res, err.message, 'GET_GOAL_ERROR', 500)
    }
}

/**
 * Controller: Cập nhật goal
 * Endpoint: PUT /api/saving-goals/:id
 */
export async function updateGoal(req, res) {
    try {
        const { id } = req.params
        const updates = req.body

        // Prevent updating critical fields directly via generic update if needed
        delete updates.userId
        delete updates.currentAmount // Should be updated via contributions
        delete updates.contributions

        const goal = await SavingGoal.findByIdAndUpdate(id, updates, { new: true })
        if (!goal) return sendNotFound(res, 'Saving Goal')

        sendSuccess(res, goal.getDisplayInfo(), 'Saving goal updated')
    } catch (err) {
        console.error('Update Goal Error:', err)
        sendError(res, err.message, 'UPDATE_GOAL_ERROR', 500)
    }
}

/**
 * Controller: Xóa goal
 * Endpoint: DELETE /api/saving-goals/:id
 */
/**
 * Controller: Xóa goal
 * Endpoint: DELETE /api/saving-goals/:id
 */
export async function deleteGoal(req, res) {
    try {
        const { id } = req.params
        const goal = await SavingGoal.findById(id)
        if (!goal) return sendNotFound(res, 'Saving Goal')

        // LOGIC TC24: Delete Goal - Transaction Integrity
        // Refund remaining amount to wallet if applicable
        if (goal.walletId && goal.currentAmount > 0) {
            const wallet = await Wallet.findById(goal.walletId)
            if (wallet) {
                wallet.currentBalance += goal.currentAmount
                await wallet.save()
            }
        }

        // Delete associated transactions
        // Note: We need to find transactions linked to this goal's contributions
        // Simplest way is if we stored goalId on Transaction, but we didn't. 
        // We relied on contributions storing transactionId.
        const transactionIds = goal.contributions
            .map(c => c.transactionId)
            .filter(id => id != null)

        if (transactionIds.length > 0) {
            await Transaction.deleteMany({ _id: { $in: transactionIds } })
        }

        await SavingGoal.findByIdAndDelete(id)
        sendSuccess(res, null, 'Saving goal deleted and funds refunded')
    } catch (err) {
        console.error('Delete Goal Error:', err)
        sendError(res, err.message, 'DELETE_GOAL_ERROR', 500)
    }
}

/**
 * Controller: Thêm contribution
 * Endpoint: POST /api/saving-goals/:id/contributions
 * Body: amount, note
 */
export async function addContribution(req, res) {
    try {
        const { id } = req.params
        const { amount, note } = req.body

        // Validate amount
        if (!amount || amount <= 0) {
            return sendValidationError(res, 'Amount must be positive')
        }

        const goal = await SavingGoal.findById(id)
        if (!goal) return sendNotFound(res, 'Saving Goal')

        // LOGIC M4-03: Goal Transaction Integration
        let transactionId = null

        if (goal.walletId) {
            // 1. Check Wallet Balance
            const wallet = await Wallet.findById(goal.walletId)
            if (!wallet) return sendNotFound(res, 'Linked Wallet')

            if (wallet.currentBalance < amount) {
                return sendError(res, 'Insufficient wallet balance', 'INSUFFICIENT_BALANCE', 400)
            }

            // 2. Create Transaction (Expense)
            const transaction = await Transaction.create({
                userId: goal.userId,
                walletId: goal.walletId,
                amount,
                type: 'expense',
                category: 'Savings',
                account: wallet.type, // or wallet name
                note: note || `Contribution to goal: ${goal.name}`,
                date: new Date()
            })
            transactionId = transaction._id

            // 3. Update Wallet Balance
            wallet.currentBalance -= amount
            await wallet.save()
        }

        const updatedGoalInfo = await goal.addContribution(amount, note, transactionId)
        sendSuccess(res, updatedGoalInfo, 'Contribution added successfully')
    } catch (err) {
        console.error('Add Contribution Error:', err)
        sendError(res, err.message, 'ADD_CONTRIBUTION_ERROR', 400)
    }
}

/**
 * Controller: Xóa contribution
 * Endpoint: DELETE /api/saving-goals/:id/contributions/:contributionId
 */
export async function removeContribution(req, res) {
    try {
        const { id, contributionId } = req.params

        const goal = await SavingGoal.findById(id)
        if (!goal) return sendNotFound(res, 'Saving Goal')

        const contribution = goal.contributions.id(contributionId)
        if (!contribution) return sendNotFound(res, 'Contribution')

        // LOGIC M4-03: Undo Transaction
        if (contribution.transactionId) {
            // 1. Delete Transaction
            await Transaction.findByIdAndDelete(contribution.transactionId)

            // 2. Refund Wallet (if goal has walletId)
            if (goal.walletId) {
                const wallet = await Wallet.findById(goal.walletId)
                if (wallet) {
                    wallet.currentBalance += contribution.amount
                    await wallet.save()
                }
            }
        }

        const updatedGoalInfo = await goal.removeContribution(contributionId)
        sendSuccess(res, updatedGoalInfo, 'Contribution removed and refunded')
    } catch (err) {
        console.error('Remove Contribution Error:', err)
        sendError(res, err.message, 'REMOVE_CONTRIBUTION_ERROR', 400)
    }
}
