/**
 * Category Service
 * Handles all category-related API calls
 */

import { get, post, put, del } from './api.js'

export async function listCategories(params) {
    return get('/categories', params)
}

export async function createCategory(data) {
    return post('/categories', data)
}

export async function updateCategory(id, data) {
    return put(`/categories/${id}`, data)
}

export async function deleteCategory(id) {
    return del(`/categories/${id}`)
}

export default {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory
}
