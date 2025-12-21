import express from 'express'
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoriesController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, getCategories)
router.get('/:id', authenticate, getCategory)
router.post('/', authenticate, createCategory)
router.put('/:id', authenticate, updateCategory)
router.delete('/:id', authenticate, deleteCategory)

export default router
