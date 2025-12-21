import mongoose from 'mongoose'
import Transaction from '../models/Transaction.js'
import Wallet from '../models/Wallet.js'
import { buildTransactionQuery } from '../utils/transactionFilter.js'
import { withMongoSession } from '../utils/mongoSession.js'

function signedAmount(type, amount){
  return type === 'income' ? amount : -amount
}

function canAccessWallet(wallet, userId){
  if(!wallet || !userId) return false
  if(wallet.userId?.toString() === userId.toString()) return true
  if(wallet.ownerId?.toString() === userId.toString()) return true
  if(Array.isArray(wallet.members) && wallet.members.some(m => m.userId?.toString() === userId.toString())) return true
  return false
}

/**
 * Controller: Lấy danh sách transactions
 * 
 * Endpoint: GET /api/transactions
 * 
 * Sort: Theo ngày mới nhất (date descending)
 * Limit: 200 transactions gần nhất
 * 
 * TODO: Thêm pagination, filter theo:
 * - userId (chỉ lấy transactions của user hiện tại)
 * - type (income/expense)
 * - category
 * - account
 * - date range (từ ngày X đến ngày Y)
 * 
 * Use case:
 * - Dashboard: Hiển thị 5-10 transactions gần nhất
 * - Transactions page: Hiển thị tất cả với filter
 * - Reports: Tính tổng thu/chi theo tháng/năm
 */
export async function getTransactions(req, res){
  try{
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { filter, sort, limit, skip } = buildTransactionQuery({ userId, query: req.query })
    const list = await Transaction.find(filter).sort(sort).skip(skip).limit(limit)
    res.json(list)
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
}

/**
 * Controller: Tạo transaction mới
 * 
 * Endpoint: POST /api/transactions
 * 
 * Body: { amount, type, category?, account?, date?, note? }
 * 
 * Validation:
 * - amount phải là số (number)
 * - type chỉ nhận 'income' hoặc 'expense'
 * 
 * Flow:
 * 1. Validate input
 * 2. Tạo transaction mới
 * 3. Lưu vào database
 * 4. TODO: Cập nhật balance của account tương ứng
 *    - Nếu income: account.balance += amount
 *    - Nếu expense: account.balance -= amount
 * 
 * Use case:
 * - Ghi nhận khoản thu (lương, thưởng, bán hàng)
 * - Ghi nhận khoản chi (mua sắm, ăn uống, hóa đơn)
 */
export async function createTransaction(req, res){
  try{
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { amount, type, walletId, categoryId, category, account, date, note } = req.body

    // Validate amount/type/walletId
    if(typeof amount !== 'number' || amount <= 0 || !['income','expense'].includes(type)){
      return res.status(400).json({error: 'Invalid payload'})
    }
    if(!walletId || !mongoose.Types.ObjectId.isValid(walletId)){
      return res.status(400).json({error: 'Invalid walletId'})
    }
    if(categoryId && !mongoose.Types.ObjectId.isValid(categoryId)){
      return res.status(400).json({error: 'Invalid categoryId'})
    }

    const created = await withMongoSession(async (session) => {
      const wallet = await Wallet.findById(walletId).session(session)
      if(!wallet || !canAccessWallet(wallet, userId)){
        const err = new Error('Wallet not found')
        err.status = 404
        throw err
      }

      const tx = await Transaction.create([{
        userId,
        walletId,
        categoryId: categoryId || undefined,
        amount,
        type,
        category,
        account,
        date,
        note,
      }], { session })

      wallet.currentBalance += signedAmount(type, amount)
      await wallet.save({ session })

      return tx[0]
    })
    res.status(201).json(created)
  }catch(err){
    console.error(err)
    res.status(err.status || 500).json({error: err.status ? err.message : 'Server error'})
  }
}

/**
 * Controller: Chuyển tiền giữa 2 wallets
 *
 * Endpoint: POST /api/transactions/transfer
 *
 * Body: { fromWalletId, toWalletId, amount, date?, note? }
 */
export async function transferMoney(req, res){
  try{
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { fromWalletId, toWalletId, amount, date, note } = req.body

    if(!fromWalletId || !mongoose.Types.ObjectId.isValid(fromWalletId)){
      return res.status(400).json({ error: 'Invalid fromWalletId' })
    }
    if(!toWalletId || !mongoose.Types.ObjectId.isValid(toWalletId)){
      return res.status(400).json({ error: 'Invalid toWalletId' })
    }
    if(fromWalletId === toWalletId){
      return res.status(400).json({ error: 'Wallets must be different' })
    }
    if(typeof amount !== 'number' || amount <= 0){
      return res.status(400).json({ error: 'Invalid amount' })
    }

    const result = await withMongoSession(async (session) => {
      const [fromWallet, toWallet] = await Promise.all([
        Wallet.findById(fromWalletId).session(session),
        Wallet.findById(toWalletId).session(session),
      ])

      if(!fromWallet || !canAccessWallet(fromWallet, userId)){
        const err = new Error('From wallet not found')
        err.status = 404
        throw err
      }
      if(!toWallet || !canAccessWallet(toWallet, userId)){
        const err = new Error('To wallet not found')
        err.status = 404
        throw err
      }

      const when = date ? new Date(date) : new Date()

      const created = await Transaction.create([
        {
          userId,
          walletId: fromWallet._id,
          amount,
          type: 'expense',
          category: 'Transfer',
          date: when,
          note: note || `Transfer to ${toWallet.name}`,
        },
        {
          userId,
          walletId: toWallet._id,
          amount,
          type: 'income',
          category: 'Transfer',
          date: when,
          note: note || `Transfer from ${fromWallet.name}`,
        },
      ], { session })

      fromWallet.currentBalance += signedAmount('expense', amount)
      toWallet.currentBalance += signedAmount('income', amount)

      await Promise.all([
        fromWallet.save({ session }),
        toWallet.save({ session }),
      ])

      return { fromTransaction: created[0], toTransaction: created[1] }
    })

    res.status(201).json({ success: true, data: result })
  }catch(err){
    console.error(err)
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Server error' })
  }
}

/**
 * Controller: Xóa transaction
 * 
 * Endpoint: DELETE /api/transactions/:id
 * 
 * TODO: Khi xóa transaction, cần điều chỉnh lại balance của account:
 * - Nếu xóa income: account.balance -= amount
 * - Nếu xóa expense: account.balance += amount
 * 
 * Use case:
 * - Xóa transaction nhập nhầm
 * - Xóa transaction trùng
 * - Undo sau khi ghi sai
 */
export async function deleteTransaction(req, res){
  try{
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })

    await withMongoSession(async (session) => {
      const tx = await Transaction.findOne({ _id: id, userId }).session(session)
      if(!tx){
        const err = new Error('Not found')
        err.status = 404
        throw err
      }

      const wallet = await Wallet.findById(tx.walletId).session(session)
      if(!wallet || !canAccessWallet(wallet, userId)){
        const err = new Error('Wallet not found')
        err.status = 404
        throw err
      }

      wallet.currentBalance -= signedAmount(tx.type, tx.amount)
      await wallet.save({ session })

      await Transaction.deleteOne({ _id: tx._id }).session(session)
      return true
    })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(err.status || 500).json({error: err.status ? err.message : 'Server error'})
  }
}

