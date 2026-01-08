export function formatNumber(value, { maximumFractionDigits = 2, minimumFractionDigits = 0 } = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  // Sử dụng locale 'de-DE' để format với dấu chấm (.) làm thousand separator
  // Ví dụ: 1.000.000 thay vì 1,000,000
  return n.toLocaleString('de-DE', { maximumFractionDigits, minimumFractionDigits })
}

export function formatMoney(value, { currencySymbol = '$', maximumFractionDigits = 2, minimumFractionDigits = 2 } = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return `${currencySymbol}${formatNumber(0, { maximumFractionDigits, minimumFractionDigits })}`
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  return `${sign}${currencySymbol}${formatNumber(abs, { maximumFractionDigits, minimumFractionDigits })}`
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
