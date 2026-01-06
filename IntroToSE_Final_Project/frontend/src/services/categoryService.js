// /**
//  * Category Service
//  *
//  * Handles all category-related API calls
//  */

// import { get, post, put, del } from './api.js'

// /**
//  * List all categories
//  *
//  * @param {Object} params - Query parameters
//  * @param {number} params.page - Page number
//  * @param {number} params.limit - Items per page
//  * @returns {Promise<Object>} List of categories
//  */
// export async function listCategories({ page = 1, limit = 100 } = {}) {
//     return get(`/categories?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`)
// }

// /**
//  * Create a new category
//  *
//  * @param {Object} data - Category data
//  * @param {string} data.name - Category name
//  * @param {string} data.type - Category type (income, expense)
//  * @param {string} data.color - Category color (hex code)
//  * @param {string} data.icon - Category icon name
//  * @returns {Promise<Object>} Created category
//  */
// export async function createCategory({ name, type, color, icon } = {}) {
//     return post('/categories', { name, type, color, icon })
// }

// /**
//  * Update a category
//  *
//  * @param {string} id - Category ID
//  * @param {Object} data - Update data
//  * @returns {Promise<Object>} Updated category
//  */
// export async function updateCategory(id, { name, type, color, icon } = {}) {
//     return put(`/categories/${encodeURIComponent(id)}`, { name, type, color, icon })
// }

// /**
//  * Delete a category
//  *
//  * @param {string} id - Category ID
//  * @returns {Promise<Object>} Response
//  */
// export async function deleteCategory(id) {
//     return del(`/categories/${encodeURIComponent(id)}`)
// }

// export default {
//     listCategories,
//     createCategory,
//     updateCategory,
//     deleteCategory,
// }
