import React from 'react'
import FormattedNumberInput from '../../../components/FormattedNumberInput.jsx'
import { useToast } from '../../../components/Toast.jsx'
import transactionService from '../../../services/transactionService.js'
import categoryService from '../../../services/categoryService.js'
import walletService from '../../../services/walletService.js'

function toNumber(value) {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

export default function EditTransactionForm({ transaction, onSuccess, onCancel }) {
    const toast = useToast()
    const [tx, setTx] = React.useState(transaction || null)
    const [categories, setCategories] = React.useState([])
    const [wallets, setWallets] = React.useState([])
    const [busy, setBusy] = React.useState(false)
    const [permissionBlocked, setPermissionBlocked] = React.useState(false)
    const [walletsLoaded, setWalletsLoaded] = React.useState(false)

    const [type, setType] = React.useState('expense')
    const [amount, setAmount] = React.useState(0)
    const [categoryId, setCategoryId] = React.useState('')
    const [walletId, setWalletId] = React.useState('')
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10))
    const [note, setNote] = React.useState('')

    React.useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const [categoriesData, walletsRes] = await Promise.all([
                        categoryService.listCategories({ page: 1, limit: 200 }),
                        walletService.listWallets({ status: 'active' })
                    ])
                    if (!mounted) return

                    // Set categories
                    setCategories(Array.isArray(categoriesData) ? categoriesData : [])

                    // Extract wallets array from response
                    const walletsList = walletsRes || []
                    const all = Array.isArray(walletsList) ? walletsList : []

                    // Filter wallets where user has edit permission
                    const editable = all.filter((w) => {
                        const p = w?.myPermission
                        return p === 'owner' || p === 'edit'
                    })
                    setWallets(editable)
                    setWalletsLoaded(true)
                } catch (error) {
                    console.error('Failed to fetch data:', error)
                    if (mounted) {
                        setWallets([])
                        setCategories([])
                        setWalletsLoaded(true)
                        toast.error('Failed to load categories and wallets')
                    }
                }
            })()
        return () => {
            mounted = false
        }
    }, [toast])

    React.useEffect(() => {
        if (transaction) {
            setTx(transaction)
        }
    }, [transaction])

    React.useEffect(() => {
        if (!tx) return
        setType(tx.type || 'expense')
        setAmount(Number(tx.amount) || 0)
        setCategoryId(tx.categoryId || '')
        setWalletId(tx.walletId || '')
        setDate(String(tx.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10))
        setNote(tx.note || '')
    }, [tx])

    React.useEffect(() => {
        if (!tx) return
        if (type === 'transfer') {
            toast.warning('Transfer transactions cannot be edited here')
        }
    }, [type, tx, toast])

    React.useEffect(() => {
        if (!tx) return
        if (!walletsLoaded) return // Wait for wallets to load before checking permission

        const wid = tx.walletId
        if (!wid) return

        const ok = wallets.some((w) => String(w.id || w._id) === String(wid))
        if (!ok) {
            setPermissionBlocked(true)
            toast.error('You do not have permission to edit transactions in this wallet')
        } else {
            setPermissionBlocked(false)
        }
    }, [tx, wallets, walletsLoaded, toast])

    const submit = (e) => {
        e.preventDefault()

        if (!tx) {
            toast.error('Transaction not found')
            return
        }
        if (type === 'transfer') {
            toast.error('Transfer transactions cannot be edited')
            return
        }
        if (permissionBlocked) {
            toast.error('No permission to edit this transaction')
            return
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error('Please enter a valid amount')
            return
        }
        if (!walletId) {
            toast.error('Please select a wallet')
            return
        }

        setBusy(true)
            ; (async () => {
                try {
                    const category = categories.find((c) => c._id === categoryId)
                    await transactionService.updateTransaction(tx._id || tx.id, {
                        amount: Math.abs(amount),
                        type,
                        walletId,
                        categoryId,
                        category: category?.name || tx?.category,
                        date,
                        note,
                    })

                    // Backend already updates wallet balance correctly using rollback-and-apply pattern
                    // No need to recalculate here as it may cause race conditions

                    // Notify wallet pages to refresh
                    window.dispatchEvent(new CustomEvent('walletBalanceChanged'))
                    toast.success('Transaction updated successfully')
                    if (onSuccess) onSuccess()
                } catch (e2) {
                    toast.error(e2?.response?.data?.error || e2?.message || 'Failed to update transaction')
                } finally {
                    setBusy(false)
                }
            })()
    }

    const inputClass =
        'h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none'

    return (
        <div className="rounded-2xl border border-border-dark bg-card-dark p-5">
            <div className="flex rounded-lg bg-border-dark p-1">
                {[
                    { v: 'expense', label: 'Expense', icon: 'trending_down' },
                    { v: 'income', label: 'Income', icon: 'trending_up' },
                ].map((t) => (
                    <button
                        key={t.v}
                        type="button"
                        onClick={() => setType(t.v)}
                        className={
                            'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-colors ' +
                            (type === t.v ? 'bg-background-dark text-white' : 'text-text-secondary hover:text-white')
                        }
                    >
                        <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            <form onSubmit={submit} className="mt-5 grid gap-4">
                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white">Amount</span>
                    <FormattedNumberInput
                        inputClassName={inputClass}
                        value={amount}
                        decimals={2}
                        placeholder="0.00"
                        onChangeValue={(n) => {
                            setAmount(Number.isFinite(n) ? n : 0)
                        }}
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white">Category</span>
                    <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                        {categories
                            .filter((c) => c.type === type)
                            .map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                    </select>
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white">Wallet</span>
                    <select className={inputClass} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
                        {wallets.map((w) => (
                            <option key={w.id || w._id} value={w.id || w._id}>
                                {w.name} ({w.currency || 'USD'})
                            </option>
                        ))}
                    </select>
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white">Date</span>
                    <input className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} type="date" />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white">Note</span>
                    <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
                </label>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={busy || !tx || permissionBlocked}
                        className="flex-1 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                    >
                        {busy ? 'Saving…' : 'Save changes'}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={() => onCancel()}
                            className="rounded-lg border border-border-dark bg-transparent px-5 py-2 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
