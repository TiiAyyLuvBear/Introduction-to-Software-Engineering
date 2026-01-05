import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Wallet from './models/Wallet.js';
import User from './models/User.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneylover';

async function createDebugWallet() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const email = 'trauma.duongtau@example.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.error('User not found:', email);
            return;
        }

        const walletData = {
            name: 'Debug Cash Wallet',
            type: 'Cash',
            initialBalance: 10000000, // 10 million
            currentBalance: 10000000,
            currency: 'VND', // or USD
            description: 'Created for testing Savings/Budget',
            userId: user._id,
            icon: 'account_balance_wallet'
        };

        // Check if already exists
        const existing = await Wallet.findOne({ userId: user._id, name: walletData.name });
        if (existing) {
            console.log('Test wallet already exists:', existing.name);
        } else {
            const wallet = await Wallet.createWallet(walletData);
            console.log('Created test wallet:', wallet);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createDebugWallet();
