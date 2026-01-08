import api from './api.js'

const transactionService = {
    getTransactions: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/transactions?${queryString}` : '/transactions';
        return await api.get(url);
    },

    getTransactionById: async (id) => {
        return await api.get(`/transactions/${id}`);
    },

    createTransaction: async (transaction) => {
        return await api.post('/transactions', transaction);
    },

    transferMoney: async (transferData) => {
        return await api.post('/transactions/transfer', transferData);
    },

    updateTransaction: async (id, transaction) => {
        return await api.put(`/transactions/${id}`, transaction);
    },

    deleteTransaction: async (id) => {
        return await api.delete(`/transactions/${id}`);
    }
}




export default transactionService;
