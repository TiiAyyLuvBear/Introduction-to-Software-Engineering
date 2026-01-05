import React, { useState } from 'react'

export default function Register({ onRegister, onNavigate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username) return
    if (password !== confirm) return alert('Passwords do not match')
    // In a real app, call API and handle errors. Here we simulate success and auto-login.
    onRegister({ username })
  }

  return (
    <div className="auth-page">
      <div className="form-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" className="form-control" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Create account</button>
          </div>
        </form>
        <div className="auth-footer">
          Already have an account? <button type="button" className="link-btn" onClick={() => onNavigate && onNavigate('login')}>Login</button>
        </div>
      </div>
    </div>
  )
}
