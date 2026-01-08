import React from 'react'
import { getCurrentUser, updateUserProfile, uploadAvatar, getServerBaseUrl } from '../services/userService.js'
import { useToast } from '../components/Toast.jsx'


export default function Profile() {
  const [busy, setBusy] = React.useState(false)
  const [user, setUser] = React.useState(null)
  const toast = useToast()

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')

  const load = React.useCallback(async () => {
    try {
      const res = await getCurrentUser()
      const u = res?.user || res?.data?.user || res?.data || res
      setUser(u)
      setName(u?.name || '')
      setEmail(u?.email || '')
      setPhone(u?.phoneNumber || '')
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error(error?.message || 'Failed to load profile')
    }
  }, [toast])

  React.useEffect(() => {
    load().catch((e) => toast.error(e?.message || 'Failed to load profile'))
  }, [load, toast])

  const submit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    
    try {
      setBusy(true)
      const updates = {
        name: name.trim(),
        phoneNumber: phone.trim()
      }
      const res = await updateUserProfile(updates)
      const nextUser = res?.user || res?.data?.user || res?.data || res
      setUser(nextUser)
      
      // Update localStorage if exists
      const localUser = localStorage.getItem('ml_user')
      if (localUser) {
        const parsed = JSON.parse(localUser)
        localStorage.setItem('ml_user', JSON.stringify({ ...parsed, ...nextUser }))
      }
      
      toast.success('Profile updated successfully')
    } catch (err) {
      console.error('Failed to update profile:', err)
      toast.error(err?.message || 'Failed to update profile')
    } finally {
      setBusy(false)
    }
  }

  const onPickAvatar = async (file) => {
    if (!file) return
    
    try {
      setBusy(true)
      const res = await uploadAvatar(file)
      const nextUser = res?.user || res?.data?.user || res?.data || res
      setUser(nextUser)
      
      // Update localStorage if exists
      const localUser = localStorage.getItem('ml_user')
      if (localUser) {
        const parsed = JSON.parse(localUser)
        localStorage.setItem('ml_user', JSON.stringify({ ...parsed, ...nextUser }))
      }
      
      toast.success('Avatar updated successfully')
    } catch (err) {
      console.error('Failed to upload avatar:', err)
      toast.error(err?.message || 'Failed to upload avatar')
    } finally {
      setBusy(false)
    }
  }

  const avatarSrc = user?.avatarURL ? `${getServerBaseUrl()}${user.avatarURL}` : ''

  return (
    <main className="p-6 md:p-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Profile</h1>
        </div>

        <div className="mt-6 rounded-2xl border border-border-dark bg-card-dark p-6">
          <div className="flex items-center gap-4">
            <div className="size-16 overflow-hidden rounded-full border border-border-dark bg-surface-dark">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
              ) : null}
            </div>

            <div className="flex-1">
              <div className="text-sm text-text-secondary">Update your picture</div>
              <label className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-lg bg-border-dark/40 px-4 py-2 text-sm font-bold text-white hover:bg-border-dark/60">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => onPickAvatar(e.target.files?.[0] || null)}
                />
                Choose image
              </label>
              <div className="mt-2 text-xs text-text-secondary">Max 2MB. Cropped to 256×256.</div>
            </div>
          </div>

          <form className="mt-8 grid gap-4" onSubmit={submit} noValidate>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Name</span>
              <input
                className="h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter your name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Email</span>
              <input
                className="h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary opacity-60 cursor-not-allowed"
                value={email}
                type="email"
                placeholder="Email (read-only)"
                disabled
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Phone</span>
              <input
                className="h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="Enter your phone number"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="h-12 rounded-lg bg-primary text-background-dark font-bold hover:brightness-110 disabled:opacity-60 transition-all"
            >
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
