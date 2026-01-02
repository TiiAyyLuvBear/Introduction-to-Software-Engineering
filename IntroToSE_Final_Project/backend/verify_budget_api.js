// node verify_budget_model.js
// Basic verify script using node-fetch (requires installing it or using recent Node version. Default modern Node has global fetch)

import mongoose from 'mongoose'
import User from './models/User.js'
import Wallet from './models/Wallet.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load env vars to connect mongo directly for setup
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intro-se-project'

const API_URL = 'http://localhost:4000/api'

// We need a server running for this. I will assume the user has `npm run dev` running.
// If not, this script will fail to fetch.

async function setupTestData() {
    await mongoose.connect(MONGODB_URI)
    const user = await User.create({
        name: 'APITestUser',
        email: `apitest_${Date.now()}@example.com`,
        password: 'password123'
    })
    const wallet = await Wallet.create({
        name: 'APITestWallet',
        type: 'Cash',
        userId: user._id,
        amount: 1000
    })
    return { userId: user._id, walletId: wallet._id }
}

async function cleanup(userId) {
    await Wallet.deleteMany({ userId })
    await User.deleteMany({ _id: userId })
    // Also delete budgets for this user (we actually don't have deleteMany in controller exposed easily, 
    // but we can rely on our script being clean or mongo clean)
    // Let's delete manually via mongoose
    const Budget = mongoose.model('Budget')
    await Budget.deleteMany({ userId })
    await mongoose.disconnect()
}

async function runTests() {
    console.log('Setting up test data...')
    let testData
    try {
        testData = await setupTestData()
    } catch (e) {
        console.error('Setup failed (MongoDB connection error?):', e.message)
        return
    }

    const { userId, walletId } = testData
    console.log(`User: ${userId}, Wallet: ${walletId}`)

    try {
        // 1. Create Budget
        console.log('\n--- Test 1: Create Budget ---')
        const createRes = await fetch(`${API_URL}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId, // Sending userId manually as per our controller logic for now
                walletId,
                name: 'API Budget',
                amount: 2000,
                period: 'monthly',
                startDate: new Date().toISOString(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
            })
        })

        if (!createRes.ok) throw new Error(`Create failed: ${createRes.status} ${await createRes.text()}`)
        const budget = await createRes.json()
        console.log('Created:', budget.id, budget.name)

        // 2. Get Budgets
        console.log('\n--- Test 2: Get Budgets ---')
        const getRes = await fetch(`${API_URL}/budgets?userId=${userId}&walletId=${walletId}`)
        if (!getRes.ok) throw new Error(`Get failed: ${getRes.status}`)
        const list = await getRes.json()
        console.log('List count:', list.length)
        if (list.length === 0) throw new Error('List should not be empty')

        // 3. Get By ID
        console.log('\n--- Test 3: Get By ID ---')
        const getOneRes = await fetch(`${API_URL}/budgets/${budget.id}`)
        if (!getOneRes.ok) throw new Error(`GetOne failed: ${getOneRes.status}`)
        const fetchedBudget = await getOneRes.json()
        console.log('Fetched:', fetchedBudget.name)

        // 4. Update Budget
        console.log('\n--- Test 4: Update Budget ---')
        const updateRes = await fetch(`${API_URL}/budgets/${budget.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 3000, name: 'Updated API Budget' })
        })
        if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status}`)
        const updatedBudget = await updateRes.json()
        console.log('Updated:', updatedBudget.amount, updatedBudget.name)

        // 5. Delete Budget
        console.log('\n--- Test 5: Delete Budget ---')
        const deleteRes = await fetch(`${API_URL}/budgets/${budget.id}`, { method: 'DELETE' })
        if (!deleteRes.ok) throw new Error(`Delete failed: ${deleteRes.status}`)
        console.log('Deleted successfully')

        console.log('\nAPI VERIFICATION SUCCESSFUL')
    } catch (err) {
        console.error('\nAPI VERIFICATION FAILED:', err)
    } finally {
        console.log('Cleaning up...')
        await cleanup(userId)
    }
}

runTests()
