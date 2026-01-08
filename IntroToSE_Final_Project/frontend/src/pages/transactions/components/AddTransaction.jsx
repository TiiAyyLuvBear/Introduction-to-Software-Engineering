import React from 'react'
import transactionService from '../../../services/transactionService.js'
import FormattedNumberInput from '../../../components/FormattedNumberInput.jsx'
import { useToast } from '../../../components/Toast.jsx'
// import categoriesService from '../../../services/categoriesService.js'
// import walletService from '../../../services/walletService.js'

function toNumber(value) {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

export default function AddTransactionForm({ onSuccess, onCancel }) {
    const toast = useToast()
    const [categories, setCategories] = React.useState([])
    const [wallets, setWallets] = React.useState([])
    const [busy, setBusy] = React.useState(false)

    // Commented out for quick transaction creation without fetching categories and wallets
    // React.useEffect(() => {
    //     let mounted = true
    //         ; (async () => {
    //             try {
    //                 const [catsRes, walletsRes] = await Promise.all([
    //                     categoriesService.getCategories({ page: 1, limit: 200 }),
    //                     walletService.getWallets(),
    //                 ])
    //                 const items = catsRes?.items || []
    //                 const walletsList = walletsRes?.data?.wallets || walletsRes?.wallets || walletsRes?.data || walletsRes || []

    //                 if (!mounted) return
    //                 setCategories(Array.isArray(items) ? items : [])
    //                 const all = Array.isArray(walletsList) ? walletsList : []
    //                 const editable = all.filter((w) => {
    //                     const p = w?.myPermission
    //                     return p === 'owner' || p === 'edit'
    //                 })
    //                 setWallets(editable)
    //             } catch {
    //                 // ignore
    //             }
    //         })()
    //     return () => {
    //         mounted = false
    //     }
    // }, [])

    const [type, setType] = React.useState('expense')
    const [amount, setAmount] = React.useState(0)
    const [categoryId, setCategoryId] = React.useState('')
    const [walletId, setWalletId] = React.useState('')
    const [fromWalletId, setFromWalletId] = React.useState('')
    const [toWalletId, setToWalletId] = React.useState('')
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10))
    const [note, setNote] = React.useState('')

    React.useEffect(() => {
        if (!walletId && wallets.length) setWalletId(wallets[0]?.id || wallets[0]?._id || '')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallets])

    React.useEffect(() => {
        // Commented out - allow transfer type without closing the form
        // if (type === 'transfer') {
        //     // Notify parent that user wants to switch to transfer
        //     if (onCancel) onCancel('transfer')
        //     return
        // }
        const next = categories.find((c) => c.type === type)?._id || ''
        setCategoryId(next)
    }, [type, categories, onCancel])

    const submit = (e) => {
        e.preventDefault()

        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        // Validation for transfer
        if (type === 'transfer') {
            if (!fromWalletId || !toWalletId) {
                toast.error('Please select both wallets')
                return
            }
            if (fromWalletId === toWalletId) {
                toast.error('Cannot transfer to the same wallet')
                return
            }
        }

        setBusy(true)
            ; (async () => {
                try {
                    if (type === 'transfer') {
                        // Call transfer API
                        await transactionService.transferMoney({
                            fromWalletId,
                            toWalletId,
                            amount: Math.abs(amount),
                            date,
                            note,
                        })
                        toast.success('Transfer completed successfully')
                    } else {
                        // Regular transaction
                        const category = categories.find((c) => c._id === categoryId)
                        await transactionService.createTransaction({
                            amount: Math.abs(amount),
                            type,
                            walletId,
                            categoryId,
                            category: category?.name,
                            date,
                            note,
                        })
                        toast.success('Transaction created successfully')
                    }
                    if (onSuccess) onSuccess()
                } catch (e2) {
                    toast.error(e2?.response?.data?.error || e2?.message || 'Failed to create transaction')
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
                    { v: 'transfer', label: 'Transfer', icon: 'swap_horiz' },
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

                {type === 'transfer' ? (
                    <>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-white">From Wallet</span>
                            <select className={inputClass} value={fromWalletId} onChange={(e) => setFromWalletId(e.target.value)}>
                                <option value="">Select source wallet</option>
                                {wallets.map((w) => (
                                    <option key={w.id || w._id} value={w.id || w._id}>
                                        {w.name} ({w.currency || 'USD'})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-white">To Wallet</span>
                            <select className={inputClass} value={toWalletId} onChange={(e) => setToWalletId(e.target.value)}>
                                <option value="">Select destination wallet</option>
                                {wallets.map((w) => (
                                    <option key={w.id || w._id} value={w.id || w._id}>
                                        {w.name} ({w.currency || 'USD'})
                                    </option>
                                ))}
                            </select>
                        </label>
                    </>
                ) : (
                    <>
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
                                {wallets.length ? (
                                    wallets.map((w) => (
                                        <option key={w.id || w._id} value={w.id || w._id}>
                                            {w.name} ({w.currency || 'USD'})
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No editable wallets</option>
                                )}
                            </select>
                            {!wallets.length ? (
                                <div className="text-xs text-text-secondary">You need owner/edit permission to add transactions in a shared wallet.</div>
                            ) : null}
                        </label>
                    </>
                )}

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white">Date</span>
                    <input className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} type="date" />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white">Note</span>
                    <input
                        className={inputClass}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional"
                    />
                </label>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={busy}
                        className="flex-1 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                    >
                        {busy ? 'Saving…' : 'Save'}
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
