import Transaction from '../models/Transaction.js'

export async function getTransactions(req, res){
  try{
    const list = await Transaction.find().sort({date:-1}).limit(200)
    res.json(list)
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
}

export async function createTransaction(req, res){
  try{
    const { amount, type, category, account, date, note } = req.body
    if(typeof amount !== 'number' || !['income','expense'].includes(type)){
      return res.status(400).json({error: 'Invalid payload'})
    }
    const tx = new Transaction({ amount, type, category, account, date, note })
    await tx.save()
    res.status(201).json(tx)
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
}

export async function deleteTransaction(req, res){
  try{
    const { id } = req.params
    const t = await Transaction.findByIdAndDelete(id)
    if(!t) return res.status(404).json({error: 'Not found'})
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
}
