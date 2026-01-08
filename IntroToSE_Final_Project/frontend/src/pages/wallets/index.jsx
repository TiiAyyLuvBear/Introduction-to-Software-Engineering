import React from 'react'
import { useNavigate } from 'react-router-dom'

import * as walletService from '../../services/walletService.js'
import MoreMenu from '../../components/MoreMenu.jsx'
import { formatNumber } from '../../lib/format.js'

function getStoredUser() {
  try {
    const userStr = localStorage.getItem('ml_user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

/**
 * Wallets Component - Wallet Management
 */
export default function Wallets() {
  const navigate = useNavigate()
  const me = getStoredUser()
  const myUserId = me?.id || me?._id || ''

  const [allWallets, setAllWallets] = React.useState([])
  const [status, setStatus] = React.useState('active')
  const [sortDir, setSortDir] = React.useState('asc')
  const [busyId, setBusyId] = React.useState(null)
  const [error, setError] = React.useState('')

  const [pendingInvites, setPendingInvites] = React.useState([])
  const [inviteBusyId, setInviteBusyId] = React.useState(null)

  const loadPendingInvites = React.useCallback(async () => {
    try {
      const list = await walletService.getPendingInvitations()
      setPendingInvites(Array.isArray(list) ? list : [])
    } catch {
      setPendingInvites([])
    }
  }, [])

  const loadWallets = React.useCallback(async (nextStatus) => {
    try {
      const wallets = await walletService.listWallets({ status: nextStatus })
      setAllWallets(Array.isArray(wallets) ? wallets : [])
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to load wallets')
    }
  }, [])

  React.useEffect(() => {
    loadWallets(status)
  }, [loadWallets, status])

  React.useEffect(() => {
    loadPendingInvites()
  }, [loadPendingInvites])

  const [query, setQuery] = React.useState('')
  const wallets = allWallets
    .filter((w) => (query ? String(w.name || '').toLowerCase().includes(query.toLowerCase()) : true))
    .slice()
    .sort((a, b) => {
      const an = String(a?.name || '').toLowerCase()
      const bn = String(b?.name || '').toLowerCase()
      return sortDir === 'asc' ? an.localeCompare(bn) : bn.localeCompare(an)
    })

  const total = wallets.reduce((s, w) => s + Number(w.balance ?? w.currentBalance ?? 0), 0)

  const toggleStatus = () => {
    setError('')
    setStatus((prev) => (prev === 'active' ? 'inactive' : 'active'))
  }

  const toggleSort = () => {
    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const deleteWallet = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    if (!window.confirm('Delete this wallet?')) return
    setBusyId(id)
    setError('')
    try {
      await walletService.deleteWallet(id)
      setAllWallets((prev) => prev.filter((w) => (w.id || w._id) !== id))
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to delete wallet')
    } finally {
      setBusyId(null)
    }
  }

  const respondInvite = async (invitationId, response) => {
    if (!invitationId) return
    setInviteBusyId(invitationId)
    setError('')
    try {
      await walletService.respondToInvitation(invitationId, response)
      setPendingInvites((prev) => prev.filter((i) => i.id !== invitationId))
      await loadWallets(status)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to respond to invitation')
    } finally {
      setInviteBusyId(null)
    }
  }

  const [sharingWalletId, setSharingWalletId] = React.useState('')
  const sharingWallet = React.useMemo(
    () => allWallets.find((w) => String(w.id || w._id) === String(sharingWalletId)) || null,
    [allWallets, sharingWalletId]
  )
  const [membersInfo, setMembersInfo] = React.useState(null)
  const [membersBusy, setMembersBusy] = React.useState(false)

  const openSharing = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    setSharingWalletId(id)
    setMembersInfo(null)
    setMembersBusy(true)
    setError('')
    try {
      const info = await walletService.getWalletMembers(id)
      setMembersInfo(info)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to load members')
      setMembersInfo(null)
    } finally {
      setMembersBusy(false)
    }
  }

  const closeSharing = () => {
    setSharingWalletId('')
    setMembersInfo(null)
    setMembersBusy(false)
  }

  const [inviteEmail, setInviteEmail] = React.useState('')
  const sendInvite = async () => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId) return
    const email = String(inviteEmail || '').trim()
    if (!email) return
    setBusyId(walletId)
    setError('')
    try {
      await walletService.sendInvitation(walletId, email)
      setInviteEmail('')
      await refreshMembers()
      await loadWallets(status)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to send invitation')
    } finally {
      setBusyId(null)
    }
  }

  const refreshMembers = async () => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId) return
    setMembersBusy(true)
    try {
      const info = await walletService.getWalletMembers(walletId)
      setMembersInfo(info)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to refresh members')
    } finally {
      setMembersBusy(false)
    }
  }

  const setPermission = async (memberId, permission) => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !memberId) return
    setBusyId(`${walletId}:${memberId}`)
    setError('')
    try {
      await walletService.setMemberPermission(walletId, memberId, permission)
      await refreshMembers()
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to update permission')
    } finally {
      setBusyId(null)
    }
  }

  const removeMember = async (memberId) => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !memberId) return
    if (!window.confirm('Remove this member from the wallet?')) return
    setBusyId(`${walletId}:rm:${memberId}`)
    setError('')
    try {
      await walletService.removeMember(walletId, memberId)
      await refreshMembers()
      await loadWallets(status)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to remove member')
    } finally {
      setBusyId(null)
    }
  }

  const transferOwnership = async (newOwnerId) => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !newOwnerId) return
    if (!window.confirm('Transfer ownership to this member?')) return
    setBusyId(`${walletId}:own:${newOwnerId}`)
    setError('')
    try {
      await walletService.transferOwnership(walletId, newOwnerId)
      await refreshMembers()
      await loadWallets(status)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to transfer ownership')
    } finally {
      setBusyId(null)
    }
  }

  const leaveCurrentWallet = async () => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId) return
    if (!window.confirm('Leave this wallet?')) return
    setBusyId(`leave:${walletId}`)
    setError('')
    try {
      await walletService.leaveWallet(walletId)
      closeSharing()
      await loadWallets(status)
    } catch (e) {
      const code = e?.response?.data?.code
      const eligible = e?.response?.data?.data?.eligibleMembers
      
      if (code === 'OWNER_CANNOT_LEAVE' && Array.isArray(eligible) && eligible.length) {
        // Show list of members to transfer ownership to
        const memberList = eligible.map((m, i) => `${i + 1}. ${m.name || 'Unknown'} (${m.email || 'Unknown'})`).join('\n')
        const input = window.prompt(
          `You are the owner. Enter the NUMBER of the member to transfer ownership:\n\n${memberList}`,
          '1'
        )
        if (!input) {
          setBusyId(null)
          return
        }
        
        const index = parseInt(input, 10) - 1
        const picked = eligible[index]
        
        if (!picked || !picked.id) {
          setError('Invalid selection. Please try again.')
          setBusyId(null)
          return
        }
        
        try {
          await walletService.transferOwnership(walletId, picked.id)
          await walletService.leaveWallet(walletId)
          closeSharing()
          await loadWallets(status)
        } catch (transferErr) {
          setError(transferErr?.response?.data?.error || 'Failed to transfer ownership')
        }
        setBusyId(null)
        return
      }
      setError(e?.response?.data?.error || e?.message || 'Failed to leave wallet')
    } finally {
      setBusyId(null)
    }
  }

  const renameWallet = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    const newName = window.prompt('Enter new wallet name:', wallet.name)
    if (!newName || newName.trim() === wallet.name) return
    setBusyId(id)
    setError('')
    try {
      await walletService.updateWallet(id, { name: newName.trim() })
      await loadWallets(status)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to rename wallet')
    } finally {
      setBusyId(null)
    }
  }

  const toggleWalletStatus = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    const newStatus = wallet.status === 'active' ? 'inactive' : 'active'
    setBusyId(id)
    setError('')
    try {
      await walletService.updateWallet(id, { status: newStatus })
      await loadWallets(status)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to update wallet status')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Wallets</h1>
            <p className="text-text-secondary">Manage your personal and shared wallets</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/wallets/new')}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark hover:brightness-110"
          >
            Create Wallet
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-xl border border-border-dark bg-gradient-to-br from-[#1c2b22] to-[#111813] p-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <div className="text-sm font-medium text-text-secondary flex items-center gap-2">
                Total Net Worth
                <span className="material-symbols-outlined text-[16px] text-text-secondary">visibility</span>
              </div>
              <div className="mt-2 text-4xl font-bold text-white">{formatNumber(total, { minimumFractionDigits: 2 })}</div>
              <div className="mt-2 text-xs text-text-secondary">Updated just now</div>
            </div>
          </div>
          <div className="rounded-xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-border-dark text-primary">
                <span className="material-symbols-outlined">savings</span>
              </div>
              <div className="text-white font-bold">Total Wallets</div>
            </div>
            <div className="mt-3 text-2xl font-bold text-white">{wallets.length}</div>
            <div className="mt-1 text-xs text-text-secondary">{status === 'active' ? 'Active' : 'Inactive'}</div>
          </div>
        </div>

        {pendingInvites.length ? (
          <div className="mt-6 rounded-2xl border border-border-dark bg-card-dark p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-white">Pending invitations</div>
                <div className="text-sm text-text-secondary">Accept or decline shared wallet invitations.</div>
              </div>
              <button
                type="button"
                onClick={loadPendingInvites}
                className="h-10 rounded-lg border border-border-dark bg-surface-dark px-4 text-sm font-semibold text-white hover:bg-border-dark"
              >
                Refresh
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="rounded-xl border border-border-dark bg-surface-dark p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="text-white font-bold">{inv.wallet?.name}</div>
                      <div className="mt-1 text-xs text-text-secondary">
                        From {inv.inviter?.name} ({inv.inviter?.email})
                      </div>
                      {inv.message ? <div className="mt-1 text-sm text-text-secondary">"{inv.message}"</div> : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={inviteBusyId === inv.id}
                        onClick={() => respondInvite(inv.id, 'decline')}
                        className="h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={inviteBusyId === inv.id}
                        onClick={() => respondInvite(inv.id, 'accept')}
                        className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {sharingWallet ? (
          <div className="mt-6 rounded-2xl border border-border-dark bg-card-dark p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-white">Wallet sharing</div>
                <div className="text-sm text-text-secondary">
                  {sharingWallet.name} • {sharingWallet.isShared ? 'Shared' : 'Personal'} • Your permission:{' '}
                  {sharingWallet.myPermission || '—'}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={refreshMembers}
                  disabled={membersBusy}
                  className="h-10 rounded-lg border border-border-dark bg-surface-dark px-4 text-sm font-semibold text-white hover:bg-border-dark disabled:opacity-60"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={closeSharing}
                  className="h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            {sharingWallet.myPermission === 'owner' ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  className="h-10 rounded-lg bg-surface-dark border border-border-dark px-4 text-white placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Invite member by email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button
                  type="button"
                  disabled={busyId === (sharingWallet.id || sharingWallet._id)}
                  onClick={sendInvite}
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                >
                  Send invite
                </button>
              </div>
            ) : null}

            <div className="mt-4">
              {membersBusy ? <div className="text-sm text-text-secondary">Loading members…</div> : null}
              {!membersBusy && membersInfo?.owner ? (
                <div className="grid gap-2">
                  <div className="text-sm font-bold text-white">Owner</div>
                  <div className="rounded-xl border border-border-dark bg-surface-dark p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">{membersInfo.owner.name}</div>
                      <div className="text-xs text-text-secondary">{membersInfo.owner.email}</div>
                    </div>
                    <div className="text-xs text-text-secondary">owner</div>
                  </div>

                  <div className="mt-2 text-sm font-bold text-white">Members</div>
                  {Array.isArray(membersInfo.members) && membersInfo.members.length ? (
                    membersInfo.members
                      .filter((m) => String(m.id) !== String(membersInfo.owner?.id))
                      .map((m) => {
                      const isSelf = myUserId && String(m.id) === String(myUserId)
                      const canOwnerManage = sharingWallet.myPermission === 'owner' && String(m.id) !== String(membersInfo.owner?.id)
                      return (
                        <div
                          key={m.id}
                          className="rounded-xl border border-border-dark bg-surface-dark p-3 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-white font-semibold">
                              {m.name} {isSelf ? <span className="text-xs text-text-secondary">(you)</span> : null}
                            </div>
                            <div className="text-xs text-text-secondary">{m.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-text-secondary">{m.permission}</div>
                            {canOwnerManage ? (
                              <MoreMenu
                                ariaLabel="Member options"
                                buttonClassName="text-text-secondary hover:text-white disabled:opacity-60"
                                items={[
                                  {
                                    label: 'Set View',
                                    icon: 'visibility',
                                    disabled: busyId === `${sharingWallet.id || sharingWallet._id}:${m.id}`,
                                    onClick: () => setPermission(m.id, 'view'),
                                  },
                                  {
                                    label: 'Set Edit',
                                    icon: 'edit',
                                    disabled: busyId === `${sharingWallet.id || sharingWallet._id}:${m.id}`,
                                    onClick: () => setPermission(m.id, 'edit'),
                                  },
                                  {
                                    label: 'Make Owner',
                                    icon: 'swap_horiz',
                                    disabled: busyId === `${sharingWallet.id || sharingWallet._id}:own:${m.id}`,
                                    onClick: () => transferOwnership(m.id),
                                  },
                                  {
                                    label: 'Remove',
                                    icon: 'person_remove',
                                    disabled: busyId === `${sharingWallet.id || sharingWallet._id}:rm:${m.id}`,
                                    onClick: () => removeMember(m.id),
                                  },
                                ]}
                              />
                            ) : null}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="rounded-xl border border-border-dark bg-surface-dark p-3 text-sm text-text-secondary">
                      No members.
                    </div>
                  )}

                  {sharingWallet.isShared ? (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={leaveCurrentWallet}
                        disabled={busyId === `leave:${sharingWallet.id || sharingWallet._id}`}
                        className="h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                      >
                        Leave wallet
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-8">
          {error ? (
            <div className="col-span-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          {wallets.map((w) => (
            <div
              key={w.id || w._id}
              className="group relative cursor-pointer rounded-xl border border-border-dark bg-[#1c2b22] p-5 transition-all hover:border-primary/50 hover:bg-[#223329]"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-lg bg-border-dark text-white">
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                    {w.icon || 'account_balance_wallet'}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100">
                  <MoreMenu
                    ariaLabel="Wallet options"
                    buttonClassName="text-text-secondary hover:text-white disabled:opacity-60"
                    items={[
                      {
                        label: 'Sharing & members',
                        icon: 'group',
                        disabled: busyId === (w.id || w._id),
                        onClick: () => openSharing(w),
                      },
                      { label: 'Rename', icon: 'edit', disabled: busyId === (w.id || w._id), onClick: () => renameWallet(w) },
                      {
                        label: w?.status === 'inactive' ? 'Set Active' : 'Set Inactive',
                        icon: 'toggle_on',
                        disabled: busyId === (w.id || w._id),
                        onClick: () => toggleWalletStatus(w),
                      },
                      { label: 'Delete', icon: 'delete', disabled: busyId === (w.id || w._id), onClick: () => deleteWallet(w) },
                    ]}
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className="text-white text-lg font-bold">{w.name}</div>
                  {w.isShared ? (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">Shared</span>
                  ) : null}
                  {w.myPermission && w.myPermission !== 'owner' ? (
                    <span className="rounded-full bg-border-dark px-2 py-0.5 text-[10px] font-bold text-text-secondary">
                      {w.myPermission}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs text-text-secondary">{w.type || 'Wallet'}</div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-border-dark pt-4">
                <div>
                  <div className="text-xs text-text-secondary">Balance</div>
                  <div className="mt-1 text-xl font-bold text-white">
                    {formatNumber(Number(w.balance ?? w.currentBalance ?? 0), { minimumFractionDigits: 2 })}
                    <span className="ml-1 text-sm font-normal text-text-secondary">{w.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {wallets.length === 0 && (
            <div className="col-span-full rounded-xl border border-border-dark bg-card-dark p-6 text-text-secondary">
              No wallets found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
