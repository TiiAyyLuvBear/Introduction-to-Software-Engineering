import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit2, Save, X } from 'lucide-react'

export default function Accounts() {
<<<<<<< Updated upstream
  const [isEditing, setIsEditing] = useState(false)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile')
    return saved ? JSON.parse(saved) : {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+84 123 456 789',
      address: 'Ho Chi Minh City, Vietnam',
      birthday: '1995-05-15',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3B82F6&color=fff&size=200',
      bio: 'Personal finance enthusiast and software developer'
    }
  })
=======
  const navigate = useNavigate()
  const [total, setTotal] = React.useState(0)
  const [wallets, setWallets] = React.useState([])
  const [busyId, setBusyId] = React.useState(null)
  const [error, setError] = React.useState('')
  const [netWorthMoMPct, setNetWorthMoMPct] = React.useState(0)
>>>>>>> Stashed changes

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: userProfile
  })

  const handleEditToggle = () => {
    if (isEditing) {
      reset(userProfile) // Reset form to current profile data
    }
    setIsEditing(!isEditing)
  }

  const onSaveProfile = (data) => {
    const updatedProfile = { ...userProfile, ...data }
    setUserProfile(updatedProfile)
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
    setIsEditing(false)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const updatedProfile = { ...userProfile, avatar: reader.result }
        setUserProfile(updatedProfile)
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
      }
<<<<<<< Updated upstream
      reader.readAsDataURL(file)
