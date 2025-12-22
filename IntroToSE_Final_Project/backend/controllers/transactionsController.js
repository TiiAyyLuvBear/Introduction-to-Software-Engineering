import Transaction from '../models/Transaction.js'
<<<<<<< Updated upstream
=======
import Wallet from '../models/Wallet.js'
import { buildTransactionQuery } from '../utils/transactionFilter.js'
import { withMongoSession } from '../utils/mongoSession.js'

function signedAmount(type, amount){
  return type === 'income' ? amount : -amount
}

function getWalletPermission(wallet, userId){
  if(!wallet || !userId) return null

  const uid = userId.toString()
  if(wallet.userId?.toString() === uid) return 'owner'
  if(wallet.ownerId?.toString() === uid) return 'owner'

  const member = Array.isArray(wallet.members)
    ? wallet.members.find(m => m.userId?.toString() === uid)
    : null

  return member?.permission || null
}

function canViewWallet(wallet, userId){
  return Boolean(getWalletPermission(wallet, userId))
}

function canEditWallet(wallet, userId){
  const p = getWalletPermission(wallet, userId)
  return p === 'owner' || p === 'edit'
}

async function getAccessibleWalletIds(userId){
  const wallets = await Wallet.find({
    status: 'active',
    $or: [{ userId }, { ownerId: userId }, { 'members.userId': userId }],
  }).select('_id')

  return wallets.map(w => w._id)
}
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
    // Sort theo date giảm dần (-1) để lấy mới nhất
    const list = await Transaction.find().sort({date:-1}).limit(200)
=======
    const userId = req.user?.id
    if(!userId) return res.status(401).json({ error: 'Unauthorized' })

    const walletIds = await getAccessibleWalletIds(userId)

    const requestedWalletId = String(req.query.walletId || '').trim()
    if(requestedWalletId && mongoose.Types.ObjectId.isValid(requestedWalletId)){
      const isAllowed = walletIds.some(id => id.toString() === requestedWalletId)
      if(!isAllowed) return res.status(404).json({ error: 'Wallet not found' })
    }

    const { filter, sort, limit, skip } = buildTransactionQuery({ userId, walletIds, query: req.query })
    const list = await Transaction.find(filter).sort(sort).skip(skip).limit(limit)
>>>>>>> Stashed changes
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
    const { amount, type, category, account, date, note } = req.body
    
    // Validate amount và type
    if(typeof amount !== 'number' || !['income','expense'].includes(type)){
      return res.status(400).json({error: 'Invalid payload'})
    }
<<<<<<< Updated upstream
    
    const tx = new Transaction({ amount, type, category, account, date, note })
    await tx.save()
    res.status(201).json(tx)
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
=======
    if(!walletId || !mongoose.Types.ObjectId.isValid(walletId)){
      return res.status(400).json({error: 'Invalid walletId'})
    }
    if(categoryId && !mongoose.Types.ObjectId.isValid(categoryId)){
      return res.status(400).json({error: 'Invalid categoryId'})
    }

    const created = await withMongoSession(async (session) => {
      const wallet = await Wallet.findById(walletId).session(session)
      if(!wallet || !canViewWallet(wallet, userId)){
        const err = new Error('Wallet not found')
        err.status = 404
        throw err
      }
      if(!canEditWallet(wallet, userId)){
        const err = new Error('Insufficient permission')
        err.status = 403
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

      if(!fromWallet || !canViewWallet(fromWallet, userId)){
        const err = new Error('From wallet not found')
        err.status = 404
        throw err
      }
      if(!toWallet || !canViewWallet(toWallet, userId)){
        const err = new Error('To wallet not found')
        err.status = 404
        throw err
      }

      if(!canEditWallet(fromWallet, userId) || !canEditWallet(toWallet, userId)){
        const err = new Error('Insufficient permission')
        err.status = 403
        throw err
      }

	  // Prevent transferring more than available balance
	  if (Number(fromWallet.currentBalance || 0) < Number(amount || 0)) {
		const err = new Error('Insufficient funds')
		err.status = 400
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
>>>>>>> Stashed changes
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
    const { id } = req.params
<<<<<<< Updated upstream
    const t = await Transaction.findByIdAndDelete(id)
    if(!t) return res.status(404).json({error: 'Not found'})
=======
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' })

    await withMongoSession(async (session) => {
      const tx = await Transaction.findById(id).session(session)
      if(!tx){
        const err = new Error('Not found')
        err.status = 404
        throw err
      }

      const wallet = await Wallet.findById(tx.walletId).session(session)
      if(!wallet || !canViewWallet(wallet, userId)){
        const err = new Error('Wallet not found')
        err.status = 404
        throw err
      }
      if(!canEditWallet(wallet, userId)){
        const err = new Error('Insufficient permission')
        err.status = 403
        throw err
      }

      wallet.currentBalance -= signedAmount(tx.type, tx.amount)
      await wallet.save({ session })

      await Transaction.deleteOne({ _id: tx._id }).session(session)
      return true
    })
>>>>>>> Stashed changes
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
}

export async function updateTransaction(req, res){
  try{
    const { id } = req.params
    const { amount, type, category, account, date, note } = req.body
    if(typeof amount !== 'number' || !['income','expense'].includes(type)){
      return res.status(400).json({error: 'Invalid payload'})
    }
<<<<<<< Updated upstream
    const updated = await Transaction.findByIdAndUpdate(
      id,
      { amount, type, category, account, date, note },
      { new: true }
    )
    if(!updated) return res.status(404).json({error: 'Not found'})
=======
    if(walletId && !mongoose.Types.ObjectId.isValid(walletId)){
      return res.status(400).json({error: 'Invalid walletId'})
    }
    if(categoryId && !mongoose.Types.ObjectId.isValid(categoryId)){
      return res.status(400).json({error: 'Invalid categoryId'})
    }

    const updated = await withMongoSession(async (session) => {
      const tx = await Transaction.findById(id).session(session)
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

        if(!oldWallet || !canViewWallet(oldWallet, userId)){
          const err = new Error('Wallet not found')
          err.status = 404
          throw err
        }
        if(!newWalletDoc || !canViewWallet(newWalletDoc, userId)){
          const err = new Error('Wallet not found')
          err.status = 404
          throw err
        }

        if(!canEditWallet(oldWallet, userId) || !canEditWallet(newWalletDoc, userId)){
          const err = new Error('Insufficient permission')
          err.status = 403
          throw err
        }

        oldWallet.currentBalance -= oldSigned
        newWalletDoc.currentBalance += newSigned

        await oldWallet.save({ session })
        await newWalletDoc.save({ session })
      }else{
        const wallet = await Wallet.findById(newWalletId).session(session)
        if(!wallet || !canViewWallet(wallet, userId)){
          const err = new Error('Wallet not found')
          err.status = 404
          throw err
        }

        if(!canEditWallet(wallet, userId)){
          const err = new Error('Insufficient permission')
          err.status = 403
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
>>>>>>> Stashed changes
    res.json(updated)
  }catch(err){
    console.error(err)
    res.status(500).json({error: 'Server error'})
  }
}
