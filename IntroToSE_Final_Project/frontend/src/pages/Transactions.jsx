import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { FaMoneyBillWave, FaRegTrashAlt, FaPlus, FaExchangeAlt } from 'react-icons/fa'
import Chatbot from '../components/chatbot/Chatbot.jsx'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)

  // ---------------------
  // Load Transactions
  // ---------------------
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/transactions')
      if (res.data.success) {
        setTransactions(res.data.data.transactions || [])
      } else {
        setTransactions(res.data || [])
      }
    } catch (err) {
      console.error('Failed to load transactions:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load transactions')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  // ---------------------
  // Search
  // ---------------------
  useEffect(() => {
    if (!searchTerm.trim()) {
      loadTransactions()
      return
    }

    let mounted = true
    const timeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await api.get('/transactions', { params: { q: searchTerm } })
        if (mounted) {
          if (res.data.success) {
            setTransactions(res.data.data.transactions || [])
          } else {
            setTransactions(res.data || [])
          }
        }
      } catch (err) {
        if (mounted) setError(err.response?.data?.error || err.message || 'Search failed')
      } finally {
        if (mounted) setIsSearching(false)
      }
    }, 300)
    return () => { mounted = false; clearTimeout(timeout) }
  }, [searchTerm])

  // ---------------------
  // React Hook Form
  // ---------------------
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      account: 'Cash'
    }
  })

  const { register: registerTransfer, handleSubmit: handleSubmitTransfer, reset: resetTransfer } = useForm({
    defaultValues: {
      from: 'Bank Account',
      to: 'Cash',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    }
  })

  // ---------------------
  // Submit Transaction
  // ---------------------
  const onSubmit = async (data) => {
    setError(null)
    const payload = { ...data, amount: parseFloat(data.amount) }

    try {
      const res = await api.post('/transactions', payload)
      if (res.data.success) {
        setTransactions(prev => [res.data.data.transaction, ...prev])
      } else {
        setTransactions(prev => [res.data, ...prev])
      }
      setShowModal(false)
      reset()
      // Reload để lấy data mới nhất
      loadTransactions()
    } catch (err) {
      console.error('Failed to save transaction:', err)
      setError(err.response?.data?.error || err.message || 'Failed to save transaction')
    }
  }

  // ---------------------
  // Submit Transfer
  // ---------------------
  const onSubmitTransfer = async (data) => {
    setError(null)
    const amt = parseFloat(data.amount)
    if (!amt || amt <= 0) return setError('Enter a valid amount for transfer')
    if (data.from === data.to) return setError('Source and destination must differ')

    try {
      const payload = {
        fromWalletId: data.from,
        toWalletId: data.to,
        amount: amt,
        date: data.date,
        note: data.note || `Transfer from ${data.from} to ${data.to}`
      }

      const res = await api.post('/transactions/transfer', payload)
      
      setShowTransfer(false)
      resetTransfer()
      
      // Reload transactions
      loadTransactions()
    } catch (err) {
      console.error('Failed to transfer:', err)
      setError(err.response?.data?.error || err.message || 'Failed to transfer')
    }
  }

  // ---------------------
  // Delete Transaction
  // ---------------------
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      await api.delete(`/transactions/${id}`)
      setTransactions(transactions.filter(t => t._id !== id))
    } catch (err) {
      console.error('Failed to delete transaction:', err)
      setError(err.response?.data?.error || err.message || 'Failed to delete transaction')
    }
  }

  // ---------------------
  // Render
  // ---------------------
  if (loading && !isSearching) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Outer rotating circle */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin"></div>
            
            {/* Inner pulsing money icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <FaMoneyBillWave className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Transactions</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-1">Transactions</h2>
        <p className="text-gray-600">Manage your income and expenses</p>
      </div>

      {/* Buttons & Search */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Add Transaction
        </button>
        <button
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
          onClick={() => setShowTransfer(true)}
        >
          <FaExchangeAlt /> Transfer
        </button>
        <input
          type="search"
          className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {loading || isSearching ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500">
            <FaMoneyBillWave className="text-5xl mb-4" />
            <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
            <p>Add your first transaction!</p>
          </div>
        ) : (
          transactions
            .filter(tx => {
              const term = searchTerm.trim().toLowerCase()
              if (!term) return true
              return [tx.category, tx.note, tx.account, tx.type, String(tx.amount)].join(' ').toLowerCase().includes(term)
            })
            .map(tx => (
              <motion.div
                key={tx._id}
                layout
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex justify-between items-center p-5 border-2 border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center gap-4" onClick={() => setSelectedTransaction(tx)}>
                  <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:rotate-6 ${tx.type==='income'?'bg-gradient-to-br from-green-400 to-green-600 text-white':'bg-gradient-to-br from-red-400 to-red-600 text-white'}`}>
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">{tx.category}</div>
                    <div className="text-gray-600 text-sm font-medium">{tx.note} • {tx.account}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`${tx.type==='income'?'text-green-600':'text-red-600'} font-bold text-xl`}>
                    {tx.type==='expense'?'-':'+'}${tx.amount.toFixed(2)}
                  </div>
                  <button onClick={() => handleDelete(tx._id)} className="p-2 rounded-xl hover:bg-red-100 text-red-600 hover:scale-110 transition-all duration-200">
                    <FaRegTrashAlt />
                  </button>
                </div>
              </motion.div>
            ))
        )}
      </div>

      {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

      {/* === Add Transaction Modal === */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Add Transaction</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Type Card */}
                <div className="grid grid-cols-2 gap-2">
                  {['income','expense'].map(type => (
                    <div
                      key={type}
                      onClick={()=>setValue('type', type)}
                      className={`flex items-center justify-center py-3 rounded-xl cursor-pointer font-semibold text-white transition-all duration-200 ${
                        watch('type')===type
                          ? type==='income' ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg scale-105' : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase()+type.slice(1)}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input {...register('category',{ required:true })} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  {errors.category && <span className="text-red-500 text-sm">Category required</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input type="number" {...register('amount',{ required:true, min:0.01 })} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  {errors.amount && <span className="text-red-500 text-sm">Valid amount required</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" {...register('date',{ required:true })} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Account</label>
                  <select {...register('account')} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Cash</option>
                    <option>Bank Account</option>
                    <option>Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Note</label>
                  <textarea {...register('note')} rows={3} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold">Save</button>
                  <button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Transfer Modal === */}
      <AnimatePresence>
        {showTransfer && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTransfer(false)}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FaExchangeAlt /> Transfer Funds</h3>

              <form onSubmit={handleSubmitTransfer(onSubmitTransfer)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">From</label>
                  <select {...registerTransfer('from')} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Cash</option>
                    <option>Bank Account</option>
                    <option>Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <select {...registerTransfer('to')} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Cash</option>
                    <option>Bank Account</option>
                    <option>Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input type="number" {...registerTransfer('amount',{ required:true, min:0.01 })} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" {...registerTransfer('date',{ required:true })} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Note</label>
                  <input type="text" {...registerTransfer('note')} className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all font-semibold">Confirm</button>
                  <button type="button" onClick={()=>setShowTransfer(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
