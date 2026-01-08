// node verify_overspend.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from './models/User.js'
import Wallet from './models/Wallet.js'
import Budget from './models/Budget.js'
import Category from './models/Category.js'
import Transaction from './models/Transaction.js'
import { computeOverspend } from './utils/budgetOverspend.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intro-se-project'

async function verify() {
    console.log('Connecting to DB...')
    await mongoose.connect(MONGODB_URI)

    try {
        const timestamp = Date.now()

        // 1. Setup Data
        const user = await User.create({
            _id: `user_${timestamp}`,
            name: 'OverspendUser',
            email: `overspend_${timestamp}@example.com`,
            password: '123'
        })

        const wallet = await Wallet.create({
            name: `Wallet Overspend ${timestamp}`,
            userId: user._id,
            amount: 5000,
            type: 'Cash'
        })

        const category = await Category.create({
            name: 'Food',
            type: 'expense',
            userId: user._id // Note: userId here is String in Category but ObjectId in User model... wait, check Category schema
            // Category schema says userId: { type: String, ref: 'User' }. Correct.
        })

        console.log(`Created User, Wallet, Category: ${category.name}`)

        // 2. Create Budget (1000)
        const budget = await Budget.createBudget({
            userId: user._id,
            walletId: wallet.id,
            categoryId: category.id,
            name: 'Food Budget',
            amount: 1000,
            period: 'monthly',
            startDate: new Date()
        })
        console.log('Created Budget: 1000')

        // 3. Initial Check (0%)
        let result = await computeOverspend({
            userId: user._id,
            walletId: wallet.id,
            categoryId: category.id
        })
        console.log(`Initial Check: ${result.percentage}% (Expected 0)`)
        if (result.percentage !== 0) throw new Error('Initial percentage wrong')

        // 4. Create Transaction (500) -> 50%
        await Transaction.create({
            userId: user._id,
            walletId: wallet.id,
            categoryId: category.id,
            amount: 500,
            type: 'expense',
            date: new Date()
        })

        // Note: computeOverspend might aggregate. We need to wait or just run query.
        // Transaction model might update Budget via hooks? 
        // Budget.js has `updateSpentAmount` static method but it needs to be called manually or via controller.
        // However, `computeOverspend` calculates spent from Transactions on the fly!
        // Let's verify `budgetOverspend.js` content again... 
        // Yes: "const rows = await Transaction.aggregate(...)". It aggregates on the fly. Good.

        result = await computeOverspend({
            userId: user._id,
            walletId: wallet.id,
            categoryId: category.id
        })
        console.log(`After 500 spent: ${result.percentage}% (Expected 50)`)
        if (result.percentage !== 50) throw new Error(`Expected 50%, got ${result.percentage}%`)

        // 5. Create Transaction (600) -> Total 1100 -> 110%
        await Transaction.create({
            userId: user._id,
            walletId: wallet.id,
            categoryId: category.id,
            amount: 600, // Total 1100
            type: 'expense',
            date: new Date()
        })

        result = await computeOverspend({
            userId: user._id,
            walletId: wallet.id,
            categoryId: category.id
        })
        console.log(`After +600 spent (Total 1100): ${result.percentage}% (Expected 110)`)
        if (result.percentage !== 110) throw new Error(`Expected 110%, got ${result.percentage}%`)
        if (!result.isOverBudget) throw new Error('Should be isOverBudget = true')

        // 6. Cleanup
        await Transaction.deleteMany({ userId: user._id })
        await Budget.deleteMany({ userId: user._id })
        await Category.deleteMany({ _id: category.id })
        await Wallet.deleteMany({ userId: user._id })
        await User.deleteMany({ _id: user._id })
        console.log('Cleanup Done')

        console.log('VERIFICATION SUCCESSFUL: Overspend Utility')

    } catch (err) {
        console.error('FAILED:', err)
    } finally {
        await mongoose.disconnect()
    }
}

verify()
