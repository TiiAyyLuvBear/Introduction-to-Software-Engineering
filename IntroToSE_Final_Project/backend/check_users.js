import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneylover';

async function checkUsers() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('--- ALL USERS ---');
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}`);
        });
        console.log('-----------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
