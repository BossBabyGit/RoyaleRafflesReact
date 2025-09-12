
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout, getProfile } = useAuth()
  const nav = useNavigate()
  const balance = user ? getProfile()?.balance ?? 0 : 0

  return (
    <header className="sticky top-0 z-50 bg-black/30 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-claret">Royale</span><span className="text-blue-light">Raffles</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink to="/" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>Home</NavLink>
          <NavLink to="/raffles" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>Raffles</NavLink>
          <NavLink to="/community-vote" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>Community Vote</NavLink>
          <NavLink to="/hall-of-fame" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>Hall of Fame</NavLink>
          {user && <NavLink to="/dashboard" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>My Account</NavLink>}
            {user?.isAdmin && <NavLink to="/admin" className={({isActive})=>isActive?'text-blue-light':'text-white/80 hover:text-white'}>Admin</NavLink>}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-white/80 text-sm hidden sm:block">Balance: <b className="text-blue-light">${balance.toFixed(2)}</b></span>
              <button onClick={()=>{logout(); nav('/')}} className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light transition">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light transition">Login</Link>
          )}
        </div>
      </div>
    </header>
  )
}
