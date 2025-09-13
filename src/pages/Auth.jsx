
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('demo')
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const nav = useNavigate()
  const { t } = useTranslation()

  const handle = () => {
    if (mode === 'login') {
      const res = login(username, password)
      if (res.ok) nav('/dashboard')
      else setError(res.error)
    } else {
      const res = register(username, password)
      if (res.ok) nav('/dashboard')
      else setError(res.error)
    }
  }

  return (
    <div className="py-10 flex items-center justify-center">
      <div className="glass rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold">{mode==='login'?t('auth.login'):t('auth.register')}</h2>
        <p className="text-white/70 text-sm mt-1" dangerouslySetInnerHTML={{ __html: t('auth.demo') }} />
        <div className="space-y-3 mt-6">
          <label htmlFor="auth-username" className="sr-only">{t('auth.username')}</label>
          <input
            id="auth-username"
            placeholder={t('auth.username')}
            aria-label={t('auth.username')}
            value={username}
            onChange={e=>setUsername(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none"
          />
          <label htmlFor="auth-password" className="sr-only">{t('auth.password')}</label>
          <input
            id="auth-password"
            placeholder={t('auth.password')}
            aria-label={t('auth.password')}
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none"
          />
          {error && <div className="text-sm text-red-400">{error}</div>}
          <button onClick={handle} className="w-full px-4 py-2 rounded-2xl bg-blue hover:bg-blue-light">{mode==='login'?t('auth.login'):t('auth.createAccount')}</button>
          <button onClick={()=>{setMode(mode==='login'?'register':'login'); setError('')}} className="w-full px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20">
            {mode==='login'?t('auth.needAccount'):t('auth.haveAccount')}
          </button>
        </div>
      </div>
    </div>
  )
}
