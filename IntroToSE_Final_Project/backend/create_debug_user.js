import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneylover';

async function createDebugUser() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const email = 'trauma.duongtau@example.com';
        const password = 'password123';

        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists. Resetting password...');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            console.log('Password reset to:', password);
        } else {
            console.log('Creating user:', email);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                name: 'Trauma Duong Tau',
                email: email,
                password: hashedPassword
            });
            await user.save();
            console.log('User created successfully.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createDebugUser();