export async function updateTransaction(req, res){
  try{
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })

    const { amount, type, walletId, categoryId, category, account, date, note } = req.body
    if(typeof amount !== 'number' || amount <= 0 || !['income','expense'].includes(type)){
      return res.status(400).json({error: 'Invalid payload'})
    }
    if(walletId && !mongoose.Types.ObjectId.isValid(walletId)){
      return res.status(400).json({error: 'Invalid walletId'})
    }
    if(categoryId && !mongoose.Types.ObjectId.isValid(categoryId)){
      return res.status(400).json({error: 'Invalid categoryId'})
    }

    const updated = await withMongoSession(async (session) => {
      const tx = await Transaction.findOne({ _id: id, userId }).session(session)
      if(!tx){
        const err = new Error('Not found')
        err.status = 404
        throw err
      }

      const oldWalletId = tx.walletId?.toString()
      const newWalletId = (walletId || tx.walletId)?.toString()

      const oldSigned = signedAmount(tx.type, tx.amount)
      const newSigned = signedAmount(type, amount)

      if(oldWalletId !== newWalletId){
        const oldWallet = await Wallet.findById(oldWalletId).session(session)
        const newWalletDoc = await Wallet.findById(newWalletId).session(session)

        if(!oldWallet || !canAccessWallet(oldWallet, userId)){
          const err = new Error('Wallet not found')
          err.status = 404
          throw err
        }
        if(!newWalletDoc || !canAccessWallet(newWalletDoc, userId)){
          const err = new Error('Wallet not found')
          err.status = 404
          throw err
        }

        oldWallet.currentBalance -= oldSigned
        newWalletDoc.currentBalance += newSigned

        await oldWallet.save({ session })
        await newWalletDoc.save({ session })
      }else{
        const wallet = await Wallet.findById(newWalletId).session(session)
        if(!wallet || !canAccessWallet(wallet, userId)){
          const err = new Error('Wallet not found')
          err.status = 404
          throw err
        }

        wallet.currentBalance += (newSigned - oldSigned)
        await wallet.save({ session })
      }

      tx.amount = amount
      tx.type = type
      tx.walletId = walletId || tx.walletId
      if(categoryId !== undefined){
        tx.categoryId = categoryId ? categoryId : undefined
      }
      tx.category = category
      tx.account = account
      tx.date = date
      tx.note = note

      await tx.save({ session })
      return tx
    })
    res.json(updated)
  }catch(err){
    console.error(err)
    res.status(err.status || 500).json({error: err.status ? err.message : 'Server error'})
  }
}
