// node verify_saving_goal_model.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from './models/User.js'
import SavingGoal from './models/SavingGoal.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intro-se-project'

async function verify() {
    console.log('Connecting to DB...')
    await mongoose.connect(MONGODB_URI)

    try {
        const timestamp = Date.now()

        // 1. Setup User
        const user = await User.create({
            _id: `user_${timestamp}`,
            name: 'GoalUser',
            email: `goal_${timestamp}@example.com`,
            password: '123'
        })
        console.log(`Created User: ${user._id}`)

        // 2. Create Saving Goal
        const deadline = new Date()
        deadline.setMonth(deadline.getMonth() + 6) // 6 months from now

        const goal = await SavingGoal.create({
            userId: user._id,
            name: 'Buy Laptop',
            targetAmount: 2000,
            deadline: deadline,
            status: 'active'
        })
        console.log('Created Saving Goal:', goal.id)

        // 3. Verify Fields
        if (goal.targetAmount !== 2000) throw new Error('targetAmount mismatch')
        if (goal.currentAmount !== 0) throw new Error('currentAmount default should be 0')
        if (goal.status !== 'active') throw new Error('status mismatch')
        if (goal.userId !== user._id) throw new Error('userId mismatch')

        // 4. Update Current Amount (simulate contribution)
        goal.currentAmount = 500
        await goal.save()
        console.log('Updated currentAmount to 500')

        const updatedGoal = await SavingGoal.findById(goal.id)
        if (updatedGoal.currentAmount !== 500) throw new Error('currentAmount update failed')

        // 5. Cleanup
        await SavingGoal.deleteMany({ userId: user._id })
        await User.deleteMany({ _id: user._id })
        console.log('Cleanup Done')

        console.log('VERIFICATION SUCCESSFUL: SavingGoal Model')

    } catch (err) {
        console.error('FAILED:', err)
    } finally {
        await mongoose.disconnect()
    }
}

verify()
