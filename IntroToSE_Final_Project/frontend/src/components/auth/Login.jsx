import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase'

export default function Login({ onLogin, onNavigate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [message, setMessage] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username) return
    // In a real app, call API and handle errors. Here we simulate success.
    onLogin({ username })
  }

  const validateEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email)
  }

  const handleSendReset = async () => {
    setMessage(null)
    if (!validateEmail(forgotEmail)) return setMessage({ type: 'error', text: 'Please enter a valid email.' })
    try {
      // Use default Firebase action handler URL (can be configured via console or pass actionCodeSettings)
      await sendPasswordResetEmail(auth, forgotEmail)
      setMessage({ type: 'success', text: 'Password reset email sent. Check your inbox.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send reset email.' })
    }
  }

  return (
    <div className="auth-page">
      <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Login</button>
          </div>
        </form>
        <div className="auth-footer">
          <div>
            <button type="button" className="link-btn" onClick={() => setShowForgot(s => !s)}>Forgot Password?</button>
          </div>
          <div style={{ marginTop: 8 }}>Don't have an account? <button type="button" className="link-btn" onClick={() => onNavigate && onNavigate('register')}>Register now!</button></div>
        </div>
        {showForgot && (
          <div className="forgot-panel">
            <h3>Reset Password</h3>
            <div className="form-group">
              <label>Registered email</label>
              <input className="form-control" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
            </div>
            <div className="form-actions">
              <button className="btn" type="button" onClick={() => setShowForgot(false)}>Cancel</button>
              <button className="btn btn-primary" type="button" onClick={handleSendReset}>Send Reset Link</button>
            </div>
            {message && <div className={message.type === 'error' ? 'msg error' : 'msg success'}>{message.text}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
