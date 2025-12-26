/**
 * Wallet Service - Helper functions cho Wallet operations
 * 
 * Bao gồm:
 * - Tạo default "Uncategorized" wallet
 * - Lấy hoặc tạo default wallet
 */

import Wallet from '../models/Wallet.js'

/**
 * Service: Lấy hoặc tạo default "Uncategorized" wallet cho user
 * 
 * Default wallet được dùng khi:
 * - User không chọn wallet cụ thể
 * - User muốn transaction "chưa phân loại"
 * 
 * @param {String} userId - User ID
 * @param {Object} session - MongoDB session (optional)
 * @returns {Object} Default wallet
 */
export const getOrCreateDefaultWallet = async (userId, session = null) => {
    // Tìm default wallet
    let defaultWallet = await Wallet.findOne({
        userId,
        name: 'Uncategorized',
        isDefault: true
    }).session(session)

    // Nếu chưa có, tạo mới
    if (!defaultWallet) {
        const walletData = {
            userId,
            name: 'Uncategorized',
            type: 'Uncategorized',
            description: 'Default wallet for uncategorized transactions',
            currency: 'VND',
            currentBalance: 0,
            isDefault: true,
            icon: '📦',
            color: '#9CA3AF' // Gray color
        }

        if (session) {
            const created = await Wallet.create([walletData], { session })
            defaultWallet = created[0]
        } else {
            defaultWallet = await Wallet.create(walletData)
        }

        console.log(`Created default wallet for user ${userId}`)
    }

    return defaultWallet
}

/**
 * Service: Tạo default wallet khi user đăng ký
 * 
 * @param {String} userId - User ID
 * @returns {Object} Default wallet
 */
export const createDefaultWalletForNewUser = async (userId) => {
    return getOrCreateDefaultWallet(userId)
}

/**
 * Service: Lấy tất cả wallets của user (bao gồm default)
 * 
 * @param {String} userId - User ID
 * @returns {Array} List of wallets
 */
export const getUserWallets = async (userId) => {
    const wallets = await Wallet.find({
        $or: [
            { userId },
            { ownerId: userId },
            { 'members.userId': userId }
        ]
    }).sort({ isDefault: -1, createdAt: -1 }) // Default wallet lên đầu

    return wallets
}

export default {
    getOrCreateDefaultWallet,
    createDefaultWalletForNewUser,
    getUserWallets
}
