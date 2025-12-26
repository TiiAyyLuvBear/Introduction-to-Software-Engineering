// services/users.js
import admin from 'firebase-admin';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const registerUser = async (userData) => {
    try {
        const { token, name, email } = userData;

        // 1. Xác thực ID Token từ Firebase gửi lên
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new Error('User already exists in MongoDB');
        }

        // 3. Tạo record mới trong MongoDB
        const newUser = new User({
            _id: uid, // Đồng bộ ID với Firebase
            name: name,
            email: email.toLowerCase(),
            roles: ["user"]
        });

        // 4. Save to MongoDB
        const savedUser = await newUser.save();

        return savedUser;
    } catch (error) {
        throw error;
    }
};

export const findByEmail = async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
};

/**
 * Service: Sync profile from Firebase to MongoDB
 * 
 * @param {Object} profileData - { token, name, email, avatarURL?, phoneNumber? }
 * @returns {Object} Updated user
 */
export const syncProfile = async (profileData) => {
    try {
        const { token, name, email, avatarURL, phoneNumber } = profileData;

        // 1. Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;

        // 2. Find or create user
        let user = await User.findById(uid);

        if (!user) {
            // Create new user if not exists
            user = new User({
                _id: uid,
                name: name,
                email: email.toLowerCase(),
                avatarURL: avatarURL || null,
                phoneNumber: phoneNumber || null,
                roles: ["user"]
            });
        } else {
            // Update existing user
            user.name = name;
            user.email = email.toLowerCase();
            if (avatarURL !== undefined) user.avatarURL = avatarURL;
            if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        }

        await user.save();
        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Service: Update user profile (không cho phép thay đổi email)
 * 
 * @param {String} userId - User ID
 * @param {Object} updates - { name?, phoneNumber?, avatarURL? }
 * @returns {Object} Updated user
 */
export const updateProfile = async (userId, updates) => {
    try {
        // Validate userId
        if (!userId) {
            throw new Error('User ID is required');
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Prepare allowed updates (không cho phép thay đổi email)
        const allowedUpdates = {};
        if (updates.name !== undefined) allowedUpdates.name = updates.name;
        if (updates.phoneNumber !== undefined) allowedUpdates.phoneNumber = updates.phoneNumber;
        if (updates.avatarURL !== undefined) allowedUpdates.avatarURL = updates.avatarURL;

        // Nếu có cố gắng thay đổi email, throw error
        if (updates.email !== undefined && updates.email !== user.email) {
            throw new Error('Email cannot be changed');
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            allowedUpdates,
            { new: true, runValidators: true }
        );

        return updatedUser;
    } catch (error) {
        throw error;
    }
};

export default {
    registerUser,
    findByEmail,
    syncProfile,
    updateProfile
};

