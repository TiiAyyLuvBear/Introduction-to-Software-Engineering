import React from 'react'
import { updateUserProfile, uploadAvatar } from '../../../services/userService.js'
import { useToast } from '../../../components/Toast.jsx'

export default function EditProfile({ user, onSuccess, onCancel }) {
    const toast = useToast()
    const [busy, setBusy] = React.useState(false)
    const [name, setName] = React.useState(user?.name || '')
    const [phone, setPhone] = React.useState(user?.phoneNumber || '')
    const [avatarURL, setAvatarURL] = React.useState(user?.avatarURL || '')

    const onPickAvatar = async (file) => {
        if (!file) return

        // Validate file size (2MB max)
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error('File size must be less than 2MB')
            return
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only image files are allowed (JPG, PNG, GIF, WebP)')
            return
        }

        try {
            setBusy(true)
            const res = await uploadAvatar(file)

            // Backend returns { data: { avatarURL: base64String } }
            const newAvatarURL = res?.data?.avatarURL || res?.avatarURL

            if (newAvatarURL) {
                setAvatarURL(newAvatarURL)
                toast.success('Avatar uploaded! Click "Save changes" to update your profile.')
            } else {
                toast.error('Failed to get avatar URL from response')
            }
        } catch (err) {
            console.error('Failed to upload avatar:', err)
            toast.error(err?.message || 'Failed to upload avatar')
        } finally {
            setBusy(false)
        }
    }

    const submit = async (e) => {
        e.preventDefault()

        if (!name.trim()) {
            toast.error('Please enter your name')
            return
        }

        try {
            setBusy(true)
            const updates = {
                name: name.trim(),
                phoneNumber: phone.trim(),
                avatarURL: avatarURL
            }
            const res = await updateUserProfile(updates)
            const nextUser = res?.user || res?.data?.user || res?.data || res

            localStorage.setItem('ml_user', JSON.stringify(nextUser))

            toast.success('Profile updated successfully')
            if (onSuccess) onSuccess(nextUser)
        } catch (err) {
            console.error('Failed to update profile:', err)
            toast.error(err?.message || 'Failed to update profile')
        } finally {
            setBusy(false)
        }
    }

    const inputClass = 'h-12 w-full rounded-lg bg-surface-dark border border-input-border px-4 text-white placeholder:text-text-secondary/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary'

    return (
        <div className="rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-dark">
                <h3 className="text-lg font-bold text-white">Edit Profile</h3>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm font-semibold text-text-secondary hover:text-white"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <form className="mt-6 grid gap-4" onSubmit={submit} noValidate>
                <div className="flex items-center gap-4">
                    <div className="size-16 overflow-hidden rounded-full border border-border-dark bg-surface-dark">
                        {avatarURL ? (
                            <img
                                src={avatarURL.startsWith('data:') ? avatarURL : `http://localhost:4000${avatarURL}`}
                                alt="Avatar"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-white">
                                {name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
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

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white">Name</span>
                    <input
                        className={inputClass}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        placeholder="Enter your name"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white">Email</span>
                    <input
                        className={`${inputClass} opacity-60 cursor-not-allowed`}
                        value={user?.email || ''}
                        type="email"
                        placeholder="Email (read-only)"
                        disabled
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white">Phone</span>
                    <input
                        className={inputClass}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                        placeholder="Enter your phone number"
                    />
                </label>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={busy}
                        className="flex-1 h-12 rounded-lg bg-primary text-background-dark font-bold hover:brightness-110 disabled:opacity-60 transition-all"
                    >
                        {busy ? 'Saving…' : 'Save changes'}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-lg border border-border-dark bg-transparent px-5 py-2 text-sm font-semibold text-text-secondary hover:bg-border-dark hover:text-white"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
