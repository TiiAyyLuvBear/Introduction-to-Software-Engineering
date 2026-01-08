import React from 'react'
import { getCurrentUser, getServerBaseUrl } from '../../services/userService.js'
import walletService from '../../services/walletService.js'
import transactionService from '../../services/transactionService.js'
import { useToast } from '../../components/Toast.jsx'
import { formatMoney } from '../../lib/format.js'
import EditProfile from './components/EditProfile.jsx'

export default function Accounts() {
  const toast = useToast()
  const [user, setUser] = React.useState(null)
  const [stats, setStats] = React.useState({
    walletCount: 0,
    transactionCount: 0,
    totalBalance: 0
  })
  const [showEditModal, setShowEditModal] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      const res = await getCurrentUser()
      const u = res?.user || res?.data?.user || res?.data || res
      setUser(u)
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error(error?.message || 'Failed to load profile')
    }
  }, [toast])

  // Fetch statistics
  const loadStats = React.useCallback(async () => {
    try {
      const [walletsRes, transactionsRes] = await Promise.all([
        walletService.listWallets({ status: 'active' }),
        transactionService.getTransactions({})
      ])

      const wallets = Array.isArray(walletsRes) ? walletsRes : []
      const transactions = Array.isArray(transactionsRes) ? transactionsRes : []

      const totalBalance = wallets.reduce((sum, w) => sum + (w.currentBalance || 0), 0)

      setStats({
        walletCount: wallets.length,
        transactionCount: transactions.length,
        totalBalance
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }, [])

  React.useEffect(() => {
    load()
    loadStats()
  }, [load, loadStats])

  const handleEditSuccess = (updatedUser) => {
    setUser(updatedUser)
    setShowEditModal(false)
  }

  const avatarSrc = user?.avatarURL
    ? (user.avatarURL.startsWith('data:') ? user.avatarURL : `${getServerBaseUrl()}${user.avatarURL}`)
    : ''

  if (!user) {
    return (
      <div className="px-4 py-6 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-text-secondary">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="p-6 md:p-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">My Account</h1>
            <p className="mt-1 text-text-secondary">Manage your personal information</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border-dark bg-card-dark p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Wallets</div>
                <div className="text-2xl font-bold text-white">{stats.walletCount}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border-dark bg-card-dark p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Transactions</div>
                <div className="text-2xl font-bold text-white">{stats.transactionCount}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border-dark bg-card-dark p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Total Balance</div>
                <div className="text-2xl font-bold text-white">{formatMoney(stats.totalBalance)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="mt-6 rounded-2xl border border-border-dark bg-card-dark p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border-dark">
            <h3 className="text-lg font-bold text-white">Personal Information</h3>
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background-dark text-sm font-bold hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </button>
          </div>

          <div className="mt-6 flex items-center gap-6">
            <div className="size-20 overflow-hidden rounded-full border-2 border-border-dark bg-surface-dark">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-text-secondary mt-1">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1">
                <span className="size-2 rounded-full bg-primary"></span>
                <span className="text-xs font-medium text-primary">Active</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
              <div className="text-white font-medium">{user.name || 'Not set'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
              <div className="text-white font-medium">{user.email || 'Not set'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Phone Number</label>
              <div className="text-white font-medium">{user.phoneNumber || 'Not set'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">User ID</label>
              <div className="text-white font-medium font-mono text-sm">{user?.id || user?._id || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl">
            <EditProfile
              user={user}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </main>
  )
}
