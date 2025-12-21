import { spawn } from 'node:child_process'

const API_BASE = process.env.SMOKE_API_BASE || 'http://localhost:4000/api'
const BACKEND_CWD = process.env.SMOKE_BACKEND_CWD || process.cwd()

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function jsonFetch(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText || 'Request failed'
    const err = new Error(`HTTP ${res.status}: ${msg}`)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

const logs = { out: '', err: '' }

function appendLimited(target, chunk, limit = 20000) {
  const next = target + chunk
  return next.length > limit ? next.slice(next.length - limit) : next
}

async function main() {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: BACKEND_CWD,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (d) => {
    logs.out = appendLimited(logs.out, d.toString())
  })
  child.stderr.on('data', (d) => {
    logs.err = appendLimited(logs.err, d.toString())
  })

  try {
    // Wait for server to accept HTTP
    let ready = false
    for (let i = 0; i < 60; i++) {
      try {
        await fetch(`${API_BASE}`)
        ready = true
        break
      } catch {
        await sleep(250)
      }
    }
    if (!ready) throw new Error('Backend did not start in time')

    const email = `smoketest_${Date.now()}@example.com`
    const password = 'TestPass123!'

    await jsonFetch('/auth/register', {
      method: 'POST',
      body: { name: 'Smoke Test', email, password },
    }).catch(() => {})

    const login = await jsonFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    const token = login?.data?.accessToken || login?.accessToken || login?.token
    if (!token) throw new Error('No access token returned from login')

    const wallet = await jsonFetch('/wallets', {
      method: 'POST',
      token,
      body: { name: 'Smoke Wallet', type: 'Cash', initialBalance: 100, currency: 'USD' },
    })
    const walletId = wallet?.data?.id || wallet?.data?._id || wallet?.id
    if (!walletId) throw new Error('No wallet id returned')

    const category = await jsonFetch('/categories', {
      method: 'POST',
      token,
      body: { name: 'Smoke Cat', type: 'expense', color: '#00ff00', icon: 'local_fire_department' },
    })
    const categoryId = category?._id || category?.id
    if (!categoryId) throw new Error('No category id returned')

    const tx = await jsonFetch('/transactions', {
      method: 'POST',
      token,
      body: {
        amount: 5.5,
        type: 'expense',
        walletId,
        categoryId,
        date: new Date().toISOString(),
        note: 'Smoke tx',
      },
    })
    const txId = tx?.transaction?._id || tx?.transaction?.id || tx?.data?._id || tx?.data?.id || tx?._id || tx?.id
    if (!txId) throw new Error('No transaction id returned')

    const goal = await jsonFetch('/goals', {
      method: 'POST',
      token,
      body: { name: 'Smoke Goal', targetAmount: 50, deadline: '2030-01-01', priority: 'medium' },
    })
    const goalId = goal?.data?.id || goal?.data?._id || goal?._id || goal?.id
    if (!goalId) throw new Error('No goal id returned')

    await jsonFetch(`/goals/${encodeURIComponent(goalId)}/contribute`, {
      method: 'POST',
      token,
      body: { amount: 3, walletId, note: 'Smoke contrib', date: new Date().toISOString() },
    })

    // Cleanup
    await jsonFetch(`/transactions/${encodeURIComponent(txId)}`, { method: 'DELETE', token }).catch(() => {})
    await jsonFetch(`/categories/${encodeURIComponent(categoryId)}`, { method: 'DELETE', token }).catch(() => {})
    await jsonFetch(`/wallets/${encodeURIComponent(walletId)}`, { method: 'DELETE', token }).catch(() => {})

    console.log('SMOKE_TEST_OK')
  } catch (err) {
    console.error('SMOKE_TEST_FAILED:', err?.message || err)
    if (err?.data) console.error('ERR_DATA:', JSON.stringify(err.data).slice(0, 2000))
    console.error('--- backend stdout tail ---')
    console.error(logs.out)
    console.error('--- backend stderr tail ---')
    console.error(logs.err)
    process.exitCode = 1
  } finally {
    child.kill('SIGTERM')
    await sleep(200)
    child.kill('SIGKILL')
  }
}

await main()
