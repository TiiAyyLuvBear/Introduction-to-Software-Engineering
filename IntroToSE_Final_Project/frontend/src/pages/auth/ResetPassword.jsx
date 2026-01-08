import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

// import { api } from '../../lib/api.js'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const qs = React.useMemo(() => new URLSearchParams(location.search), [location.search])

  const initialEmail = qs.get('email') || ''
  const token = qs.get('token') || ''

  const [email, setEmail] = React.useState(initialEmail)
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!token) {
      setMessage('Link expired')
      return
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    try {
      setBusy(true)
      // const res = await api.resetPassword({ email, token, password })
      // setMessage(res?.message || 'Password updated successfully')
      // setTimeout(() => navigate('/login', { replace: true }), 700)
      setMessage('API call disabled - resetPassword()')
    } catch (err) {
      setMessage(err?.message || 'Failed to reset password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark px-6">
      <div className="w-full max-w-[440px] rounded-2xl border border-border-dark bg-card-dark p-6">
        <h1 className="text-2xl font-black tracking-tight text-white">Set a new password</h1>
        <p className="mt-2 text-sm text-text-secondary">Your reset link expires after 15 minutes.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-white">Email Address</span>
            <input
              className="h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-white">New Password</span>
            <input
              className="h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Min 8 chars + 1 special"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-white">Confirm Password</span>
            <input
              className="h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
            />
          </label>

          {message ? (
            <div className="rounded-lg border border-border-dark bg-border-dark/30 px-4 py-3 text-sm text-white">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="h-12 rounded-lg bg-primary text-background-dark font-bold hover:brightness-110 disabled:opacity-60"
          >
            {busy ? 'Updating…' : 'Update Password'}
          </button>
        </form>

        <div className="mt-5 text-sm text-text-secondary">
          <Link className="text-primary font-bold hover:brightness-110" to="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
