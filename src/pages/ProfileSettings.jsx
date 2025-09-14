import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProfileSettings() {
  const { getProfile, updateAvatar, updateEmail, updatePassword } = useAuth()
  const profile = getProfile()
  const [avatar, setAvatar] = useState(profile.avatar || '')
  const [email, setEmail] = useState(profile.email || '')
  const [password, setPassword] = useState(profile.password || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    updateAvatar(avatar)
    updateEmail(email)
    updatePassword(password)
  }

  return (
    <div className="py-8 flex justify-center">
      <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl space-y-4 w-full max-w-md">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <div>
          <label htmlFor="avatar" className="block text-sm mb-1">Avatar URL</label>
          <input
            id="avatar"
            value={avatar}
            onChange={e => setAvatar(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
          />
        </div>
        <button type="submit" className="px-4 py-2 rounded-xl bg-blue hover:bg-blue-light w-full">Save</button>
      </form>
    </div>
  )
}

