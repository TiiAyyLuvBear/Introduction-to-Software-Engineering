import Category from '../models/Category.js'
import mongoose from 'mongoose'

export async function getCategories(req, res){
  try{
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      Category.find().sort({name:1}).skip(skip).limit(limit),
      Category.countDocuments()
    ])
    res.json({ items, total, page, limit })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function getCategory(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const c = await Category.findById(id)
    if(!c) return res.status(404).json({ error: 'Not found' })
    res.json(c)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function createCategory(req, res){
  try{
    const { name, type, color, userId } = req.body
    if(!name || !type) return res.status(400).json({ error: 'Missing fields' })
    if(!['income','expense'].includes(type)) return res.status(400).json({ error: 'Invalid type' })
    const cat = new Category({ name, type, color, userId })
    await cat.save()
    res.status(201).json(cat)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function updateCategory(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const updates = req.body
    const c = await Category.findByIdAndUpdate(id, updates, { new: true })
    if(!c) return res.status(404).json({ error: 'Not found' })
    res.json(c)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function deleteCategory(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const c = await Category.findByIdAndDelete(id)
    if(!c) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
