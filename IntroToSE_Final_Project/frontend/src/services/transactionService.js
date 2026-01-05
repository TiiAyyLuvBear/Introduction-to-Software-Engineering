/**
 * Transaction Service
 * Handles all transaction-related API calls
 */

import { get, post, put, del } from './api.js'

export async function listTransactions(params) {
    return get('/transactions', params)
}

export async function createTransaction(data) {
    return post('/transactions', data)
}

export async function updateTransaction(id, data) {
    return put(`/transactions/${id}`, data)
}

export async function deleteTransaction(id) {
    return del(`/transactions/${id}`)
}

export async function getTransaction(id) {
    return get(`/transactions/${id}`)
}

export default {
    listTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction
}
