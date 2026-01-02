
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from './models/User.js'
import SavingGoal from './models/SavingGoal.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intro-se-project'

async function verifySavingGoal() {
    console.log('Connecting to MongoDB...')
    try {
        await mongoose.connect(MONGODB_URI)

        // 1. Create Dummy User
        const user = await User.create({
            name: 'GoalTester',
            email: `goaltester_${Date.now()}@example.com`,
            password: 'password'
        })
        console.log(`Created User: ${user._id}`)

        // 2. Create Saving Goal
        const deadline = new Date()
        deadline.setFullYear(deadline.getFullYear() + 1) // 1 year from now

        const goalData = {
            userId: user._id,
            name: 'Buy Tesla',
            targetAmount: 50000,
            currentAmount: 0,
            deadline: deadline,
            status: 'active'
        }

        const goal = await SavingGoal.create(goalData)
        console.log('Created Goal:', goal.getDisplayInfo())

        // 3. Verify Fields
        if (goal.targetAmount !== 50000) throw new Error('Target amount match failed')
        if (goal.currentAmount !== 0) throw new Error('Current amount default failed')
        if (goal.status !== 'active') throw new Error('Status default failed')

        // 4. Test Methods
        // Add contribution logic verification if wanted, but basic schema check is requested.
        // Let's manually update currentAmount to test progress
        goal.currentAmount = 25000
        await goal.save()

        if (goal.getProgress() !== 50) throw new Error(`Expected 50% progress, got ${goal.getProgress()}%`)
        if (goal.getRemainingAmount() !== 25000) throw new Error(`Expected 25000 remaining, got ${goal.getRemainingAmount()}`)

        console.log('VERIFICATION SUCCESSFUL: SavingsGoal model works as expected.')

        // Cleanup
        await SavingGoal.deleteMany({ userId: user._id })
        await User.deleteMany({ _id: user._id })
    } catch (err) {
        console.error('VERIFICATION FAILED:', err)
    } finally {
        await mongoose.disconnect()
    }
}

verifySavingGoal()
