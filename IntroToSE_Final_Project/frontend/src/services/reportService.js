/**
 * Report Service
 *
 * Wraps backend report endpoints:
 * - GET /api/reports/summary
 * - GET /api/reports/by-category (also /pie-chart)
 * - GET /api/reports/by-wallet
 * - GET /api/reports/bar-chart
 * - GET /api/reports/export-transactions (CSV)
 */

import api from './api.js'

function pickData(res) {
	return res?.data?.data ?? res?.data ?? null
}

export async function getSummary({ startDate, endDate, walletId } = {}) {
	const res = await api.get('/reports/summary', { params: { startDate, endDate, walletId } })
	return pickData(res)
}

export async function getByCategory({ startDate, endDate, walletId, type } = {}) {
	const res = await api.get('/reports/by-category', { params: { startDate, endDate, walletId, type } })
	return pickData(res) || []
}

export async function getPieChart({ startDate, endDate, walletId, type } = {}) {
	const res = await api.get('/reports/pie-chart', { params: { startDate, endDate, walletId, type } })
	return pickData(res) || []
}

export async function getByWallet({ startDate, endDate, type } = {}) {
	const res = await api.get('/reports/by-wallet', { params: { startDate, endDate, type } })
	return pickData(res) || []
}

export async function getBarChart({ startDate, endDate, walletId, type, interval } = {}) {
	const res = await api.get('/reports/bar-chart', { params: { startDate, endDate, walletId, type, interval } })
	return pickData(res) || []
}

export async function exportTransactionsCsv({ startDate, endDate, walletId, type, q } = {}) {
	const res = await api.get('/reports/export-transactions', {
		params: { startDate, endDate, walletId, type, q },
		responseType: 'text',
	})
	return res?.data || ''
}

export default {
	getSummary,
	getByCategory,
	getPieChart,
	getByWallet,
	getBarChart,
	exportTransactionsCsv,
}
