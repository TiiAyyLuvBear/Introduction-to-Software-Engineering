import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { api } from '../lib/api.js'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  const submit = async (e) => {
    e.preventDefault()
    try {
      setBusy(true)
      const res = await api.login({ email, password })
      const payload = res?.data
      if (!payload?.user || !payload?.accessToken) throw new Error(res?.error || 'Login failed')
      onLogin({ user: payload.user, accessToken: payload.accessToken, refreshToken: payload.refreshToken })
      navigate('/', { replace: true })
    } catch (err) {
      alert(err?.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background-dark">
      <div className="hidden lg:flex lg:w-1/2 bg-surface-dark border-r border-border-dark p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          <div>
            <div className="text-white text-xl font-bold tracking-tight">Money Lover</div>
            <div className="text-text-secondary text-xs font-medium">Manage your finances</div>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight text-white">
            Master your finances,
            <br />
            <span className="text-primary">grow your future.</span>
          </h1>
          <p className="mt-5 text-text-secondary text-lg leading-relaxed">
            Track expenses, budget smartly, and hit your goals with a clean dashboard.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border-dark bg-border-dark/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Secure</div>
                  <div className="text-xs text-text-secondary">Frontend demo</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border-dark bg-border-dark/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <span className="material-symbols-outlined">insights</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Insights</div>
                  <div className="text-xs text-text-secondary">Reports + exports</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-text-secondary/70">© 2025 Money Lover (demo)</div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-[440px] flex flex-col gap-6">
          <div className="lg:hidden flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            <span className="text-white font-bold text-lg">Money Lover</span>
          </div>

          <div>
            <h2 className="text-white text-[32px] font-bold leading-tight tracking-tight">Welcome back</h2>
            <p className="text-text-secondary text-base mt-2">Manage your money efficiently</p>
          </div>

          <div className="w-full">
            <div className="flex border-b border-border-dark w-full">
              <div className="flex-1 pb-3 pt-2 text-center border-b-[3px] border-primary text-white">
                <span className="text-sm font-bold tracking-[0.015em]">Email</span>
              </div>
            </div>
          </div>

          <form className="flex flex-col gap-5 mt-2" onSubmit={submit}>
            <label className="flex flex-col gap-2">
              <span className="text-white text-sm font-medium">Email Address</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                  mail
                </span>
                <input
                  className="w-full rounded-lg bg-surface-dark border border-input-border text-white placeholder:text-text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-11 pr-4 transition-all outline-none"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-white text-sm font-medium">Password</span>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-text-secondary text-[20px]">lock</span>
                <input
                  className="w-full rounded-lg bg-surface-dark border border-input-border text-white placeholder:text-text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-11 pr-12 transition-all outline-none"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <button
                  className="absolute right-4 text-text-secondary hover:text-white transition-colors"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => window.alert('Password reset is not implemented yet.')}
                className="text-sm font-semibold text-primary hover:brightness-110"
              >
                Forgot Password?
              </button>
            </div>

            <button
              className="w-full h-12 rounded-lg bg-primary text-background-dark font-bold text-base transition-all shadow-lg shadow-primary/20 hover:brightness-110"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <div className="text-center mt-2">
            <p className="text-text-secondary text-sm">
              Don’t have an account?
              <Link className="text-primary font-bold hover:brightness-110 ml-1" to="/register">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