=======
    })()
    return () => {
      mounted = false
    }
  }, [])

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const res = await api.listTransactions({ startDate: start.toISOString(), endDate: now.toISOString() })
        const list = res?.data?.transactions || res?.transactions || res?.data || res || []
        const txns = Array.isArray(list) ? list : []

        const income = txns
          .filter((t) => String(t.type || '').toLowerCase() === 'income')
          .reduce((s, t) => s + Number(t.amount || 0), 0)
        const expense = txns
          .filter((t) => String(t.type || '').toLowerCase() === 'expense')
          .reduce((s, t) => s + Number(t.amount || 0), 0)

        const netChange = income - expense
        const baseline = Number(total || 0) - netChange
        const pct = baseline > 0 ? (netChange / baseline) * 100 : 0
        if (!mounted) return
        setNetWorthMoMPct(Number.isFinite(pct) ? pct : 0)
      } catch {
        if (!mounted) return
        setNetWorthMoMPct(0)
      }
    })()
    return () => {
      mounted = false
    }
  }, [total])

  const [tab, setTab] = React.useState('all')
  const [query, setQuery] = React.useState('')

  const accounts = wallets.map((w) => ({
    id: w.id || w._id,
    group: String(w.type || '').toLowerCase() === 'bank' ? 'bank' : 'manual',
    name: w.name,
    masked: w.type || 'Wallet',
    balance: Number(w.currentBalance ?? w.balance ?? 0),
    status: 'ok',
  }))

  const filtered = accounts
    .filter((a) => (tab === 'all' ? true : tab === 'bank' ? a.group === 'bank' : tab === 'cards' ? a.group === 'card' : a.group === 'manual'))
    .filter((a) => (query ? a.name.toLowerCase().includes(query.toLowerCase()) : true))

  const deleteAccount = async (account) => {
    const id = account?.id
    if (!id) return
    if (!window.confirm('Delete this account?')) return
    setBusyId(id)
    setError('')
    try {
      await api.deleteWallet(id)
      setWallets((prev) => prev.filter((w) => (w.id || w._id) !== id))
      setTotal((prev) => {
        const amt = Number(account.balance || 0)
        return prev - amt
      })
    } catch (e) {
      setError(e?.message || 'Failed to delete account')
    } finally {
      setBusyId(null)
    }
  }

  const renameAccount = async (account) => {
    const id = account?.id
    if (!id) return
    const currentName = String(account?.name || '').trim()
    const nextName = window.prompt('Rename account', currentName)
    if (nextName === null) return
    const trimmed = String(nextName).trim()
    if (!trimmed || trimmed === currentName) return

    setBusyId(id)
    setError('')
    try {
      const res = await api.updateWallet(id, { name: trimmed })
      const updated = res?.data?.data || res?.data || res

      setWallets((prev) => prev.map((w) => ((w.id || w._id) === id ? { ...w, ...updated } : w)))
    } catch (e) {
      setError(e?.message || 'Failed to rename account')
    } finally {
      setBusyId(null)
    }
  }

  const toggleAccountStatus = async (account) => {
    const id = account?.id
    if (!id) return
    const wallet = wallets.find((w) => (w.id || w._id) === id)
    const nextStatus = wallet?.status === 'inactive' ? 'active' : 'inactive'

    setBusyId(id)
    setError('')
    try {
      const res = await api.updateWallet(id, { status: nextStatus })
      const updated = res?.data?.data || res?.data || res

      setWallets((prev) => prev.map((w) => ((w.id || w._id) === id ? { ...w, ...updated } : w)))
    } catch (e) {
      setError(e?.message || 'Failed to update account')
    } finally {
      setBusyId(null)
>>>>>>> Stashed changes
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Account</h2>
        <p className="text-gray-600">View and manage your personal information</p>
      </div>

<<<<<<< Updated upstream
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 overflow-hidden">
        {/* Header Section with Avatar */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 relative">
          <div className="absolute top-6 right-6">
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
=======
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border-dark bg-card-dark p-6">
            <div className="text-sm font-medium text-text-secondary">Total Net Worth</div>
            <div className="mt-2 text-3xl font-bold text-white">{formatMoney(total)}</div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/20">
                <span className="material-symbols-outlined text-[16px] text-primary">trending_up</span>
              </span>
              <span className="font-bold text-primary">
                {netWorthMoMPct >= 0 ? '+' : ''}
                {Math.abs(netWorthMoMPct).toFixed(1)}%
              </span>
              <span className="text-text-secondary">vs last month</span>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border-dark bg-card-dark p-1">
              <span className="material-symbols-outlined px-3 text-text-secondary">search</span>
              <input
                className="h-12 w-full bg-transparent pr-3 text-white placeholder:text-text-secondary/60 outline-none"
                placeholder="Search accounts (e.g. Chase, Citi)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-6 border-b border-border-dark px-1">
              {[
                { k: 'all', label: 'All Accounts' },
                { k: 'bank', label: 'Banking' },
                { k: 'cards', label: 'Credit Cards' },
                { k: 'manual', label: 'Manual' },
              ].map((t) => (
>>>>>>> Stashed changes
                <button
                  onClick={handleSubmit(onSaveProfile)}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={handleEditToggle}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="text-white">
              <h3 className="text-3xl font-bold mb-2">{userProfile.name}</h3>
              <p className="text-blue-100 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {userProfile.email}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSaveProfile)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Full Name */}
              <div className="form-group">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <User className="w-4 h-4" /> Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'border-red-500' : ''}`}
                    {...register('name', { required: 'Name is required' })}
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-800 font-medium">
                    {userProfile.name}
                  </div>
                )}
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'border-red-500' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                    })}
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-800 font-medium">
                    {userProfile.email}
                  </div>
                )}
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="form-control"
                    {...register('phone')}
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-800 font-medium">
                    {userProfile.phone}
                  </div>
                )}
              </div>

              {/* Birthday */}
              <div className="form-group">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <Calendar className="w-4 h-4" /> Birthday
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    className="form-control"
                    {...register('birthday')}
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-800 font-medium">
                    {userProfile.birthday ? new Date(userProfile.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="form-group md:col-span-2">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <MapPin className="w-4 h-4" /> Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    {...register('address')}
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-800 font-medium">
                    {userProfile.address}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="form-group md:col-span-2">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <User className="w-4 h-4" /> Bio
                </label>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    rows="4"
                    {...register('bio')}
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-gray-800 font-medium">
                    {userProfile.bio}
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Account Statistics */}
          <div className="border-t border-gray-200 pt-8">
            <h4 className="text-xl font-bold text-gray-800 mb-6">Account Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300">
                <div className="text-gray-600 font-semibold mb-2">Member Since</div>
                <div className="text-2xl font-bold text-green-600">Jan 2024</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="text-gray-600 font-semibold mb-2">Total Transactions</div>
                <div className="text-2xl font-bold text-blue-600">
                  {JSON.parse(localStorage.getItem('transactions_demo') || '[]').length}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300">
                <div className="text-gray-600 font-semibold mb-2">Active Wallets</div>
                <div className="text-2xl font-bold text-purple-600">
                  {JSON.parse(localStorage.getItem('wallets_demo') || '[]').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
