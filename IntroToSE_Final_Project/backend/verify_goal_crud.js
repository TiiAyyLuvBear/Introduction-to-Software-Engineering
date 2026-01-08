// node verify_goal_crud.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from './models/User.js'
import Wallet from './models/Wallet.js'
import SavingGoal from './models/SavingGoal.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intro-se-project'

async function verify() {
    console.log('Connecting to DB...')
    await mongoose.connect(MONGODB_URI)

    try {
        const timestamp = Date.now()

        // 1. Setup User and Wallet
        const user = await User.create({
            _id: `user_crud_${timestamp}`,
            name: 'GoalCRUDUser',
            email: `goalcrud_${timestamp}@example.com`,
            password: '123'
        })

        const wallet = await Wallet.create({
            name: 'Wallet Goal CRUD',
            userId: user._id,
            amount: 10000,
            type: 'Cash'
        })

        console.log(`Created User ${user._id} and Wallet ${wallet.id}`)

        // 2. Test Create Goal
        const goalTitle = 'Buy MacM4'
        const goal = await SavingGoal.createGoal({
            userId: user._id,
            walletId: wallet.id,
            name: goalTitle,
            targetAmount: 3000,
            status: 'active',
            deadline: new Date(Date.now() + 86400000 * 30) // 30 days
        })
        console.log('Created Goal:', goal.id, goal.name)

        // 3. Test Uniqueness (Name per wallet) - Logic is in Controller mostly, 
        // but we can check if Model enforces it or if we should rely on Controller.
        // Looking at controller code: "const dup = await SavingGoal.findOne({ walletId: wallet._id, name: name.trim() })"
        // So logic is in Controller. 
        // However, model defines `SavingGoalSchema.index({ walletId: 1, name: 1 })`. 
        // It is NOT unique index in Schema unless `{ unique: true }` is set.
        // Let's check Schema... `SavingGoalSchema.index({ walletId: 1, name: 1 })` (no unique: true).
        // So model allows dupes, controller prevents them. 
        // Verify script acts as "Integration" test if we call Model directly, so we primarily verify Model CRUD.
        // If we want to verify "Controller Logic" (business rules), we should simulate that check or check if we can call Controller functions (hard without req/res mocking).
        // Tests for now: Verify basic CRUD operations on Model.

        // 4. Test Read
        const fetched = await SavingGoal.findById(goal.id)
        if (!fetched || fetched.name !== goalTitle) throw new Error('Read failed')
        console.log('Read Goal: OK')

        // 5. Test Update
        const updated = await SavingGoal.findByIdAndUpdate(goal.id, { targetAmount: 3500 }, { new: true })
        if (updated.targetAmount !== 3500) throw new Error('Update failed')
        console.log('Updated Goal Target: 3500')

        // 6. Test Delete
        await SavingGoal.findByIdAndDelete(goal.id)
        const deleted = await SavingGoal.findById(goal.id)
        if (deleted) throw new Error('Delete failed')
        console.log('Deleted Goal: OK')

        // Cleanup
        await Wallet.deleteMany({ userId: user._id })
        await User.deleteMany({ _id: user._id })
        console.log('Cleanup Done')

        console.log('VERIFICATION SUCCESSFUL: SavingGoal CRUD (Model Level)')

    } catch (err) {
        console.error('FAILED:', err)
    } finally {
        await mongoose.disconnect()
    }
}

verify()
