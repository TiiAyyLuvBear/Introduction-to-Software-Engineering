import User from '../models/User.js'
import mongoose from 'mongoose'

export async function getUsers(req, res){
  try{
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      User.find().sort({createdAt:-1}).skip(skip).limit(limit).select('-password'),
      User.countDocuments()
    ])
    res.json({ items, total, page, limit })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function getUser(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const u = await User.findById(id).select('-password')
    if(!u) return res.status(404).json({ error: 'Not found' })
    res.json(u)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function createUser(req, res){
  try{
    const { name, email, password } = req.body
    if(!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })
    // NOTE: password should be hashed when adding auth; storing plain text only for scaffold/demo
    const existing = await User.findOne({ email })
    if(existing) return res.status(409).json({ error: 'Email already in use' })
    const u = new User({ name, email, password })
    await u.save()
    const safe = u.toObject()
    delete safe.password
    res.status(201).json(safe)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function updateUser(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const updates = { ...req.body }
    // Prevent changing email to an existing one
    if(updates.email){
      const exists = await User.findOne({ email: updates.email, _id: { $ne: id } })
      if(exists) return res.status(409).json({ error: 'Email already in use' })
    }
    const u = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password')
    if(!u) return res.status(404).json({ error: 'Not found' })
    res.json(u)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function deleteUser(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const u = await User.findByIdAndDelete(id)
    if(!u) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
