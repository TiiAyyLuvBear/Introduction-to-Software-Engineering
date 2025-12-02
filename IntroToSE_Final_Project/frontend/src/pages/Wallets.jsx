import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Wallet, Plus, CreditCard, Briefcase, PiggyBank } from 'lucide-react'
import { walletAPI } from '../api.js'
import WalletDetailView from '../components/wallet/WalletDetailView.jsx'

/**
 * Wallets Component - Implement Use Case U010: Create Wallet
 * 
 * Features theo use case:
 * 1. Hiển thị danh sách ví hiện có
 * 2. Form tạo ví mới với validation
 * 3. Chọn loại ví (Cash/Bank/Savings)  
 * 4. Nhập số dư ban đầu (tùy chọn)
 * 5. Validation tên ví không trùng lặp
 * 6. Performance: tạo ví trong 1 giây
 * 7. Usability: tối đa 5 thao tác để tạo ví
 */

export default function Wallets() {
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showWalletDetail, setShowWalletDetail] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [currentUserId] = useState('user123') // TODO: Get from auth context
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  const { register, handleSubmit: handleFormSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      type: 'Cash',
      initialBalance: '',
      currency: 'USD',
      description: '',
      isShared: false
    }
  })

  // Load wallets when component mounts
  useEffect(() => {
    loadWallets()
  }, [])

  // Load user's wallets from API
  const loadWallets = async () => {
    try {
      setLoading(true)
      const response = await walletAPI.getUserWallets()
      if (response.success) {
        setWallets(response.data.wallets || [])
      }
    } catch (error) {
      console.error('Failed to load wallets:', error)
      // Use mock data as fallback with shared wallet example
      setWallets([
        { id: 1, name: 'Main Cash', type: 'Cash', balance: 500, currency: 'USD', status: 'active', isShared: false, createdAt: new Date() },
        { id: 2, name: 'Family Budget', type: 'Bank', balance: 12500, currency: 'USD', status: 'active', isShared: true, ownerId: 'user123', memberCount: 3, pendingInvitations: 1, createdAt: new Date() },
        { id: 3, name: 'Emergency Fund', type: 'Savings', balance: 25000, currency: 'USD', status: 'active', isShared: false, createdAt: new Date() },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Wallet type options với icons
  const walletTypes = [
    { value: 'Cash', label: 'Cash', icon: 'CreditCard', description: 'Physical money and coins' },
    { value: 'Bank', label: 'Bank Account', icon: 'Briefcase', description: 'Bank savings or checking account' },
    { value: 'Savings', label: 'Savings', icon: 'PiggyBank', description: 'Long-term savings account' }
  ]

  // Currency options
  const currencies = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'VND', label: 'VND (₫)', symbol: '₫' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'JPY', label: 'JPY (¥)', symbol: '¥' }
  ]

  // Handle form submission (main scenario steps 6-9)
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Step 8: System saves wallet to database
      const startTime = Date.now()
      
      const walletData = {
        name: data.name.trim(),
        type: data.type,
        initialBalance: parseFloat(data.initialBalance || 0),
        currency: data.currency,
        description: data.description.trim(),
        isShared: data.isShared || false
      }

      const response = await walletAPI.createWallet(walletData)
      
      if (response.success) {
        // Step 9: Wallet appears in user's wallet list
        setWallets(prev => [response.data, ...prev])
        
        // Reset form and close modal
        reset()
        setShowCreateModal(false)

        const endTime = Date.now()
        console.log(`Wallet created in ${endTime - startTime}ms`) // Performance tracking
      } else {
        setSubmitError(response.error || 'Failed to create wallet')
      }

    } catch (error) {
      console.error('Error creating wallet:', error)
      
      // Handle specific error cases (Alternative Scenarios)
      if (error.response?.data?.code === 'DUPLICATE_WALLET_NAME') {
        setSubmitError('Wallet name already in use')
      } else if (error.response?.data?.error) {
        setSubmitError(error.response.data.error)
      } else {
        setSubmitError('Failed to create wallet. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle wallet selection (both personal and shared)
  const handleWalletClick = (wallet) => {
    setSelectedWallet(wallet)
    setShowWalletDetail(true)
  }

  // Close wallet detail view
  const handleCloseWalletDetail = () => {
    setShowWalletDetail(false)
    setSelectedWallet(null)
    loadWallets() // Refresh wallets after any changes
  }

  // Calculate total balance across all wallets
  const totalBalance = wallets.reduce((sum, wallet) => {
    // Simple currency conversion (in real app, use exchange rates)
    const balance = wallet.currency === 'USD' ? (wallet.balance || wallet.currentBalance) : (wallet.balance || wallet.currentBalance) * 0.00004 // VND to USD approximation
    return sum + balance
  }, 0)

  // Get wallet icon by type
  const getWalletIcon = (type) => {
    const iconMap = {
      'Cash': CreditCard,
      'Bank': Briefcase,
      'Savings': PiggyBank
    }
    const IconComponent = iconMap[type] || Wallet
    return <IconComponent className="w-full h-full" />
  }

  // Format currency display
  const formatCurrency = (amount, currency) => {
    const currencyInfo = currencies.find(c => c.value === currency)
    const symbol = currencyInfo ? currencyInfo.symbol : '$'
    return `${symbol}${amount.toLocaleString()}`
  }

  // Show loading spinner
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Wallets</h2>
        <p className="text-gray-600">Manage your personal and shared wallets</p>
      </div>

      {/* Total Balance Summary */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-2xl p-6 mb-8 max-w-md transform hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-white">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-semibold text-lg">Total Balance</span>
          <Wallet className="w-10 h-10 text-white animate-bounce" />
        </div>
        <div className="text-4xl font-bold text-white mb-2">${totalBalance.toFixed(2)}</div>
        <div className="text-blue-100 text-sm font-medium">Across {wallets.length} wallets</div>
      </div>

      {/* Add Wallet Button (step 1: User selects "Add Wallet") */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Your Wallets</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <span>+</span>
          Add Wallet
        </button>
      </div>

      {/* Wallets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {wallets.map(wallet => (
          <div 
            key={wallet.id} 
            onClick={() => handleWalletClick(wallet)}
            className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md hover:shadow-2xl p-6 border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:rotate-12">
                  {getWalletIcon(wallet.type)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{wallet.name}</h4>
                  <p className="text-sm text-gray-600 font-medium">{wallet.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                wallet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {wallet.status}
              </span>
            </div>
            
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {formatCurrency(wallet.balance || wallet.currentBalance, wallet.currency)}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Created {new Date(wallet.createdAt).toLocaleDateString()}</span>
              {wallet.isShared && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  Shared
                </span>
              )}
            </div>
            
            {/* Action Indicator */}
            <div className="pt-3 border-t border-gray-200 mt-3">
              {wallet.isShared ? (
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{wallet.memberCount || 0} members</span>
                    {wallet.pendingInvitations > 0 && (
                      <span className="text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded">
                        {wallet.pendingInvitations} pending
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    → Click to manage shared wallet
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  → Click to view details & transactions
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Wallet Modal (step 2: system displays Wallet Creation form) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Create New Wallet</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setErrors({})
                    setFormData({
                      name: '',
                      type: 'Cash',
                      initialBalance: '',
                      currency: 'USD',
                      description: '',
                      isShared: false
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
                {/* Step 3: User enters Wallet Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { 
                      required: 'Wallet name is required',
                      maxLength: { value: 50, message: 'Wallet name cannot exceed 50 characters' },
                      validate: (value) => {
                        const existingWallet = wallets.find(w => 
                          w.name.toLowerCase() === value.toLowerCase().trim()
                        )
                        return !existingWallet || 'Wallet name already in use'
                      }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter wallet name"
                    maxLength={50}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                {/* Step 4: User selects Wallet Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Type *
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {walletTypes.map(type => (
                      <label key={type.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          {...register('type')}
                          value={type.value}
                          className="mr-3"
                        />
                        <span className="text-xl mr-3">{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Shared Wallet Option */}
                <div>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      {...register('isShared')}
                      className="mr-3"
                    />
                    <span className="text-xl mr-3">👥</span>
                    <div>
                      <div className="font-medium">Create as Shared Wallet</div>
                      <div className="text-sm text-gray-500">Allow multiple people to manage this wallet together</div>
                    </div>
                  </label>
                </div>

                {/* Currency Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    {...register('currency')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 5: User optionally enters Initial Balance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Balance (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('initialBalance', {
                      min: { value: 0, message: 'Initial balance must be a positive number' }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.initialBalance ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.initialBalance && <p className="mt-1 text-sm text-red-500">{errors.initialBalance.message}</p>}
                </div>

                {/* Description (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    {...register('description', {
                      maxLength: { value: 200, message: 'Description cannot exceed 200 characters' }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Add a description for this wallet"
                    rows={3}
                    maxLength={200}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                  <p className="mt-1 text-sm text-gray-500">{watch('description')?.length || 0}/200 characters</p>
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                {/* Step 6: User taps "Save" */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setSubmitError('')
                      reset()
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    {isSubmitting ? 'Creating...' : 'Save Wallet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {wallets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No wallets yet</h3>
          <p className="text-gray-600 mb-6">Create your first wallet to start managing your finances</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Create Your First Wallet
          </button>
        </div>
      )}

      {/* Wallet Detail View */}
      {showWalletDetail && selectedWallet && (
        <WalletDetailView
          wallet={selectedWallet}
          currentUserId={currentUserId}
          onClose={handleCloseWalletDetail}
          onWalletUpdate={loadWallets}
        />
      )}
    </div>
  )
}