
import mongoose from 'mongoose'
import User from './models/User.js'
import SavingGoal from './models/SavingGoal.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intro-se-project'

const API_URL = 'http://localhost:4000/api'

// We expect server running at port 4000

async function setupTestData() {
    await mongoose.connect(MONGODB_URI)
    const user = await User.create({
        name: 'GoalAPITester',
        email: `goalapi_${Date.now()}@example.com`,
        password: 'password123'
    })
    return user._id
}

async function cleanup(userId) {
    await SavingGoal.deleteMany({ userId })
    await User.deleteMany({ _id: userId })
    await mongoose.disconnect()
}

async function runTests() {
    console.log('Setting up test data...')
    let userId
    try {
        userId = await setupTestData()
    } catch (e) {
        console.error('Setup failed:', e.message)
        return
    }

    console.log(`User ID: ${userId}`)

    try {
        // 1. Create Goal
        console.log('\n--- Test 1: Create Goal ---')
        const deadline = new Date()
        deadline.setFullYear(deadline.getFullYear() + 1)

        const createRes = await fetch(`${API_URL}/saving-goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                name: 'API Goal',
                targetAmount: 10000,
                deadline: deadline.toISOString(),
                description: 'Test goal via API',
                priority: 'high'
            })
        })

        if (!createRes.ok) throw new Error(`Create failed: ${createRes.status} ${await createRes.text()}`)
        const createData = await createRes.json() // { success, data, message }
        const goal = createData.data
        console.log('Created:', goal.id, goal.name)

        // 2. Add Contribution
        console.log('\n--- Test 2: Add Contribution ---')
        const contribRes = await fetch(`${API_URL}/saving-goals/${goal.id}/contributions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 2000, note: 'First saving' })
        })
        if (!contribRes.ok) throw new Error(`Add Contribution failed: ${contribRes.status}`)
        const contribData = await contribRes.json()
        const updatedGoal = contribData.data
        console.log(`Added 2000. Current Amount: ${updatedGoal.currentAmount}. Progress: ${updatedGoal.progress}%`)

        if (updatedGoal.currentAmount !== 2000) throw new Error('Contribution update failed')

        // 3. Get Goals
        console.log('\n--- Test 3: Get Goals ---')
        const getRes = await fetch(`${API_URL}/saving-goals?userId=${userId}`)
        if (!getRes.ok) throw new Error(`Get failed: ${getRes.status}`)
        const listData = await getRes.json()
        const list = listData.data
        console.log('List count:', list.length)
        if (list.length === 0) throw new Error('List should not be empty')

        // 4. Update Goal
        console.log('\n--- Test 4: Update Goal ---')
        const updateRes = await fetch(`${API_URL}/saving-goals/${goal.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Updated API Goal', priority: 'medium' })
        })
        if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status}`)
        const updateData = await updateRes.json()
        console.log('Updated Name:', updateData.data.name)

        // 5. Delete Goal
        console.log('\n--- Test 5: Delete Goal ---')
        const deleteRes = await fetch(`${API_URL}/saving-goals/${goal.id}`, { method: 'DELETE' })
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
