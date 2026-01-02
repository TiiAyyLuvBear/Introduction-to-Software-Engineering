// node verify_budget_model.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from './models/User.js'
import Wallet from './models/Wallet.js'
import Budget from './models/Budget.js'

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intro-se-project'

async function verifyBudgetModel() {
    console.log('Connecting to MongoDB...')
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('Connected.')

        // 1. Create Dummy User
        const userEmail = `test_budget_${Date.now()}@example.com`
        const user = new User({
            name: 'TestUser', // Changed from username to name
            email: userEmail,
            password: 'password123'
        })
        await user.save()
        console.log(`Created User: ${user._id}`)

        // 2. Create Dummy Wallet
        const wallet = new Wallet({
            name: 'Test Wallet',
            type: 'Cash',
            userId: user._id,
            amount: 1000
        })
        await wallet.save()
        console.log(`Created Wallet: ${wallet._id}`)

        // 3. Create Budget with walletId
        const budgetData = {
            userId: user._id,
            walletId: wallet._id,
            name: 'Test Budget',
            amount: 500,
            period: 'monthly',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }

        // Try creating via static method
        const budgetInfo = await Budget.createBudget(budgetData)
        console.log('Created Budget successfully via createBudget:', budgetInfo)

        // Verify fields
        if (budgetInfo.walletId.toString() !== wallet._id.toString()) {
            throw new Error('Wallet ID mismatch in created budget')
        }

        // Cleanup
        await Budget.deleteMany({ userId: user._id })
        await Wallet.deleteMany({ userId: user._id })
        await User.deleteMany({ _id: user._id })
        console.log('Cleanup completed.')

        console.log('VERIFICATION SUCCESSFUL: Budget model supports walletId correctly.')
    } catch (err) {
        console.error('VERIFICATION FAILED:', err)
    } finally {
        await mongoose.disconnect()
    }
}

verifyBudgetModel()
