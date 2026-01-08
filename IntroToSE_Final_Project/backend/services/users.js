// services/users.js
import admin from 'firebase-admin';
import User from '../models/User.js';

export const registerUser = async (userData) => {
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
        // Update existing user - PRESERVE existing data, don't overwrite with Firebase defaults

        // Always update name and email from Firebase (these are source of truth)
        user.name = name;
        user.email = email.toLowerCase();

        // ONLY update avatarURL if:
        // 1. DB doesn't have one (user.avatarURL is null/empty), OR
        // 2. Firebase has a NEW URL that's different AND DB doesn't have Base64
        // DON'T overwrite Base64 avatarURL with Firebase Google URL
        if (!user.avatarURL || (avatarURL && !user.avatarURL.startsWith('data:'))) {
            // DB has no avatar OR DB has external URL (not Base64)
            // Safe to update from Firebase
            if (avatarURL !== undefined && avatarURL !== null) {
                user.avatarURL = avatarURL;
            }
        }
        // If user.avatarURL starts with 'data:' (Base64), DON'T overwrite it

        // ONLY update phoneNumber if Firebase provides a non-null value
        // Don't overwrite existing phoneNumber with null from Firebase
        if (phoneNumber !== undefined && phoneNumber !== null) {
            user.phoneNumber = phoneNumber;
        }
    }

    await user.save();
    return user;
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
        console.log('[updateProfile] ===== START =====');
        console.log('[updateProfile] userId:', userId);
        console.log('[updateProfile] Raw updates received:', JSON.stringify(updates, null, 2));

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
        if (updates.fullName !== undefined) allowedUpdates.fullName = updates.fullName;
        if (updates.phoneNumber !== undefined) {
            // Handle empty string as null
            allowedUpdates.phoneNumber = updates.phoneNumber === '' ? null : updates.phoneNumber;
        }
        if (updates.avatarURL !== undefined) {
            console.log('[updateProfile] avatarURL received, length:', updates.avatarURL?.length);
            console.log('[updateProfile] avatarURL preview:', updates.avatarURL?.substring(0, 50));
            allowedUpdates.avatarURL = updates.avatarURL;
        }

        console.log('[updateProfile] Current user in DB:', {
            _id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            avatarURL: user.avatarURL
        });
        console.log('[updateProfile] Allowed updates to apply:', JSON.stringify(allowedUpdates, null, 2));

        // Nếu có cố gắng thay đổi email, throw error
        if (updates.email !== undefined && updates.email !== user.email) {
            throw new Error('Email cannot be changed');
        }

        // Update user in MongoDB
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        );

        console.log('[updateProfile] Updated user from DB:', {
            _id: updatedUser._id,
            name: updatedUser.name,
            phoneNumber: updatedUser.phoneNumber,
            avatarURL: updatedUser.avatarURL
        });
        console.log('[updateProfile] ===== END =====');

        return updatedUser;
    } catch (error) {
        console.error('[updateProfile] ERROR:', error);
        throw error;
    }
};

export default {
    registerUser,
    findByEmail,
    syncProfile,
    updateProfile
};

