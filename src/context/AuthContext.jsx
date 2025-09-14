
import { createContext, useContext, useEffect, useState } from 'react'
import { useAudit } from './AuditContext'

function getWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return d.getUTCFullYear() * 100 + weekNo
}

const AuthCtx = createContext(null)

const DEMO_USER = {
  username: 'demo',
  password: 'demo',
  balance: 500,
  entries: {}, // { raffleId: numberOfTickets }
  wins: [],
  history: [], // ended raffles entered
  deposits: [],
  freeEntries: {},
  xp: 0,
  dailyStreak: 0,
  weeklyStreak: 0,
  lastLogin: null,
  lastWeek: null,
  avatar: '',
  email: '',
  roles: [],
}

function loadUsers() {
  const raw = localStorage.getItem('rr_users')
  let users = raw ? JSON.parse(raw) : {}

  if (!users['demo']) {
    users['demo'] = DEMO_USER
    users['admin'] = { username:'admin', password:'admin', balance: 10000, entries:{}, wins:[], history:[], deposits:[], freeEntries:{}, roles:['admin'], avatar:'', email:'' }
    users['alice'] = { username:'alice', password:'alice', balance: 800, entries:{}, wins:[], history:[], deposits:[], freeEntries:{}, roles:[], avatar:'', email:'' }
    users['bob'] = { username:'bob', password:'bob', balance: 600, entries:{}, wins:[], history:[], deposits:[], freeEntries:{}, roles:[], avatar:'', email:'' }
    users['charlie'] = { username:'charlie', password:'charlie', balance: 900, entries:{}, wins:[], history:[], deposits:[], freeEntries:{}, roles:[], avatar:'', email:'' }
    localStorage.setItem('rr_users', JSON.stringify(users))
  }

  // ensure required fields exist for all users
  let changed = false
  Object.values(users).forEach(u => {
    if (!u.deposits) {
      u.deposits = []
      changed = true
    }
    if (!u.freeEntries) {
      u.freeEntries = {}
      changed = true
    }
    if (u.xp === undefined) {
      u.xp = 0
      changed = true
    }
    if (u.dailyStreak === undefined) {
      u.dailyStreak = 0
      changed = true
    }
    if (u.weeklyStreak === undefined) {
      u.weeklyStreak = 0
      changed = true
    }
    if (u.lastLogin === undefined) {
      u.lastLogin = null
      changed = true
    }
    if (u.lastWeek === undefined) {
      u.lastWeek = null
      changed = true
    }
    if (u.avatar === undefined) {
      u.avatar = ''
      changed = true
    }
    if (u.email === undefined) {
      u.email = ''
      changed = true
    }
    if (!u.roles) {
      u.roles = []
      if (u.isAdmin) u.roles.push('admin')
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
  const { log: audit } = useAudit()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const session = sessionStorage.getItem('rr_user')
    if (session) {
      const data = JSON.parse(session)
      if (data.isAdmin !== undefined && !data.roles) {
        data.roles = data.isAdmin ? ['admin'] : []
        delete data.isAdmin
        sessionStorage.setItem('rr_user', JSON.stringify(data))
      }
      setUser(data)
    } else setUser(null)
  }, [])

  const login = (username, password) => {
    const users = loadUsers()
    const u = users[username]
    if (u && u.password === password) {
      const today = new Date()
      const dayKey = today.toDateString()
      if (u.lastLogin !== dayKey) {
        const prev = u.lastLogin ? new Date(u.lastLogin) : null
        const diff = prev ? Math.floor((today - prev) / 86400000) : null
        u.dailyStreak = diff === 1 ? (u.dailyStreak || 0) + 1 : 1
        u.lastLogin = dayKey
      }
      const wKey = getWeekKey(today)
      if (u.lastWeek !== wKey) {
        const diffW = u.lastWeek ? wKey - u.lastWeek : null
        u.weeklyStreak = diffW === 1 ? (u.weeklyStreak || 0) + 1 : 1
        u.lastWeek = wKey
      }
      users[username] = u
      saveUsers(users)
      const roles = u.roles || []
      sessionStorage.setItem('rr_user', JSON.stringify({ username, roles }))
      setUser({ username, roles })
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
      freeEntries: {},
      roles: [],
      xp: 0,
      dailyStreak: 0,
      weeklyStreak: 0,
      lastLogin: null,
      lastWeek: null,
      avatar: '',
      email: '',
    }
    users[username] = newUser
    saveUsers(users)
    sessionStorage.setItem(
      'rr_user',
      JSON.stringify({ username, roles: newUser.roles })
    )
    setUser({ username, roles: newUser.roles })
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
  }

  const addHistory = (raffleId, title, count) => {
    updateProfile(u => ({
      ...u,
      history: [
        ...(u.history || []),
        { id: Date.now(), raffleId, title, count, date: new Date().toISOString() }
      ]
    }))
  }

  const updateUser = (username, updates) => {
    const users = loadUsers()
    if (!users[username]) return
    users[username] = { ...users[username], ...updates }
    saveUsers(users)
    if (user && user.username === username) {
      const roles = users[username].roles || []
      sessionStorage.setItem('rr_user', JSON.stringify({ username, roles }))
      setUser({ username, roles })
    }
    audit({ type: 'update_user', target: username, user: user?.username })
  }

  const toggleAdmin = (username) => {
    const users = loadUsers()
    if (!users[username]) return
    const roles = users[username].roles || []
    if (roles.includes('admin')) {
      users[username].roles = roles.filter(r => r !== 'admin')
    } else {
      users[username].roles = [...roles, 'admin']
    }
    saveUsers(users)
    if (user && user.username === username) {
      const newRoles = users[username].roles || []
      sessionStorage.setItem('rr_user', JSON.stringify({ username, roles: newRoles }))
      setUser({ username, roles: newRoles })
    }
    audit({ type: 'toggle_admin', target: username, user: user?.username })
  }

  const deleteUser = (username) => {
    const users = loadUsers()
    if (!users[username]) return
    delete users[username]
    saveUsers(users)
    audit({ type: 'delete_user', target: username, user: user?.username })
    if (user && user.username === username) {
      logout()
    }
  }

  const addXP = (amount) => {
    updateProfile(u => ({ ...u, xp: (u.xp || 0) + amount }))
  }

  const updateAvatar = (avatar) => {
    updateProfile(u => ({ ...u, avatar }))
  }

  const updateEmail = (email) => {
    updateProfile(u => ({ ...u, email }))
  }

  const updatePassword = (password) => {
    updateProfile(u => ({ ...u, password }))
  }

  const hasRole = (role) => {
    return !!user?.roles?.includes(role)
  }

  return (
    <AuthCtx.Provider value={{ user, login, register, logout, getProfile, updateProfile, getAllUsers, updateUser, toggleAdmin, deleteUser, addXP, updateAvatar, updateEmail, updatePassword, hasRole, addHistory }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
