
import mongoose from 'mongoose'
import User from './models/User.js'
import Wallet from './models/Wallet.js'
import SavingGoal from './models/SavingGoal.js'
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
        name: 'GoalTransTester',
        email: `goaltrans_${Date.now()}@example.com`,
        password: 'password'
    })

    // 2. Create Wallet with Balance
    const wallet = await Wallet.create({
        userId: user._id,
        name: 'Main Wallet',
        type: 'Cash',
        initialBalance: 10000,
        currentBalance: 10000,
        currency: 'VND'
    })

    return { userId: user._id, walletId: wallet._id }
}

async function cleanup(userId) {
    await Transaction.deleteMany({ userId })
    await SavingGoal.deleteMany({ userId })
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
    console.log(`User: ${userId}, Wallet: ${walletId}`)

    try {
        // 1. Create Goal Linked to Wallet
        console.log('\n--- Test 1: Create Goal Linked to Wallet ---')
        const deadline = new Date()
        deadline.setFullYear(deadline.getFullYear() + 1)

        const createRes = await fetch(`${API_URL}/saving-goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                name: 'Car Fund',
                targetAmount: 50000,
                deadline: deadline.toISOString(),
                walletId // Linked!
            })
        })

        if (!createRes.ok) throw new Error(`Create failed: ${createRes.status}`)
        const createData = await createRes.json()
        const goal = createData.data
        console.log('Created Goal:', goal.id)

        // 2. Add Contribution (Should trigger Transaction)
        console.log('\n--- Test 2: Add Contribution with Transaction ---')
        const contribRes = await fetch(`${API_URL}/saving-goals/${goal.id}/contributions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 1000, note: 'Monthly saving' })
        })

        if (!contribRes.ok) throw new Error(`Add failed: ${contribRes.status}`)
        const contribData = await contribRes.json()
        const updatedGoal = contribData.data

        // Check Goal
        if (updatedGoal.currentAmount !== 1000) throw new Error('Goal amount mismatch')
        console.log('Goal updated correctly')

        // Check Wallet (Should decrease by 1000 -> 9000)
        const wallet = await Wallet.findById(walletId)
        if (wallet.currentBalance !== 9000) throw new Error(`Wallet balance mismatch. Expected 9000, got ${wallet.currentBalance}`)
        console.log('Wallet balance decreased correctly')

        // Check Transaction
        const transaction = await Transaction.findOne({ userId, walletId, amount: 1000, type: 'expense' })
        if (!transaction) throw new Error('Transaction record not found')
        console.log('Transaction record created')

        // 3. Remove Contribution (Should Refund)
        console.log('\n--- Test 3: Remove Contribution & Refund ---')
        // Need contribution ID
        // Since API returns display info, contributions might be array of objects.
        // NOTE: Schema definition suggests contributions is array of subdocuments.
        // The getDisplayInfo might not include _id of contributions easily unless detailed.
        // Let's re-fetch goal from DB to get exact contribution ID if API doesn't expose it fully or verify schema.
        const goalFromDb = await SavingGoal.findById(goal.id)
        const contribId = goalFromDb.contributions[0]._id

        const removeRes = await fetch(`${API_URL}/saving-goals/${goal.id}/contributions/${contribId}`, {
            method: 'DELETE'
        })
        if (!removeRes.ok) throw new Error(`Remove failed: ${removeRes.status}`)

        // Check Wallet (Should increase back to 10000)
        const walletRef = await Wallet.findById(walletId)
        if (walletRef.currentBalance !== 10000) throw new Error(`Wallet refund failed. Expected 10000, got ${walletRef.currentBalance}`)
        console.log('Wallet refunded correctly')

        // Check Transaction (Should be deleted)
        const transRef = await Transaction.findById(transaction._id)
        if (transRef) throw new Error('Transaction should be deleted')
        console.log('Transaction deleted correctly')

        console.log('\nVERIFICATION SUCCESSFUL')
    } catch (err) {
        console.error('\nVERIFICATION FAILED:', err)
    } finally {
        console.log('Cleaning up...')
        await cleanup(userId)
    }
}

runTests()
