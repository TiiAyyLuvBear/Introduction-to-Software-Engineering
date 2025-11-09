import Account from '../models/Account.js'
import mongoose from 'mongoose'

export async function getAccounts(req, res){
  try{
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      Account.find().sort({name:1}).skip(skip).limit(limit),
      Account.countDocuments()
    ])
    res.json({ items, total, page, limit })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function getAccount(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const a = await Account.findById(id)
    if(!a) return res.status(404).json({ error: 'Not found' })
    res.json(a)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function createAccount(req, res){
  try{
    const { name, balance, currency, userId } = req.body
    if(!name) return res.status(400).json({ error: 'Missing name' })
    const acct = new Account({ name, balance: balance || 0, currency: currency || 'USD', userId })
    await acct.save()
    res.status(201).json(acct)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function updateAccount(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const updates = req.body
    const a = await Account.findByIdAndUpdate(id, updates, { new: true })
    if(!a) return res.status(404).json({ error: 'Not found' })
    res.json(a)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function deleteAccount(req, res){
  try{
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })
    const a = await Account.findByIdAndDelete(id)
    if(!a) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
