/**
 * Wallet Service
 * Handles wallet-related API calls
 */

import { get, post, put, del } from './api.js'

export async function listWallets(params) {
    return get('/wallets', params)
}

export async function createWallet(data) {
    return post('/wallets', data)
}

export async function updateWallet(id, data) {
    return put(`/wallets/${id}`, data)
}

export async function deleteWallet(id) {
    return del(`/wallets/${id}`)
}

export async function getWallet(id) {
    return get(`/wallets/${id}`)
}

export default {
    listWallets,
    createWallet,
    updateWallet,
    deleteWallet,
    getWallet
}
