import React from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../lib/api.js'
import MoreMenu from '../components/MoreMenu.jsx'
import { formatMoney } from '../lib/format.js'

export default function Accounts() {
  const navigate = useNavigate()
  const [total, setTotal] = React.useState(0)
  const [wallets, setWallets] = React.useState([])
  const [busyId, setBusyId] = React.useState(null)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const walletsRes = await api.listWallets()
        const list = walletsRes?.data?.wallets || walletsRes?.wallets || walletsRes?.data || walletsRes || []
        const wallets = Array.isArray(list) ? list : []
        const nextTotal = wallets.reduce((s, w) => s + Number(w.currentBalance ?? w.balance ?? 0), 0)
        if (!mounted) return
        setWallets(wallets)
        setTotal(nextTotal)
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

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
    }
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">My Accounts</h1>
            <p className="mt-2 text-text-secondary">Manage your connected banks and wallets.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/wallets/new')}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-background-dark hover:brightness-110"
          >
            <span className="material-symbols-outlined">add</span>
            Add Account
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border-dark bg-card-dark p-6">
            <div className="text-sm font-medium text-text-secondary">Total Net Worth</div>
            <div className="mt-2 text-3xl font-bold text-white">{formatMoney(total)}</div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/20">
                <span className="material-symbols-outlined text-[16px] text-primary">trending_up</span>
              </span>
              <span className="font-bold text-primary">+2.5%</span>
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
                <button
                  key={t.k}
                  type="button"
                  onClick={() => setTab(t.k)}
                  className={
                    'pb-3 px-2 text-sm font-bold transition-colors ' +
                    (tab === t.k
                      ? 'border-b-2 border-primary text-white'
                      : 'border-b-2 border-transparent text-text-secondary hover:text-white')
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 pb-12">
          {error ? (
            <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          {filtered.map((a) => (
            <div
              key={a.id}
              className="group cursor-pointer rounded-xl border border-border-dark bg-card-dark p-5 transition-all hover:border-primary/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-full bg-border-dark text-white text-xs font-bold">
                  {a.name
                    .split(' ')
                    .slice(0, 2)
                    .map((x) => x[0])
                    .join('')}
                </div>
                <MoreMenu
                  ariaLabel="Account options"
                  buttonClassName="text-text-secondary hover:text-white disabled:opacity-60"
                  items={[
                    { label: 'Rename', icon: 'edit', disabled: busyId === a.id, onClick: () => renameAccount(a) },
                    {
                      label: (wallets.find((w) => (w.id || w._id) === a.id)?.status || 'active') === 'inactive' ? 'Set Active' : 'Set Inactive',
                      icon: 'toggle_on',
                      disabled: busyId === a.id,
                      onClick: () => toggleAccountStatus(a),
                    },
                    { label: 'Delete', icon: 'delete', disabled: busyId === a.id, onClick: () => deleteAccount(a) },
                  ]}
                />
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-text-secondary">{a.name}</div>
                <div className="text-xs text-text-secondary/70">{a.masked}</div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div className={
                  'text-2xl font-bold tabular-nums ' + (a.balance < 0 ? 'text-red-400' : 'text-white')
                }>
                  {formatMoney(Math.abs(a.balance))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-border-dark pt-3 text-xs">
                <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                <span className={a.status === 'due' ? 'text-orange-400 font-medium' : 'text-text-secondary'}>
                  {a.status === 'due' ? 'Due soon' : 'Updated recently'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
