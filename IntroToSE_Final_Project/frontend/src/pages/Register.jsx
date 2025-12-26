import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../services/authService';


export default function Register({ onLogin }) {
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [agree, setAgree] = React.useState(true)
  const [showPassword, setShowPassword] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (!agree) {
      alert('Please accept the terms to continue')
      return
    }
    try {
      setBusy(true)
      const response = await authService.register(email, password, name);
      if(response) {
        onLogin(response);
        navigate('/dashboard');
      } else {
        alert('Register failed');
      }
    } catch (err) {
      alert(err?.message || 'Register failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background-dark">
      <header className="lg:hidden flex items-center justify-between border-b border-border-dark px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          <span className="text-white font-bold">Money Lover</span>
        </div>
        <Link
          to="/login"
          className="flex h-9 items-center justify-center rounded-lg bg-border-dark/40 px-4 text-sm font-bold text-white hover:bg-border-dark/60"
        >
          Log In
        </Link>
      </header>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-10">
        <div className="max-w-lg">
          <div className="rounded-2xl border border-border-dark bg-surface-dark p-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[28px]">trending_up</span>
              <span className="text-primary font-bold text-lg">Track & Grow</span>
            </div>
            <h2 className="mt-4 text-white text-3xl font-bold">Master your cash flow.</h2>
            <p className="mt-2 text-text-secondary">A clean demo UI for budgets, reports, and goals.</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border-dark bg-border-dark/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">sync</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Auto Sync</div>
                    <div className="text-xs text-text-secondary">Demo data store</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border-dark bg-border-dark/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">shield</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Simple Auth</div>
                    <div className="text-xs text-text-secondary">Frontend-only</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] flex flex-col gap-6">
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
              <span className="text-white font-bold">Money Lover</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">Already a member?</span>
              <Link
                to="/login"
                className="flex h-9 items-center justify-center rounded-lg bg-border-dark/40 px-4 text-sm font-bold text-white hover:bg-border-dark/60"
              >
                Log In
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Create your account</h1>
            <p className="text-text-secondary text-base">Start your journey to financial freedom today.</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={submit}>
            <label className="flex flex-col gap-1.5">
              <span className="text-white text-sm font-medium">Name</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary material-symbols-outlined text-[20px]">
                  person
                </span>
                <input
                  className="w-full bg-surface-dark border border-input-border text-white rounded-lg h-12 pl-11 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-secondary/50 transition-shadow outline-none"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-white text-sm font-medium">Email Address</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary material-symbols-outlined text-[20px]">
                  mail
                </span>
                <input
                  className="w-full bg-surface-dark border border-input-border text-white rounded-lg h-12 pl-11 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-secondary/50 transition-shadow outline-none"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-white text-sm font-medium">Password</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary material-symbols-outlined text-[20px]">
                  lock
                </span>
                <input
                  className="w-full bg-surface-dark border border-input-border text-white rounded-lg h-12 pl-11 pr-10 focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-secondary/50 transition-shadow outline-none"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-white text-sm font-medium">Confirm Password</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary material-symbols-outlined text-[20px]">
                  lock_reset
                </span>
                <input
                  className="w-full bg-surface-dark border border-input-border text-white rounded-lg h-12 pl-11 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-secondary/50 transition-shadow outline-none"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  required
                />
              </div>
            </label>

            <div className="flex items-start gap-3 mt-1">
              <input
                className="mt-1 rounded border-input-border bg-surface-dark text-primary focus:ring-primary"
                id="terms"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label className="text-sm text-text-secondary leading-normal" htmlFor="terms">
                I agree to the <span className="text-primary">Terms of Service</span> and{' '}
                <span className="text-primary">Privacy Policy</span>.
              </label>
            </div>

            <button
              className="mt-2 w-full rounded-lg h-12 px-5 bg-primary hover:brightness-110 text-background-dark text-base font-bold tracking-[0.015em] transition-colors shadow-lg shadow-primary/20"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Creating…' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-sm text-text-secondary">
            Already have an account?
            <Link className="text-primary font-bold hover:brightness-110 ml-1" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
