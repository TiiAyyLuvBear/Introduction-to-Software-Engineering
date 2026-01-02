import Budget from '../models/Budget.js'

/**
 * Utility: Check Overspend
 * Input: walletId, categoryId
 * Output: % đã chi tiêu so với Budget. (number)
 * 
 * Logic:
 * 1. Convert IDs to string if needed (though mongoose query handles objectId/string)
 * 2. Find ACTIVE budget matching walletId and categoryId
 * 3. Filter for current date falling within startDate and endDate
 * 4. If multiple budgets found (unlikely if validation works), pick the first one
 * 5. Return percentage
 * 6. If no budget found, return null (or 0, dependent on requirement. "M3-02... check overspend" usually implies returning status relative to a budget. If no budget, overspend check is N/A. Returning null distinguishes "no budget" vs "0% spent").
 */
export async function checkOverspend(walletId, categoryId) {
    try {
        const now = new Date()

        const budget = await Budget.findOne({
            walletId,
            categoryId,
            status: 'active',
            startDate: { $lte: now },
            $or: [
                { endDate: { $gte: now } },
                { endDate: null }
            ]
        })

        if (!budget) {
            return null
        }

        return budget.getSpendingPercentage()
    } catch (err) {
        console.error('Error in checkOverspend:', err)
        throw err
    }
}
