
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from './models/User.js'
import Wallet from './models/Wallet.js'
import Budget from './models/Budget.js'
import Category from './models/Category.js' // We might need a category for completeness, or just use ObjectId
import { checkOverspend } from './utils/budgetUtils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intro-se-project'

async function setup() {
    await mongoose.connect(MONGODB_URI)
    return await mongoose.connection.db.admin().ping()
}

async function runTest() {
    console.log('Connecting...')
    await setup()

    // 1. Create Test Data
    const userId = new mongoose.Types.ObjectId()
    const walletId = new mongoose.Types.ObjectId()
    const categoryId = new mongoose.Types.ObjectId() // Mock category ID

    console.log(`Test Data: Wallet ${walletId}, Category ${categoryId}`)

    // 2. Create Budget (Active, Current Period)
    const budget = await Budget.create({
        userId,
        walletId,
        categoryId,
        name: 'Utility Test Budget',
        amount: 1000,
        spent: 250, // 25%
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    })
    console.log('Created Budget (25% spent)')

    // 3. Test checkOverspend
    const pct = await checkOverspend(walletId, categoryId)
    console.log(`Result: ${pct}%`)

    if (pct !== 25) throw new Error(`Expected 25%, got ${pct}%`)

    const pct2 = await checkOverspend(walletId, new mongoose.Types.ObjectId()) // Non-existent
    console.log(`Result for non-existent: ${pct2}`)
    if (pct2 !== null) throw new Error('Expected null for non-existent budget')

    // Cleanup
    await Budget.findByIdAndDelete(budget._id)

    console.log('VERIFICATION SUCCESSFUL')
    await mongoose.disconnect()
}

runTest().catch(console.error)
