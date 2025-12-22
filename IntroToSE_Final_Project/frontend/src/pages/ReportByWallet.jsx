import React from 'react'
import { Link } from 'react-router-dom'

import { api } from '../lib/api.js'
import { formatMoney } from '../lib/format.js'

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportByWallet() {
  const [selected, setSelected] = React.useState(null)
  const [rows, setRows] = React.useState([])
  const [tx, setTx] = React.useState([])
  const [walletNameById, setWalletNameById] = React.useState({})
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [byWalletRes, txRes, walletsRes] = await Promise.all([
          api.reportByWallet({ type: 'expense' }),
          api.listTransactions(),
          api.listWallets(),
        ])

        const reportRows = byWalletRes?.data || []

        const walletsList = walletsRes?.data?.wallets || walletsRes?.wallets || walletsRes?.data || walletsRes || []
        const map = {}
        if (Array.isArray(walletsList)) {
          for (const w of walletsList) {
            if (w?._id) map[String(w._id)] = w.name
          }
        }

        const mappedRows = Array.isArray(reportRows)
          ? reportRows.map((r) => {
              const key = r?.walletId ? String(r.walletId) : 'unknown'
              return { key, name: map[key] || 'Wallet', total: Number(r?.total || 0), count: Number(r?.count || 0) }
            })
          : []

        const list = Array.isArray(txRes) ? txRes : []
        const expenseTx = list.filter((t) => t?.type === 'expense')

        if (!mounted) return
        setWalletNameById(map)
        setRows(mappedRows)
        setTx(expenseTx)
      } catch (e2) {
        if (!mounted) return
        setError(e2?.message || 'Failed to load report')
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const grand = rows.reduce((s, r) => s + Number(r.total || 0), 0)

  const top = rows[0]
  const topPct = grand && top ? (top.total / grand) * 100 : 0
  const donutStyle = {
    background: `conic-gradient(#19e65e 0 ${topPct}%, #29382e ${topPct}% 100%)`,
  }

  const exportCsv = () => {
    const header = 'wallet,total,percentage\n'
    const body = rows
      .map((r) => {
        const pct = grand ? (r.total / grand) * 100 : 0
        return `${JSON.stringify(r.name)},${r.total.toFixed(2)},${pct.toFixed(2)}`
      })
      .join('\n')
    downloadText('report-by-wallet.csv', header + body + '\n')
  }

  const exportJson = () => {
    const data = {
      type: 'wallet',
      grandTotal: grand,
      rows: rows.map((r) => ({
        ...r,
        percentage: grand ? (r.total / grand) * 100 : 0,
      })),
      selected,
      drillDown: selected ? tx.filter((t) => String(t.walletId) === selected) : [],
    }
    downloadText('report-by-wallet.json', JSON.stringify(data, null, 2))
  }

  const share = async () => {
    const payload = `Report by wallet (expenses)\nTotal: ${formatMoney(grand)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Report by wallet', text: payload })
        return
      }
    } catch {
      // ignore
    }
    try {
      await navigator.clipboard.writeText(payload)
      alert('Copied report summary to clipboard')
    } catch {
      alert(payload)
    }
  }

  const drill = selected ? tx.filter((t) => String(t.walletId) === selected) : []

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2">
              <Link
                to="/reports"
                className="inline-flex items-center gap-1 rounded-lg border border-border-dark bg-transparent px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Back to Reports
              </Link>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Report by Wallet</h1>
            <p className="mt-1 text-text-secondary">Expenses only{error ? ` • ${error}` : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="h-10 rounded-lg border border-border-dark bg-border-dark/30 px-4 text-sm font-semibold text-white hover:bg-border-dark/50"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="h-10 rounded-lg border border-border-dark bg-border-dark/30 px-4 text-sm font-semibold text-white hover:bg-border-dark/50"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={share}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark hover:brightness-110"
            >
              Share
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="text-sm font-semibold text-text-secondary">Top wallet share</div>
            <div className="mt-5 flex items-center gap-5">
              <div className="relative size-28 rounded-full" style={donutStyle}>
                <div className="absolute inset-4 rounded-full bg-card-dark" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Total expenses</div>
                <div className="mt-1 text-2xl font-bold text-white">{formatMoney(grand)}</div>
                <div className="mt-2 text-sm text-text-secondary">
                  Top: <span className="font-semibold text-white">{top?.name || '—'}</span>
                </div>
                {selected && (
                  <div className="mt-1 text-sm text-text-secondary">
                    Drill-down: <span className="font-semibold text-white">{walletNameById[selected] || 'Wallet'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border-dark bg-card-dark">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-dark text-text-secondary">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Wallet</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {rows.map((r) => {
                  const pct = grand ? (r.total / grand) * 100 : 0
                  const isSel = selected === r.key
                  return (
                    <tr
                      key={r.key}
                      className={
                        'cursor-pointer transition-colors hover:bg-border-dark/40 ' +
                        (isSel ? 'bg-border-dark/30' : '')
                      }
                      onClick={() => setSelected(isSel ? null : r.key)}
                    >
                      <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                      <td className="px-4 py-3 text-right font-bold text-white">{formatMoney(r.total)}</td>
                      <td className="px-4 py-3 text-right text-text-secondary">{pct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
                {rows.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-text-secondary" colSpan={3}>
                      No expense transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border-dark bg-card-dark">
            <div className="border-b border-border-dark px-5 py-4">
              <div className="text-sm font-bold text-white">Transactions in {walletNameById[selected] || 'Wallet'}</div>
              <div className="text-xs text-text-secondary">Click the wallet row again to close.</div>
            </div>
            <ul className="divide-y divide-border-dark">
              {drill.map((t) => (
                <li key={t._id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{t.note || '—'}</div>
                    <div className="text-xs text-text-secondary">
                      {String(t.date).slice(0, 10)} • {t.category || '—'}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white">-{formatMoney(Math.abs(Number(t.amount)))}</div>
                </li>
              ))}
              {drill.length === 0 && (
                <li className="px-5 py-6 text-center text-sm text-text-secondary">No items.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
