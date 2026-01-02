
import mongoose from 'mongoose'
import User from './models/User.js'
import Wallet from './models/Wallet.js'
import Budget from './models/Budget.js'
import Transaction from './models/Transaction.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intro-se-project'

const API_URL = 'http://localhost:4000/api'

async function setupTestData() {
    await mongoose.connect(MONGODB_URI)

    // 1. Create User
    const user = await User.create({
        name: 'CoverageTester',
        email: `coverage_${Date.now()}@example.com`,
        password: 'password'
    })

    // 2. Create Wallet
    const wallet = await Wallet.create({
        userId: user._id,
        name: 'Test Wallet',
        type: 'Cash',
        initialBalance: 1000000,
        currentBalance: 1000000,
        currency: 'VND'
    })

    return { userId: user._id, walletId: wallet._id }
}

async function cleanup(userId) {
    await Budget.deleteMany({ userId })
    await Transaction.deleteMany({ userId })
    await Wallet.deleteMany({ userId })
    await User.deleteMany({ _id: userId })
    await mongoose.disconnect()
}

async function runTests() {
    console.log('Setting up test data...')
    let ids
    try {
        ids = await setupTestData()
    } catch (e) {
        console.error('Setup failed:', e)
        return
    }

    const { userId, walletId } = ids
    const categoryId = new mongoose.Types.ObjectId() // Generate valid ID

    try {
        // -----------------------------------------------------------------
        // TC16: Create New Budget - Invalid Amount
        // -----------------------------------------------------------------
        console.log('\n--- Test 1: TC16 - Create Budget with Invalid Amount ---')
        const start = new Date()
        const end = new Date()
        end.setMonth(end.getMonth() + 1)

        const invalidBudgetRes = await fetch(`${API_URL}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                walletId,
                name: 'Invalid Budget',
                amount: -100000,
                period: 'monthly',
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                categoryId
            })
        })

        if (invalidBudgetRes.status === 400) {
            console.log('PASSED: System blocked negative amount')
        } else {
            throw new Error(`FAILED: Expected 400, got ${invalidBudgetRes.status}`)
        }

        // Create Valid Budget for next test
        console.log('Creating valid budget for 500k...')
        const budgetRes = await fetch(`${API_URL}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                walletId,
                name: 'Food',
                amount: 500000,
                period: 'monthly',
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                categoryId
            })
        })
        if (!budgetRes.ok) {
            const errText = await budgetRes.text()
            throw new Error(`Create valid budget failed: ${budgetRes.status} ${errText}`)
        }


        // -----------------------------------------------------------------
        // TC19: Check Overspend - Alert Trigger
        // -----------------------------------------------------------------
        console.log('\n--- Test 2: TC19 - Overspend Alert Trigger ---')

        // 1. Transaction within budget (200k)
        console.log('Adding 200k expense (Safe)...')
        const tx1Res = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                walletId, // Now required
                amount: 200000,
                type: 'expense',
                category: categoryId,
                note: 'Dinner'
            })
        })
        if (!tx1Res.ok) {
            const errText = await tx1Res.text()
            throw new Error(`Tx1 failed: ${tx1Res.status} ${errText}`)
        }
        const tx1 = await tx1Res.json()
        if (tx1.alert) console.warn('WARN: Unexpected alert', tx1.alert)

        // 2. Transaction causing overspend (Total 200k + 400k = 600k > 500k)
        console.log('Adding 400k expense (Overspend)...')
        const tx2Res = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                walletId,
                amount: 400000,
                type: 'expense',
                category: categoryId,
                note: 'Party'
            })
        })

        if (!tx2Res.ok) throw new Error(`Tx2 failed: ${tx2Res.status}`)
        const tx2 = await tx2Res.json()

        if (tx2.alert === 'Budget Exceeded') {
            console.log('PASSED: Alert "Budget Exceeded" triggered')
        } else {
            throw new Error(`FAILED: Alert missing. Got: ${tx2.alert}`)
        }

        // 3. Wallet Balance Check
        const wallet = await Wallet.findById(walletId)
        // Initial 1,000,000 - 200,000 - 400,000 = 400,000
        if (wallet.currentBalance === 400000) {
            console.log('PASSED: Wallet balance updated correctly')
        } else {
            throw new Error(`FAILED: Wallet balance incorrect. Expected 400000, got ${wallet.currentBalance}`)
        }

        console.log('\nFULL COVERAGE VERIFICATION SUCCESSFUL')

    } catch (err) {
        console.error('\nVERIFICATION FAILED:', err)
    } finally {
        console.log('Cleaning up...')
        await cleanup(userId)
    }
}

runTests()
