// node verify_budget_crud.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from './models/User.js'
import Wallet from './models/Wallet.js'
import Budget from './models/Budget.js'

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
            name: 'BudgetCRUDUser',
            email: `crud_${timestamp}@example.com`,
            password: '123'
        })

        // Create 2 Wallets
        const wallet1 = await Wallet.create({ name: 'Wallet A', userId: user._id, amount: 1000, type: 'Cash' })
        const wallet2 = await Wallet.create({ name: 'Wallet B', userId: user._id, amount: 2000, type: 'Cash' })

        console.log(`Created User ${user._id} and Wallets ${wallet1._id}, ${wallet2._id}`)

        // 2. Create Budget in Wallet 1
        const b1 = await Budget.createBudget({
            userId: user._id,
            walletId: wallet1._id,
            name: 'Food W1',
            amount: 500,
            period: 'monthly',
            startDate: new Date()
        })
        console.log('Created Budget 1 in Wallet 1:', b1.id)

        // 3. Test Uniqueness in Wallet 1 (Should Fail)
        try {
            await Budget.createBudget({
                userId: user._id,
                walletId: wallet1._id,
                name: 'Food W1 Dupe',
                amount: 600,
                period: 'monthly',
                startDate: new Date()
            })
            throw new Error('Uniqueness check FAILED: Should not allow duplicate budget in same wallet')
        } catch (e) {
            if (e.message.includes('already exists')) {
                console.log('Uniqueness check PASSED: Prevented duplicate in Wallet 1')
            } else {
                throw e
            }
        }

        // 4. Test Cross-Wallet Creation (Should Succeed)
        const b2 = await Budget.createBudget({
            userId: user._id,
            walletId: wallet2._id, // Different Wallet
            name: 'Food W2',
            amount: 500,
            period: 'monthly',
            startDate: new Date()
        })
        console.log('Created Budget 2 in Wallet 2:', b2.id)
        if (b1.id.toString() === b2.id.toString()) throw new Error('Budgets should be different')

        // 5. Cleanup
        await Budget.deleteMany({ userId: user._id })
        await Wallet.deleteMany({ userId: user._id })
        await User.deleteMany({ _id: user._id })
        console.log('Cleanup Done')

        console.log('VERIFICATION SUCCESSFUL: Budget CRUD/Uniqueness Logic')

    } catch (err) {
        console.error('FAILED:', err)
    } finally {
        await mongoose.disconnect()
    }
}

verify()
