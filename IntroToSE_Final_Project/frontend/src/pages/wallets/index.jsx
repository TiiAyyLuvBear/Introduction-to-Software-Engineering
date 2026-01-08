import React from 'react'
import { useNavigate } from 'react-router-dom'

import * as walletService from '../../services/walletService.js'
import MoreMenu from '../../components/MoreMenu.jsx'
import { formatNumber } from '../../lib/format.js'
import { useToast } from '../../components/Toast.jsx'

// Exchange rates (1 unit = X VND)
const EXCHANGE_RATES = {
  VND: 1,
  USD: 25000,
  EUR: 27000,
  GBP: 31500,
  JPY: 167,
  KRW: 18.5,
  CNY: 3450,
  THB: 700,
  SGD: 18500,
  AUD: 16000,
}

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
  const toast = useToast()
  const me = getStoredUser()
  const myUserId = me?.id || me?._id || ''

  const [allWallets, setAllWallets] = React.useState([])
  const [status, setStatus] = React.useState('active')
  const [sortDir, setSortDir] = React.useState('asc')
  const [busyId, setBusyId] = React.useState(null)

  const [pendingInvites, setPendingInvites] = React.useState([])
  const [inviteBusyId, setInviteBusyId] = React.useState(null)

  const [deleteConfirmId, setDeleteConfirmId] = React.useState(null)
  const [removeMemberConfirm, setRemoveMemberConfirm] = React.useState(null)
  const [transferOwnerConfirm, setTransferOwnerConfirm] = React.useState(null)
  const [leaveWalletConfirm, setLeaveWalletConfirm] = React.useState(null)
  const [renameWalletId, setRenameWalletId] = React.useState(null)
  const [renameValue, setRenameValue] = React.useState('')

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
      toast.error(e?.response?.data?.error || e?.message || 'Failed to load wallets')
    }
  }, [toast])

  React.useEffect(() => {
    loadWallets(status)
  }, [loadWallets, status])

  React.useEffect(() => {
    loadPendingInvites()
  }, [loadPendingInvites])

  // Listen for wallet balance changes from transaction operations
  React.useEffect(() => {
    const handleBalanceChange = () => {
      loadWallets(status)
    }
    window.addEventListener('walletBalanceChanged', handleBalanceChange)
    return () => {
      window.removeEventListener('walletBalanceChanged', handleBalanceChange)
    }
  }, [loadWallets, status])

  const [query, setQuery] = React.useState('')
  const [displayCurrency, setDisplayCurrency] = React.useState('VND') // Toggle between VND and USD

  const wallets = allWallets
    .filter((w) => (query ? String(w.name || '').toLowerCase().includes(query.toLowerCase()) : true))
    .slice()
    .sort((a, b) => {
      const an = String(a?.name || '').toLowerCase()
      const bn = String(b?.name || '').toLowerCase()
      return sortDir === 'asc' ? an.localeCompare(bn) : bn.localeCompare(an)
    })

  // Calculate total net worth converted to display currency
  const totalInDisplayCurrency = React.useMemo(() => {
    let totalInVND = 0
    for (const w of wallets) {
      const balance = Number(w.balance ?? w.currentBalance ?? 0)
      const walletCurrency = w.currency || 'VND'
      const rateToVND = EXCHANGE_RATES[walletCurrency] || 1
      totalInVND += balance * rateToVND
    }
    // Convert from VND to display currency
    const displayRate = EXCHANGE_RATES[displayCurrency] || 1
    return totalInVND / displayRate
  }, [wallets, displayCurrency])

  const toggleDisplayCurrency = () => {
    setDisplayCurrency((prev) => (prev === 'VND' ? 'USD' : 'VND'))
  }

  const toggleStatus = () => {
    setStatus((prev) => (prev === 'active' ? 'inactive' : 'active'))
  }

  const toggleSort = () => {
    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const deleteWallet = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    setDeleteConfirmId(id)
  }

  const confirmDeleteWallet = async () => {
    const id = deleteConfirmId
    if (!id) return
    setBusyId(id)
    try {
      await walletService.deleteWallet(id)
      setAllWallets((prev) => prev.filter((w) => (w.id || w._id) !== id))
      setDeleteConfirmId(null)
      toast.success('Wallet deleted successfully')
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to delete wallet')
    } finally {
      setBusyId(null)
    }
  }

  const respondInvite = async (invitationId, response) => {
    if (!invitationId) return
    setInviteBusyId(invitationId)
    try {
      await walletService.respondToInvitation(invitationId, response)
      setPendingInvites((prev) => prev.filter((i) => i.id !== invitationId))
      await loadWallets(status)
      toast.success(response === 'accept' ? 'Invitation accepted' : 'Invitation declined')
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to respond to invitation')
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
    try {
      const info = await walletService.getWalletMembers(id)
      setMembersInfo(info)
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to load members')
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
    try {
      await walletService.sendInvitation(walletId, email)
      setInviteEmail('')
      await refreshMembers()
      await loadWallets(status)
      toast.success('Invitation sent successfully')
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to send invitation')
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
      toast.error(e?.response?.data?.error || e?.message || 'Failed to refresh members')
    } finally {
      setMembersBusy(false)
    }
  }

  const setPermission = async (memberId, permission) => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !memberId) return
    setBusyId(`${walletId}:${memberId}`)
    try {
      await walletService.setMemberPermission(walletId, memberId, permission)
      await refreshMembers()
      toast.success('Permission updated successfully')
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to update permission')
    } finally {
      setBusyId(null)
    }
  }

  const removeMember = async (memberId) => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !memberId) return
    setRemoveMemberConfirm(memberId)
  }

  const confirmRemoveMember = async () => {
    const memberId = removeMemberConfirm
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !memberId) return
    setBusyId(`${walletId}:rm:${memberId}`)
    try {
      await walletService.removeMember(walletId, memberId)
      await refreshMembers()
      await loadWallets(status)
      setRemoveMemberConfirm(null)
      toast.success('Member removed successfully')
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to remove member')
    } finally {
      setBusyId(null)
    }
  }

  const transferOwnership = async (newOwnerId) => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !newOwnerId) return
    setTransferOwnerConfirm(newOwnerId)
  }

  const confirmTransferOwnership = async () => {
    const newOwnerId = transferOwnerConfirm
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId || !newOwnerId) return
    setBusyId(`${walletId}:own:${newOwnerId}`)
    try {
      await walletService.transferOwnership(walletId, newOwnerId)
      await refreshMembers()
      await loadWallets(status)
      setTransferOwnerConfirm(null)
      toast.success('Ownership transferred successfully')
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to transfer ownership')
    } finally {
      setBusyId(null)
    }
  }

  const leaveCurrentWallet = async () => {
    const walletId = sharingWallet?.id || sharingWallet?._id
    if (!walletId) return
    setLeaveWalletConfirm(walletId)
  }

  const [ownerLeaveMembers, setOwnerLeaveMembers] = React.useState(null)
  const [selectedTransferMember, setSelectedTransferMember] = React.useState('')

  const confirmLeaveWallet = async () => {
    const walletId = leaveWalletConfirm
    if (!walletId) return
    setBusyId(`leave:${walletId}`)
    try {
      await walletService.leaveWallet(walletId)
      closeSharing()
      await loadWallets(status)
      setLeaveWalletConfirm(null)
      toast.success('Left wallet successfully')
    } catch (e) {
      const code = e?.response?.data?.code
      const eligible = e?.response?.data?.data?.eligibleMembers

      if (code === 'OWNER_CANNOT_LEAVE' && Array.isArray(eligible) && eligible.length) {
        // Show modal to select member to transfer ownership
        setOwnerLeaveMembers(eligible)
        setSelectedTransferMember(eligible[0]?.id || '')
        toast.warning('You must transfer ownership before leaving')
        setBusyId(null)
        return
      }
      toast.error(e?.response?.data?.error || e?.message || 'Failed to leave wallet')
    } finally {
      setBusyId(null)
    }
  }

  const confirmTransferAndLeave = async () => {
    const walletId = leaveWalletConfirm
    if (!walletId || !selectedTransferMember) return
    setBusyId(`leave:${walletId}`)
    try {
      await walletService.transferOwnership(walletId, selectedTransferMember)
      await walletService.leaveWallet(walletId)
      closeSharing()
      await loadWallets(status)
      setLeaveWalletConfirm(null)
      setOwnerLeaveMembers(null)
      setSelectedTransferMember('')
      toast.success('Ownership transferred and left wallet successfully')
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to transfer ownership and leave')
    } finally {
      setBusyId(null)
    }
  }

  const renameWallet = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    setRenameWalletId(id)
    setRenameValue(wallet.name || '')
  }

  const confirmRenameWallet = async () => {
    const id = renameWalletId
    if (!id || !renameValue.trim()) return
    setBusyId(id)
    try {
      await walletService.updateWallet(id, { name: renameValue.trim() })
      await loadWallets(status)
      setRenameWalletId(null)
      setRenameValue('')
      toast.success('Wallet renamed successfully')
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to rename wallet')
    } finally {
      setBusyId(null)
    }
  }

  const toggleWalletStatus = async (wallet) => {
    const id = wallet?.id || wallet?._id
    if (!id) return
    const newStatus = wallet.status === 'active' ? 'inactive' : 'active'
    setBusyId(id)
    try {
      await walletService.updateWallet(id, { status: newStatus })
      await loadWallets(status)
      toast.success(`Wallet ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to update wallet status')
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
                <button
                  type="button"
                  onClick={toggleDisplayCurrency}
                  className="ml-2 rounded-md border border-border-dark bg-surface-dark px-2 py-0.5 text-xs font-bold text-primary hover:bg-border-dark transition-colors"
                  title="Click to switch currency"
                >
                  {displayCurrency === 'VND' ? 'VND → USD' : 'USD → VND'}
                </button>
              </div>
              <div className="mt-2 text-4xl font-bold text-white">
                {formatNumber(totalInDisplayCurrency, { minimumFractionDigits: displayCurrency === 'VND' ? 0 : 2 })}
                <span className="ml-2 text-lg font-normal text-text-secondary">{displayCurrency}</span>
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                Rate: 1 USD = {formatNumber(EXCHANGE_RATES.USD, { minimumFractionDigits: 0 })} VND
              </div>
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

        {/* Delete Wallet Confirmation Modal */}
        {deleteConfirmId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border-dark bg-card-dark p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <span className="material-symbols-outlined">delete</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Delete Wallet</div>
                  <div className="text-sm text-text-secondary">This action cannot be undone</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-text-secondary">
                Are you sure you want to delete this wallet? All transactions associated with this wallet will also be deleted.
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={busyId === deleteConfirmId}
                  className="flex-1 h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteWallet}
                  disabled={busyId === deleteConfirmId}
                  className="flex-1 h-10 rounded-lg bg-red-500 px-4 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {busyId === deleteConfirmId ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Remove Member Confirmation Modal */}
        {removeMemberConfirm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border-dark bg-card-dark p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <span className="material-symbols-outlined">person_remove</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Remove Member</div>
                  <div className="text-sm text-text-secondary">Remove access to this wallet</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-text-secondary">
                Are you sure you want to remove this member from the wallet?
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRemoveMemberConfirm(null)}
                  disabled={busyId === `${sharingWallet?.id || sharingWallet?._id}:rm:${removeMemberConfirm}`}
                  className="flex-1 h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveMember}
                  disabled={busyId === `${sharingWallet?.id || sharingWallet?._id}:rm:${removeMemberConfirm}`}
                  className="flex-1 h-10 rounded-lg bg-red-500 px-4 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {busyId === `${sharingWallet?.id || sharingWallet?._id}:rm:${removeMemberConfirm}` ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Transfer Ownership Confirmation Modal */}
        {transferOwnerConfirm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border-dark bg-card-dark p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">swap_horiz</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Transfer Ownership</div>
                  <div className="text-sm text-text-secondary">Make this member the new owner</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-text-secondary">
                Are you sure you want to transfer ownership? You will become a regular member with edit permissions.
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTransferOwnerConfirm(null)}
                  disabled={busyId === `${sharingWallet?.id || sharingWallet?._id}:own:${transferOwnerConfirm}`}
                  className="flex-1 h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmTransferOwnership}
                  disabled={busyId === `${sharingWallet?.id || sharingWallet?._id}:own:${transferOwnerConfirm}`}
                  className="flex-1 h-10 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                >
                  {busyId === `${sharingWallet?.id || sharingWallet?._id}:own:${transferOwnerConfirm}` ? 'Transferring…' : 'Transfer'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Leave Wallet Confirmation Modal */}
        {leaveWalletConfirm && !ownerLeaveMembers ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border-dark bg-card-dark p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <span className="material-symbols-outlined">logout</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Leave Wallet</div>
                  <div className="text-sm text-text-secondary">Remove yourself from this wallet</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-text-secondary">
                Are you sure you want to leave this wallet? You will lose access to all transactions and data.
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setLeaveWalletConfirm(null)}
                  disabled={busyId === `leave:${leaveWalletConfirm}`}
                  className="flex-1 h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLeaveWallet}
                  disabled={busyId === `leave:${leaveWalletConfirm}`}
                  className="flex-1 h-10 rounded-lg bg-red-500 px-4 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {busyId === `leave:${leaveWalletConfirm}` ? 'Leaving…' : 'Leave'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Owner Leave - Transfer Ownership Modal */}
        {ownerLeaveMembers ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border-dark bg-card-dark p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">swap_horiz</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Transfer Ownership to Leave</div>
                  <div className="text-sm text-text-secondary">Select a new owner before leaving</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-text-secondary">
                As the owner, you must transfer ownership to another member before leaving the wallet.
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-white">Select new owner</label>
                <select
                  className="mt-2 h-12 w-full rounded-lg bg-surface-dark border border-border-dark px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={selectedTransferMember}
                  onChange={(e) => setSelectedTransferMember(e.target.value)}
                >
                  {ownerLeaveMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOwnerLeaveMembers(null)
                    setSelectedTransferMember('')
                    setLeaveWalletConfirm(null)
                  }}
                  disabled={busyId === `leave:${leaveWalletConfirm}`}
                  className="flex-1 h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmTransferAndLeave}
                  disabled={busyId === `leave:${leaveWalletConfirm}` || !selectedTransferMember}
                  className="flex-1 h-10 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                >
                  {busyId === `leave:${leaveWalletConfirm}` ? 'Processing…' : 'Transfer & Leave'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Rename Wallet Modal */}
        {renameWalletId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border-dark bg-card-dark p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">edit</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Rename Wallet</div>
                  <div className="text-sm text-text-secondary">Change the wallet name</div>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-white">Wallet name</label>
                <input
                  type="text"
                  className="mt-2 h-12 w-full rounded-lg bg-surface-dark border border-border-dark px-4 text-white placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="Enter wallet name"
                  autoFocus
                />
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRenameWalletId(null)
                    setRenameValue('')
                  }}
                  disabled={busyId === renameWalletId}
                  className="flex-1 h-10 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRenameWallet}
                  disabled={busyId === renameWalletId || !renameValue.trim()}
                  className="flex-1 h-10 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark hover:brightness-110 disabled:opacity-60"
                >
                  {busyId === renameWalletId ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
