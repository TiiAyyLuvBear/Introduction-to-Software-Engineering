import React from 'react'
import FormattedNumberInput from '../../../components/FormattedNumberInput.jsx'
import { useToast } from '../../../components/Toast.jsx'
import transactionService from '../../../services/transactionService.js'
import walletService from '../../../services/walletService.js'

function toNumber(value) {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

export default function TransferMoneyForm({ onSuccess, onCancel, onSwitchToTransaction }) {
    const toast = useToast()
    const [wallets, setWallets] = React.useState([])
    const [fromId, setFromId] = React.useState('')
    const [toId, setToId] = React.useState('')
    const [amount, setAmount] = React.useState(0)
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10))
    const [note, setNote] = React.useState('')
    const [busy, setBusy] = React.useState(false)

    React.useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const walletsRes = await walletService.listWallets({ status: 'active' })
                    if (!mounted) return

                    const list = walletsRes || []
                    const all = Array.isArray(list) ? list : []
                    const editable = all.filter((w) => {
                        const p = w?.myPermission
                        return p === 'owner' || p === 'edit'
                    })
                    setWallets(editable)

                    // Auto-select first two different wallets if available
                    const firstId = editable[0]?.id || editable[0]?._id || ''
                    const secondId = editable[1]?.id || editable[1]?._id || ''
                    if (!fromId && firstId) setFromId(firstId)
                    if (!toId && secondId) setToId(secondId)
                } catch (error) {
                    console.error('Failed to fetch wallets:', error)
                    if (mounted) setWallets([])
                }
            })()
        return () => {
            mounted = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const inputClass =
        'h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none'

    const submit = (e) => {
        e.preventDefault()

        if (wallets.length < 2) {
            toast.error('You need at least 2 wallets to transfer money')
            return
        }
        if (!fromId || !toId) {
            toast.error('Please select both source and destination wallets')
            return
        }
        if (fromId === toId) {
            toast.error('Source and destination wallets must be different')
            return
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        setBusy(true)
            ; (async () => {
                try {
                    await transactionService.transferMoney({
                        fromWalletId: fromId,
                        toWalletId: toId,
                        amount: Math.abs(amount),
                        date,
                        note,
                    })
                    // Recalculate balance for both wallets
                    try {
                        await walletService.recalculateBalance()
                    } catch (e) {
                        console.warn('Failed to recalculate balance:', e)
                    }
                    // Notify wallet pages to refresh
                    window.dispatchEvent(new CustomEvent('walletBalanceChanged'))
                    toast.success('Transfer completed successfully')
                    if (onSuccess) onSuccess()
                } catch (e2) {
                    toast.error(e2?.response?.data?.error || e2?.message || 'Failed to transfer')
                } finally {
                    setBusy(false)
                }
            })()
    }

    return (
        <div className="rounded-2xl border border-border-dark bg-card-dark p-5">
            <div className="flex rounded-lg bg-border-dark p-1">
                <button
                    type="button"
                    onClick={() => onSwitchToTransaction && onSwitchToTransaction('expense')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-text-secondary hover:text-white"
                >
                    <span className="material-symbols-outlined text-[18px]">trending_down</span>
                    Expense
                </button>
                <button
                    type="button"
                    onClick={() => onSwitchToTransaction && onSwitchToTransaction('income')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-text-secondary hover:text-white"
                >
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                    Income
                </button>
                <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-background-dark px-4 py-2 text-sm font-bold text-white"
                >
                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                    Transfer
                </button>
            </div>

            <form onSubmit={submit} className="mt-5 grid gap-4">
                {wallets.length < 2 ? (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                        ⚠️ You need at least 2 wallets to transfer money. Please create another wallet first.
                    </div>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2">
                        <span className="text-sm font-medium text-white">From</span>
                        <select className={inputClass} value={fromId} onChange={(e) => setFromId(e.target.value)}>
                            {wallets.map((w) => (
                                <option key={w.id || w._id} value={w.id || w._id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium text-white">To</span>
                        <select className={inputClass} value={toId} onChange={(e) => setToId(e.target.value)}>
                            {wallets
                                .filter((w) => (w.id || w._id) !== fromId)
                                .map((w) => (
                                    <option key={w.id || w._id} value={w.id || w._id}>
                                        {w.name}
                                    </option>
                                ))}
                        </select>
                    </label>
                </div>

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
                        disabled={busy || wallets.length < 2}
                        className="flex-1 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                    >
                        {busy ? 'Transferring…' : 'Transfer'}
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
