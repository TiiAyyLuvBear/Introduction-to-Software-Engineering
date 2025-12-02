import React, { useState, useEffect } from 'react'
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth'
import { auth } from '../firebase'

export default function ResetPassword({ oobCode, onNavigate }) {
  const [code, setCode] = useState(oobCode || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!code) {
      // try to read from URL
      const params = new URLSearchParams(window.location.search)
      const c = params.get('oobCode')
      if (c) setCode(c)
    }
  }, [code])

  useEffect(() => {
    if (!code) return
    // verify code to get email
    verifyPasswordResetCode(auth, code)
      .then(email => setEmail(email))
      .catch(err => setMessage({ type: 'error', text: err.message || 'Invalid or expired reset link.' }))
  }, [code])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    if (!password) return setMessage({ type: 'error', text: 'Enter a new password.' })
    if (password !== confirm) return setMessage({ type: 'error', text: 'Passwords do not match.' })
    try {
      await confirmPasswordReset(auth, code, password)
      setMessage({ type: 'success', text: 'Password updated. You can now log in.' })
      // optionally navigate to login
      setTimeout(() => onNavigate && onNavigate('login'), 1500)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to reset password.' })
    }
  }

  return (
    <div className="auth-page">
      <div className="form-container">
        <h2>Reset Password</h2>
        {email ? <p>Resetting password for <b>{email}</b></p> : <p>Verifying link...</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" className="form-control" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Update Password</button>
          </div>
        </form>
        {message && <div className={message.type === 'error' ? 'msg error' : 'msg success'}>{message.text}</div>}
      </div>
    </div>
  )
}
