import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

import authService from '../services/authService.js';

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
      // Call authService.loginWithEmail()
      const result = await authService.loginWithEmail(email, password);
      
      if (!result?.data?.user || !result?.data?.accessToken) {
        throw new Error('Login failed: Invalid response')
      }
      
      // User đã được sync trong backend handleLogin, không cần gọi lại syncProfile
      
      // Call onLogin to update App state
      const { user, accessToken, refreshToken } = result.data;
      onLogin({ user, accessToken, refreshToken })
      navigate('/dashboard');
    } catch (err) {
      alert(err?.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setBusy(true)
      // Login with Google
      const result = await authService.loginWithGoogle();
      
      if (!result?.data?.user || !result?.data?.accessToken) {
        throw new Error('Google login failed: Invalid response')
      }
      
      // User đã được sync trong backend handleLogin, không cần gọi lại syncProfile
      
      // Call onLogin to update App state
      const { user, accessToken, refreshToken } = result.data;
      onLogin({ user, accessToken, refreshToken })
      navigate('/dashboard');
    } catch (err) {
      alert(err?.message || 'Google login failed')
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
            <div className="text-white text-xl font-bold tracking-tight">4Money</div>
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
                className="text-sm font-semibold text-primary hover:brightness-110"
                onClick={() => navigate('/forgot-password')}
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

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border-dark"></div>
            <span className="text-text-secondary text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-border-dark"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={busy}
            type="button"
            className="w-full h-12 rounded-lg bg-surface-dark border border-input-border text-white font-semibold text-base transition-all hover:bg-border-dark hover:border-primary flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {busy ? 'Signing in...' : 'Continue with Google'}
          </button>

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
