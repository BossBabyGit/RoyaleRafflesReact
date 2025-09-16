
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

export default function Header() {
  const { user, logout, getProfile, hasRole } = useAuth()
  const nav = useNavigate()
  const balance = user ? getProfile()?.balance ?? 0 : 0
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)

  const NavItems = ({ mobile = false }) => (
    <>
      <NavLink
        to="/"
        onClick={handleClose}
        className={({ isActive }) =>
          isActive
            ? 'text-blue-light'
            : mobile
              ? 'block text-white/80 hover:text-white'
              : 'text-white/80 hover:text-white'
        }
      >
        {t('header.home')}
      </NavLink>
      <NavLink
        to="/raffles"
        onClick={handleClose}
        className={({ isActive }) =>
          isActive
            ? 'text-blue-light'
            : mobile
              ? 'block text-white/80 hover:text-white'
              : 'text-white/80 hover:text-white'
        }
      >
        {t('header.raffles')}
      </NavLink>
      <NavLink
        to="/community-vote"
        onClick={handleClose}
        className={({ isActive }) =>
          isActive
            ? 'text-blue-light'
            : mobile
              ? 'block text-white/80 hover:text-white'
              : 'text-white/80 hover:text-white'
        }
      >
        {t('header.community')}
      </NavLink>
      <NavLink
        to="/hall-of-fame"
        onClick={handleClose}
        className={({ isActive }) =>
          isActive
            ? 'text-blue-light'
            : mobile
              ? 'block text-white/80 hover:text-white'
              : 'text-white/80 hover:text-white'
        }
      >
        {t('header.hall')}
      </NavLink>
      {user && (
        <NavLink
          to="/dashboard"
          onClick={handleClose}
          className={({ isActive }) =>
            isActive
              ? 'text-blue-light'
              : mobile
                ? 'block text-white/80 hover:text-white'
                : 'text-white/80 hover:text-white'
          }
        >
          {t('header.account')}
        </NavLink>
      )}
      {hasRole('admin') && (
        <NavLink
          to="/admin"
          onClick={handleClose}
          className={({ isActive }) =>
            isActive
              ? 'text-blue-light'
              : mobile
                ? 'block text-white/80 hover:text-white'
                : 'text-white/80 hover:text-white'
          }
        >
          {t('header.admin')}
        </NavLink>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-50 bg-black/30 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-claret">Royale</span>
          <span className="text-blue-light">Raffles</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <NavItems />
        </nav>
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-white/80 text-sm">
                {t('header.balance')}: <b className="text-blue-light">${balance.toFixed(2)}</b>
              </span>
              <button
                onClick={() => {
                  logout()
                  nav('/')
                }}
                className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light transition"
              >
                {t('header.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light transition"
            >
              {t('header.login')}
            </Link>
          )}
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-xl px-2 py-1 text-sm"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </div>
        <button
          className="sm:hidden p-2 rounded-lg border border-white/10"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? '×' : '☰'}
        </button>
      </div>
      {open && (
        <div className="sm:hidden border-t border-white/10 bg-black/90 backdrop-blur px-4 pb-6">
          <nav className="flex flex-col gap-4 py-4 text-sm">
            <NavItems mobile />
            <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
              {user ? (
                <>
                  <span className="text-white/80 text-sm">
                    {t('header.balance')}: <b className="text-blue-light">${balance.toFixed(2)}</b>
                  </span>
                  <button
                    onClick={() => {
                      logout()
                      nav('/')
                      handleClose()
                    }}
                    className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light transition"
                  >
                    {t('header.logout')}
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={handleClose}
                  className="px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light transition text-center"
                >
                  {t('header.login')}
                </Link>
              )}
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl px-2 py-1 text-sm"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
