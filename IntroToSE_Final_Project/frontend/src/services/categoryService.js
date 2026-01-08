/**
 * Category Service
 *
 * Handles all category-related API calls
 */

import api from './api.js'

/**
 * List all categories
 *
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} List of categories
 */
export async function listCategories({ page = 1, limit = 200 } = {}) {
    const res = await api.get(`/categories?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`)
    return res?.data?.items || res?.items || []
}

/**
 * Create a new category
 *
 * @param {Object} data - Category data
 * @param {string} data.name - Category name
 * @param {string} data.type - Category type (income, expense)
 * @param {string} data.color - Category color (hex code)
 * @param {string} data.icon - Category icon name
 * @returns {Promise<Object>} Created category
 */
export async function createCategory({ name, type, color, icon } = {}) {
    const res = await api.post('/categories', { name, type, color, icon })
    return res?.data?.data || res?.data
}

/**
 * Update a category
 *
 * @param {string} id - Category ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated category
 */
export async function updateCategory(id, { name, type, color, icon } = {}) {
    const res = await api.put(`/categories/${encodeURIComponent(id)}`, { name, type, color, icon })
    return res?.data?.data || res?.data
}

/**
 * Delete a category
 *
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Response
 */
export async function deleteCategory(id) {
    const res = await api.delete(`/categories/${encodeURIComponent(id)}`)
    return res?.data
}

export default {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
}
