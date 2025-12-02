import React, { useEffect, useState } from 'react'

export default function Accounts() {
  // current user (in a real app this comes from auth)
  const [currentUser] = useState(() => {
    return localStorage.getItem('currentUserEmail') || 'you@example.com'
  })

  const [wallets, setWallets] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', type: 'private', balance: '', currency: 'USD', icon: '🏦' })
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [memberError, setMemberError] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('wallets_demo')
    if (saved) {
      try { setWallets(JSON.parse(saved)) } catch (e) { setWallets([]) }
    } else {
      // seed a demo wallet
      const demo = [
        {
          id: 'w1',
          name: 'Personal Cash',
          type: 'private',
          balance: 500,
          currency: 'USD',
          icon: '💵',
          members: [{ email: 'you@example.com', role: 'owner' }]
        },
        {
          id: 'w2',
          name: 'Household',
          type: 'group',
          balance: 1200,
          currency: 'USD',
          icon: '🏠',
          members: [{ email: 'you@example.com', role: 'owner' }, { email: 'alice@example.com', role: 'edit' }, { email: 'bob@example.com', role: 'view' }]
        }
      ]
      setWallets(demo)
      localStorage.setItem('wallets_demo', JSON.stringify(demo))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('wallets_demo', JSON.stringify(wallets))
  }, [wallets])

  const totalBalance = wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0)

  const handleCreate = (e) => {
    e.preventDefault()
    const newWallet = {
      id: 'w_' + Date.now(),
      name: createForm.name || 'New Wallet',
      type: createForm.type,
      balance: parseFloat(createForm.balance) || 0,
      currency: createForm.currency,
      icon: createForm.icon || '🏦',
      members: [{ email: currentUser, role: 'owner' }]
    }
    setWallets(prev => [newWallet, ...prev])
    setCreateForm({ name: '', type: 'private', balance: '', currency: 'USD', icon: '🏦' })
    setShowCreate(false)
  }

  const openMembers = (wallet) => {
    setSelectedWallet(wallet)
    setInviteEmail('')
    setMemberError(null)
  }

  const closeMembers = () => setSelectedWallet(null)

  const inviteMember = () => {
    setMemberError(null)
    const email = (inviteEmail || '').trim().toLowerCase()
    if (!email) return setMemberError('Enter an email to invite')
    if (!/\S+@\S+\.\S+/.test(email)) return setMemberError('Enter a valid email')
    setWallets(prev => prev.map(w => {
      if (w.id !== selectedWallet.id) return w
      if (w.members.find(m => m.email === email)) return w
      return { ...w, members: [...w.members, { email, role: 'view' }] }
    }))
    setInviteEmail('')
  }

  const changeMemberRole = (walletId, memberEmail, role) => {
    setWallets(prev => prev.map(w => {
      if (w.id !== walletId) return w
      return { ...w, members: w.members.map(m => m.email === memberEmail ? { ...m, role } : m) }
    }))
  }

  const removeMember = (walletId, memberEmail) => {
    setWallets(prev => prev.map(w => {
      if (w.id !== walletId) return w
      return { ...w, members: w.members.filter(m => m.email !== memberEmail) }
    }))
    if (selectedWallet && selectedWallet.id === walletId) {
      setSelectedWallet(prev => ({ ...prev, members: prev.members.filter(m => m.email !== memberEmail) }))
    }
  }

  const leaveWallet = (walletId) => {
    const w = wallets.find(x => x.id === walletId)
    if (!w) return
    const me = currentUser
    const imOwner = w.members.find(m => m.email === me && m.role === 'owner')
    if (imOwner) {
      // owner cannot leave; suggest delete instead
      if (!confirm('You are the owner. Delete the wallet instead to remove yourself, or transfer ownership by adjusting members. Delete wallet?')) return
      // delete wallet
      setWallets(prev => prev.filter(x => x.id !== walletId))
      return
    }
    // remove member
    removeMember(walletId, me)
  }

  const deleteWallet = (walletId) => {
    if (!confirm('Delete this wallet? This action cannot be undone.')) return
    setWallets(prev => prev.filter(w => w.id !== walletId))
    if (selectedWallet && selectedWallet.id === walletId) setSelectedWallet(null)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Wallets</h2>
        <p>Create group or private wallets and manage members</p>
      </div>

      <div className="card" style={{marginBottom: '30px', maxWidth: '480px'}}>
        <div className="card-header">
          <span className="card-title">Total Balance</span>
          <span className="card-icon">💰</span>
        </div>
        <div className="card-amount balance">${totalBalance.toFixed(2)}</div>
        <div className="card-change">Across {wallets.length} wallets</div>
      </div>

      <button className="btn btn-primary" onClick={() => setShowCreate(true)}>➕ Create Wallet</button>

      <div style={{marginTop:20}} className="account-list">
        {wallets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏦</div>
            <h3>No wallets yet</h3>
            <p>Create a wallet to get started</p>
          </div>
        ) : (
          wallets.map(wallet => (
            <div key={wallet.id} className="account-item">
              <div className="account-info">
                <h4>
                  <span style={{marginRight: '10px', fontSize: '24px'}}>{wallet.icon}</span>
                  {wallet.name} {wallet.type === 'group' && <small style={{marginLeft:8, color:'#666'}}>(group)</small>}
                </h4>
                <p>{wallet.currency} • {wallet.members.length} members</p>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div className="account-balance" style={{color: wallet.balance >= 0 ? '#3498db' : '#e74c3c'}}>${(Number(wallet.balance) || 0).toFixed(2)}</div>
                <button className="btn" onClick={() => openMembers(wallet)}>👥 Members</button>
                <button className="btn btn-secondary" onClick={() => leaveWallet(wallet.id)}>↩️ Leave</button>
                <button className="btn btn-danger" onClick={() => deleteWallet(wallet.id)}>🗑️ Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Wallet</h3>
              <button className="close-btn" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Wallet Name</label>
                <input type="text" className="form-control" required value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control" value={createForm.type} onChange={e => setCreateForm({...createForm, type: e.target.value})}>
                  <option value="private">Private (only you)</option>
                  <option value="group">Group (invite members)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Initial Balance</label>
                <input type="number" className="form-control" value={createForm.balance} onChange={e => setCreateForm({...createForm, balance: e.target.value})} step="0.01" />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select className="form-control" value={createForm.currency} onChange={e => setCreateForm({...createForm, currency: e.target.value})}>
                  <option>USD</option>
                  <option>VND</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
              <div className="form-group">
                <label>Icon</label>
                <input type="text" className="form-control" value={createForm.icon} onChange={e => setCreateForm({...createForm, icon: e.target.value})} />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedWallet && (
        <div className="modal-overlay" onClick={closeMembers}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Members — {selectedWallet.name}</h3>
              <button className="close-btn" onClick={closeMembers}>×</button>
            </div>

            <div style={{marginBottom: 12}}>
              <label>Invite Member</label>
              <div style={{display:'flex', gap:8}}>
                <input className="form-control" placeholder="email@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                <button className="btn btn-primary" onClick={inviteMember}>Invite</button>
              </div>
              {memberError && <div className="msg error" style={{marginTop:8}}>{memberError}</div>}
            </div>

            <div>
              <h4>Members</h4>
              <ul style={{paddingLeft:0, listStyle:'none'}}>
                {selectedWallet.members.map(m => (
                  <li key={m.email} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee'}}>
                    <div>
                      <div style={{fontWeight:700}}>{m.email} {m.email === currentUser && <small style={{color:'#666'}}> (you)</small>}</div>
                      <div style={{color:'#666'}}>{m.role}</div>
                    </div>
                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                      <select value={m.role} onChange={e => changeMemberRole(selectedWallet.id, m.email, e.target.value)}>
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                        <option value="owner" disabled>Owner</option>
                      </select>
                      {m.email !== currentUser && selectedWallet.members.find(x => x.email === currentUser && x.role === 'owner') && (
                        <button className="btn btn-danger" onClick={() => removeMember(selectedWallet.id, m.email)}>Remove</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{marginTop:12}}>
              <button className="btn btn-secondary" onClick={() => { closeMembers(); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
