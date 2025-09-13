
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Header() {
  const { user, logout, getProfile } = useAuth()
  const nav = useNavigate()
  const balance = user ? getProfile()?.balance ?? 0 : 0
  const { t, i18n } = useTranslation()

  return (
    <header className="sticky top-0 z-50 bg-black/30 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-claret">Royale</span><span className="text-blue-light">Raffles</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink to="/" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.home')}</NavLink>
          <NavLink to="/raffles" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.raffles')}</NavLink>
          <NavLink to="/community-vote" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.community')}</NavLink>
          <NavLink to="/hall-of-fame" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.hall')}</NavLink>
          {user && <NavLink to="/dashboard" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.account')}</NavLink>}
          {user?.isAdmin && <NavLink to="/admin" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.admin')}</NavLink>}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-white/80 text-sm hidden sm:block">{t('header.balance')}: <b className="text-blue-light">${balance.toFixed(2)}</b></span>
              <button onClick={()=>{logout(); nav('/')}} className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light transition">
                {t('header.logout')}
              </button>
            </>
          ) : (
            <Link to="/auth" className="px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light transition">{t('header.login')}</Link>
          )}
          <select
            value={i18n.language}
            onChange={(e)=>i18n.changeLanguage(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-xl px-2 py-1 text-sm"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </div>
      </div>
    </header>
  )
}
