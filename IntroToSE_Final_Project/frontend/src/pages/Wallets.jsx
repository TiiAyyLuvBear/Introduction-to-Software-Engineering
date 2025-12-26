import React from 'react'
import { useNavigate } from 'react-router-dom'

// import { api } from '../lib/api.js'
import MoreMenu from '../components/MoreMenu.jsx'
import { formatMoney } from '../lib/format.js'

export default function Wallets() {
  const navigate = useNavigate()

  const [allWallets, setAllWallets] = React.useState([])
  const [status, setStatus] = React.useState('active')
  const [sortDir, setSortDir] = React.useState('asc')
  const [busyId, setBusyId] = React.useState(null)
  const [error, setError] = React.useState('')

  const loadWallets = React.useCallback(async (nextStatus) => {
    try {
      const res = await api.listWallets({ status: nextStatus })
      const wallets = res?.data?.wallets || res?.data || res || []
      setAllWallets(Array.isArray(wallets) ? wallets : [])
    } catch (e) {
      setError(e?.message || 'Failed to load wallets')
    }
  }, [])

  React.useEffect(() => {
    loadWallets(status)
  }, [loadWallets, status])

  const [query, setQuery] = React.useState('')
  const wallets = allWallets
    .filter((w) => (query ? String(w.name || '').toLowerCase().includes(query.toLowerCase()) : true))
    .slice()
    .sort((a, b) => {
      const an = String(a?.name || '').toLowerCase()
      const bn = String(b?.name || '').toLowerCase()
      return sortDir === 'asc' ? an.localeCompare(bn) : bn.localeCompare(an)
    })

  const total = wallets.reduce((s, w) => s + Number(w.balance ?? w.currentBalance ?? 0), 0)

  const toggleStatus = () => {
    setError('')
    setStatus((prev) => (prev === 'active' ? 'inactive' : 'active'))
  }

  const toggleSort = () => {
    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const deleteWallet = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    if (!window.confirm('Delete this wallet?')) return
    setBusyId(id)
    setError('')
    try {
      await api.deleteWallet(id)
      setAllWallets((prev) => prev.filter((w) => (w.id || w._id) !== id))
    } catch (e) {
      setError(e?.message || 'Failed to delete wallet')
    } finally {
      setBusyId(null)
    }
  }

  const renameWallet = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    const currentName = String(wallet?.name || '').trim()
    const nextName = window.prompt('Rename wallet', currentName)
    if (nextName === null) return
    const trimmed = String(nextName).trim()
    if (!trimmed || trimmed === currentName) return

    setBusyId(id)
    setError('')
    try {
      const res = await api.updateWallet(id, { name: trimmed })
      const updated = res?.data?.data || res?.data || res
      setAllWallets((prev) => prev.map((w) => ((w.id || w._id) === id ? { ...w, ...updated } : w)))
    } catch (e) {
      setError(e?.message || 'Failed to rename wallet')
    } finally {
      setBusyId(null)
    }
  }

  const toggleWalletStatus = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    const nextStatus = wallet?.status === 'inactive' ? 'active' : 'inactive'

    setBusyId(id)
    setError('')
    try {
      const res = await api.updateWallet(id, { status: nextStatus })
      const updated = res?.data?.data || res?.data || res
      setAllWallets((prev) => prev.map((w) => ((w.id || w._id) === id ? { ...w, ...updated } : w)))
    } catch (e) {
      setError(e?.message || 'Failed to update wallet')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">My Wallets</h1>
            <p className="mt-2 text-text-secondary">Manage your accounts, cards, and cash flow in one place.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/wallets/new')}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-background-dark hover:brightness-110"
          >
            <span className="material-symbols-outlined">add</span>
            Add New Wallet
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-xl border border-border-dark bg-gradient-to-br from-[#1c2b22] to-[#111813] p-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <div className="text-sm font-medium text-text-secondary flex items-center gap-2">
                Total Net Worth
                <span className="material-symbols-outlined text-[16px] text-text-secondary">visibility</span>
              </div>
              <div className="mt-2 text-4xl font-bold text-white">{formatMoney(total)}</div>
              <div className="mt-2 text-xs text-text-secondary">Updated just now</div>
            </div>
          </div>
          <div className="rounded-xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-border-dark text-primary">
                <span className="material-symbols-outlined">savings</span>
              </div>
              <div className="text-white font-bold">Total Savings</div>
            </div>
            <div className="mt-3 text-2xl font-bold text-white">{formatMoney(total)}</div>
            <div className="mt-1 text-xs text-text-secondary">Demo stat</div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <label className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              search
            </span>
            <input
              className="h-12 w-full rounded-lg bg-[#1c2b22] border border-border-dark pl-12 pr-4 text-white placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Search wallet name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleStatus}
              className="h-12 rounded-lg bg-[#1c2b22] border border-border-dark px-4 text-text-secondary hover:bg-border-dark hover:text-white"
            >
              <span className="material-symbols-outlined align-middle">filter_list</span>
            </button>
            <button
              type="button"
              onClick={toggleSort}
              className="h-12 rounded-lg bg-[#1c2b22] border border-border-dark px-4 text-text-secondary hover:bg-border-dark hover:text-white"
            >
              <span className="material-symbols-outlined align-middle">sort</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-8">
          {error ? (
            <div className="col-span-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          {wallets.map((w) => (
            <div
              key={w.id || w._id}
              className="group relative cursor-pointer rounded-xl border border-border-dark bg-[#1c2b22] p-5 transition-all hover:border-primary/50 hover:bg-[#223329]"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-lg bg-border-dark text-white">
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                    {w.icon || 'account_balance_wallet'}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100">
                  <MoreMenu
                    ariaLabel="Wallet options"
                    buttonClassName="text-text-secondary hover:text-white disabled:opacity-60"
                    items={[
                      { label: 'Rename', icon: 'edit', disabled: busyId === (w.id || w._id), onClick: () => renameWallet(w) },
                      {
                        label: w?.status === 'inactive' ? 'Set Active' : 'Set Inactive',
                        icon: 'toggle_on',
                        disabled: busyId === (w.id || w._id),
                        onClick: () => toggleWalletStatus(w),
                      },
                      { label: 'Delete', icon: 'delete', disabled: busyId === (w.id || w._id), onClick: () => deleteWallet(w) },
                    ]}
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-white text-lg font-bold">{w.name}</div>
                <div className="mt-1 text-xs text-text-secondary">{w.type || 'Wallet'}</div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-border-dark pt-4">
                <div>
                  <div className="text-xs text-text-secondary">Balance</div>
                  <div className="mt-1 text-xl font-bold text-white">{formatMoney(Number(w.balance ?? w.currentBalance ?? 0))}</div>
                </div>
                <div className="text-xs text-text-secondary">{w.currency}</div>
              </div>
            </div>
          ))}
          {wallets.length === 0 && (
            <div className="col-span-full rounded-xl border border-border-dark bg-card-dark p-6 text-text-secondary">
              No wallets found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
