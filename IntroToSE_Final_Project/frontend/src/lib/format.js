export function formatNumber(value, { maximumFractionDigits = 2, minimumFractionDigits = 0 } = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  // Sử dụng locale 'de-DE' để format với dấu chấm (.) làm thousand separator
  // Ví dụ: 1.000.000 thay vì 1,000,000
  return n.toLocaleString('de-DE', { maximumFractionDigits, minimumFractionDigits })
}

export function formatMoney(value, { currencySymbol = ' VND', maximumFractionDigits = 2, minimumFractionDigits = 2, position = 'suffix' } = {}) {
  const n = Number(value)
  const abs = Number.isFinite(n) ? Math.abs(n) : 0
  const formatted = formatNumber(abs, { maximumFractionDigits, minimumFractionDigits })
  const sign = (Number.isFinite(n) && n < 0) ? '-' : ''

  if (position === 'suffix') {
    return `${sign}${formatted}${currencySymbol}`
  }
  return `${sign}${currencySymbol}${formatted}`
}

export function parseNumberLike(value) {
  if (value === null || value === undefined) return NaN
  if (typeof value === 'number') return value
  const s = String(value)
    .replace(/\s+/g, '') // Xóa spaces
    .replace(/\./g, '') // Xóa dấu chấm (thousand separator trong format VN: 1.000.000)
    .replace(/,/g, '.') // Đổi dấu phẩy thành chấm (decimal separator: 1,5 -> 1.5)
    .replace(/[^0-9.-]/g, '') // Chỉ giữ số, dấu chấm, dấu trừ
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}
