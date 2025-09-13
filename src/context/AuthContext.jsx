
import { createContext, useContext, useEffect, useState } from 'react'

const AuthCtx = createContext(null)

const DEMO_USER = {
  username: 'demo',
  password: 'demo',
  balance: 500,
  entries: {}, // { raffleId: numberOfTickets }
  wins: [],
  history: [], // ended raffles entered
  deposits: [],
  favorites: [],
}

function loadUsers() {
  const raw = localStorage.getItem('rr_users')
  let users = raw ? JSON.parse(raw) : {}

  if (!users['demo']) {
    users['demo'] = DEMO_USER
    users['admin'] = { username:'admin', password:'admin', balance: 10000, entries:{}, wins:[], history:[], deposits:[], favorites:[], isAdmin:true }
    users['alice'] = { username:'alice', password:'alice', balance: 800, entries:{}, wins:[], history:[], deposits:[], favorites:[], isAdmin:false }
    users['bob'] = { username:'bob', password:'bob', balance: 600, entries:{}, wins:[], history:[], deposits:[], favorites:[], isAdmin:false }
    users['charlie'] = { username:'charlie', password:'charlie', balance: 900, entries:{}, wins:[], history:[], deposits:[], favorites:[], isAdmin:false }
    localStorage.setItem('rr_users', JSON.stringify(users))
  }

  // ensure deposits & favorites arrays exist for all users
  let changed = false
  Object.values(users).forEach(u => {
    if (!u.deposits) {
      u.deposits = []
      changed = true
    }
    if (!u.favorites) {
      u.favorites = []
      changed = true
    }
  })
  if (changed) localStorage.setItem('rr_users', JSON.stringify(users))
  return users
}

function saveUsers(users) {
  localStorage.setItem('rr_users', JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const session = sessionStorage.getItem('rr_user')
    if (session) setUser(JSON.parse(session))
    else setUser(null)
  }, [])

  const login = (username, password) => {
    const users = loadUsers()
    const u = users[username]
    if (u && u.password === password) {
      sessionStorage.setItem('rr_user', JSON.stringify({ username, isAdmin: !!u.isAdmin }))
      setUser({ username, isAdmin: !!u.isAdmin })
      return { ok: true }
    }
    return { ok: false, error: 'Invalid credentials' }
  }

  const register = (username, password) => {
    const users = loadUsers()
    if (users[username]) {
      return { ok: false, error: 'Username already exists' }
    }
    const newUser = {
      username,
      password,
      balance: 100,
      entries: {},
      wins: [],
      history: [],
      deposits: [],
      favorites: [],
      isAdmin: false,
    }
    users[username] = newUser
    saveUsers(users)
    sessionStorage.setItem(
      'rr_user',
      JSON.stringify({ username, isAdmin: !!newUser.isAdmin })
    )
    setUser({ username, isAdmin: !!newUser.isAdmin })
    return { ok: true }
  }

  const logout = () => {
    sessionStorage.removeItem('rr_user')
    setUser(null)
  }

  const getAllUsers = () => Object.values(loadUsers())

    const getProfile = () => {
    if (!user) return null
    const users = loadUsers()
    return users[user.username]
  }

  const updateProfile = (updater) => {
    if (!user) return
    const users = loadUsers()
    users[user.username] = updater(users[user.username])
    saveUsers(users)
    setUser(u => (u ? { ...u } : null))
  }

  const toggleFavorite = (raffleId) => {
    if (!user) return
    updateProfile(u => {
      const favs = new Set(u.favorites || [])
      if (favs.has(raffleId)) favs.delete(raffleId)
      else favs.add(raffleId)
      return { ...u, favorites: Array.from(favs) }
    })
  }

  const isFavorite = (raffleId) => {
    const prof = getProfile()
    return prof?.favorites?.includes(raffleId)
  }

  return (
    <AuthCtx.Provider value={{ user, login, register, logout, getProfile, updateProfile, getAllUsers, toggleFavorite, isFavorite }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
