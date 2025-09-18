
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../utils/currency'

export default function Header() {
  const { user, logout, getProfile, hasRole } = useAuth()
  const nav = useNavigate()
  const balance = user ? getProfile()?.balance ?? 0 : 0
  const { t, i18n } = useTranslation()

  return (
    <header className="sticky top-0 z-50 bg-black/30 backdrop-blur border-b border-white/10">
      <div className="bg-blue/10 border-b border-white/10 text-center text-xs text-white/70 py-1">
        Test Mode environment - payments and draws are for demonstration only.
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Royale Raffles" className="h-10 w-10 rounded-lg object-contain border border-white/10" />
            <span className="sr-only">Royale Raffles</span>
          </Link>
          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full border border-blue-light/50 text-xs text-blue-light/90 bg-blue-light/10">
            Test Mode
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm justify-center lg:justify-start">
          <NavLink to="/" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.home')}</NavLink>
          <NavLink to="/raffles" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.raffles')}</NavLink>
          <NavLink to="/how-it-works" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.howItWorks')}</NavLink>
          <NavLink to="/community-vote" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.community')}</NavLink>
          <NavLink to="/hall-of-fame" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.hall')}</NavLink>
          {user && <NavLink to="/dashboard" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.account')}</NavLink>}
            {hasRole('admin') && <NavLink to="/admin" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>{t('header.admin')}</NavLink>}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-white/80 text-sm hidden sm:block">{t('header.balance')}: <b className="text-blue-light">{formatCurrency(balance)}</b></span>
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
