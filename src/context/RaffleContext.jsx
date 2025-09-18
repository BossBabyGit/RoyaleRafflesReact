import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNotify } from './NotificationContext'
import { useAuth } from './AuthContext'
import { useAudit } from './AuditContext'
import seed from '../data/raffles'

const RaffleCtx = createContext(null)

const now = () => new Date().getTime()
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const RAFFLES_STORAGE_KEY = 'rr_raffles'

function getRaffleStorage() {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage ?? null
  } catch (err) {
    console.warn('Accessing localStorage for raffles failed', err)
    return null
  }
}

function loadStoredRaffles() {
  const storage = getRaffleStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(RAFFLES_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch (err) {
    console.warn('Failed to parse raffles from storage', err)
    return null
  }
}

function storeRaffles(list) {
  const storage = getRaffleStorage()
  if (!storage || !Array.isArray(list)) return
  try {
    storage.setItem(RAFFLES_STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.warn('Failed to persist raffles to storage', err)
  }
}

function normalizeRaffle(data, fallback = {}) {
  const defaults = {
    sold: 0,
    entries: [],
    ended: false,
    winner: null,
  }
  const merged = { ...defaults, ...fallback, ...data }
  merged.entries = Array.isArray(merged.entries) ? merged.entries : []
  merged.sold = Number.isFinite(Number(merged.sold)) ? Number(merged.sold) : 0
  merged.totalTickets = Number.isFinite(Number(merged.totalTickets)) ? Number(merged.totalTickets) : 0
  merged.ticketPrice = Number.isFinite(Number(merged.ticketPrice)) ? Number(merged.ticketPrice) : 0
  merged.value = Number.isFinite(Number(merged.value)) ? Number(merged.value) : merged.value
  return merged
}

function chooseWinner(raffle) {
  const entries = Array.isArray(raffle?.entries) ? raffle.entries : []
  const pool = entries.reduce((acc, entry) => acc + (Number(entry?.count) || 0), 0)
  if (pool <= 0) return null
  const target = Math.random() * pool
  let cursor = 0
  for (const entry of entries) {
    const count = Number(entry?.count) || 0
    cursor += count
    if (target < cursor) {
      return entry?.username || null
    }
  }
  return null
}

function resolvePath(path) {
  if (!path) return API_BASE
  return path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`
}

async function apiRequest(path, options = {}) {
  const { body, headers, method = 'GET', ...rest } = options
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    ...rest,
  }

  if (body !== undefined) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const response = await fetch(resolvePath(path), config)
  const contentType = response.headers.get('content-type') || ''
  let payload = null

  if (contentType.includes('application/json')) {
    payload = await response.json()
  } else if (response.status !== 204) {
    const text = await response.text()
    payload = text ? { message: text } : null
  }

  if (!response.ok) {
    const message = (payload && (payload.error || payload.message)) || response.statusText || 'Request failed'
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export function RaffleProvider({ children }) {
  const { notify, log } = useNotify()
  const { log: audit } = useAudit()
  const { user, getProfile, updateProfile, addHistory } = useAuth()
  const [raffles, setRaffles] = useState(() => loadStoredRaffles() ?? [])

  const setAndStoreRaffles = useCallback((updater) => {
    setRaffles(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (Array.isArray(next)) {
        storeRaffles(next)
      }
      return next
    })
  }, [])

  const applyServerPayload = useCallback((payload) => {
    if (!payload) return { applied: false, raffle: null }

    if (Array.isArray(payload)) {
      setAndStoreRaffles(payload)
      return { applied: true, raffle: null }
    }

    if (Array.isArray(payload?.raffles)) {
      setAndStoreRaffles(payload.raffles)
      return { applied: true, raffle: payload?.raffle ?? null }
    }

    if (Array.isArray(payload?.data)) {
      setAndStoreRaffles(payload.data)
      return { applied: true, raffle: payload?.raffle ?? null }
    }

    if (Array.isArray(payload?.data?.raffles)) {
      setAndStoreRaffles(payload.data.raffles)
      return { applied: true, raffle: payload?.data?.raffle ?? null }
    }

    if (payload?.raffle) {
      setAndStoreRaffles(curr => {
        const targetId = String(payload.raffle.id)
        const exists = curr.some(r => String(r.id) === targetId)
        return exists
          ? curr.map(r => (String(r.id) === targetId ? payload.raffle : r))
          : [...curr, payload.raffle]
      })
      return { applied: true, raffle: payload.raffle }
    }

    if (payload?.id !== undefined) {
      setAndStoreRaffles(curr => {
        const targetId = String(payload.id)
        const exists = curr.some(r => String(r.id) === targetId)
        return exists
          ? curr.map(r => (String(r.id) === targetId ? payload : r))
          : [...curr, payload]
      })
      return { applied: true, raffle: payload }
    }

    return { applied: false, raffle: null }
  }, [setAndStoreRaffles])

  const hydrateFromSeed = useCallback(() => {
    const seeded = seed().map(r => normalizeRaffle(r))
    const stored = loadStoredRaffles()

    let data = seeded
    if (Array.isArray(stored)) {
      if (stored.length) {
        const map = new Map(seeded.map(item => [String(item.id), item]))
        stored.forEach(item => {
          if (!item || item.id === undefined || item.id === null) return
          const normalized = normalizeRaffle(item)
          map.set(String(normalized.id), normalized)
        })
        data = Array.from(map.values())
      } else {
        data = stored
      }
    }

    setAndStoreRaffles(data)
    return data
  }, [setAndStoreRaffles])

  const applyLocalUpsert = useCallback((raffle) => {
    let saved = null
    setAndStoreRaffles(curr => {
      const list = Array.isArray(curr) ? curr : []
      if (raffle?.id !== undefined && raffle?.id !== null) {
        const targetId = String(raffle.id)
        let found = false
        const next = list.map(item => {
          if (String(item.id) === targetId) {
            found = true
            const merged = normalizeRaffle({ ...item, ...raffle, id: item.id }, item)
            saved = merged
            return merged
          }
          return item
        })
        if (!found) {
          const normalized = normalizeRaffle({ ...raffle })
          saved = normalized
          return [...next, normalized]
        }
        return next
      }

      const maxId = list.reduce((acc, item) => Math.max(acc, Number(item?.id) || 0), 0)
      const newId = maxId + 1
      const normalized = normalizeRaffle({ ...raffle, id: newId })
      saved = normalized
      return [...list, normalized]
    })
    return saved
  }, [setAndStoreRaffles])

  const applyLocalEnd = useCallback((id) => {
    let ended = null
    setAndStoreRaffles(curr => {
      const list = Array.isArray(curr) ? curr : []
      const targetId = String(id)
      const next = list.map(item => {
        if (String(item.id) === targetId) {
          const normalized = normalizeRaffle(item)
          const winner = normalized.winner || chooseWinner(normalized)
          ended = { ...normalized, ended: true, winner }
          return ended
        }
        return item
      })
      return next
    })
    return ended
  }, [setAndStoreRaffles])

  const refreshRaffles = useCallback(async () => {
    try {
      const payload = await apiRequest('/raffles')
      const { applied } = applyServerPayload(payload)
      if (!applied) {
        hydrateFromSeed()
      }
    } catch (err) {
      console.error('Failed to fetch raffles from API', err)
      hydrateFromSeed()
    }
  }, [applyServerPayload, hydrateFromSeed])

  useEffect(() => {
    refreshRaffles()
  }, [refreshRaffles])

  useEffect(() => {
    if (!raffles.length) return
    const overdue = raffles.filter(r => !r.ended && now() > r.endsAt)
    if (!overdue.length) return

    ;(async () => {
      for (const raffle of overdue) {
        try {
          const payload = await apiRequest(`/raffles/${raffle.id}/end`, { method: 'POST' })
          const { raffle: ended } = applyServerPayload(payload)
          if (ended?.winner) {
            log({ type: 'raffle_end', raffleId: ended.id, winner: ended.winner })
          }
        } catch (err) {
          console.error(`Failed to resolve raffle ${raffle.id}`, err)
        }
      }
      await refreshRaffles()
    })()
  }, [raffles, applyServerPayload, refreshRaffles, log])

  const purchase = useCallback(async (raffleId, count) => {
    const prof = getProfile()
    if (!prof) return { ok: false, error: 'Not logged in' }

    const r = raffles.find(x => String(x.id) === String(raffleId))
    if (!r) return { ok: false, error: 'Raffle not found' }
    if (r.ended) return { ok: false, error: 'This raffle has ended' }
    if (count <= 0) return { ok: false, error: 'Invalid ticket count' }

    const price = r.ticketPrice * count
    if (prof.balance < price) return { ok: false, error: 'Insufficient balance' }

    const userOwned = (prof.entries?.[raffleId] || 0)
    const maxAllowed = Math.floor(r.totalTickets * 0.5)
    if (userOwned + count > maxAllowed) {
      return { ok: false, error: `Limit exceeded. You can own at most ${maxAllowed} tickets.` }
    }

    if (r.sold + count > r.totalTickets) return { ok: false, error: 'Not enough tickets available' }

    try {
      const payload = await apiRequest(`/raffles/${raffleId}/purchase`, {
        method: 'POST',
        body: { count, username: prof.username },
      })
      const { applied } = applyServerPayload(payload)
      if (!applied) {
        await refreshRaffles()
      }
    } catch (err) {
      const message = err.message || 'Failed to purchase tickets'
      return { ok: false, error: message }
    }

    updateProfile((u) => {
      const entries = { ...(u.entries || {}) }
      entries[raffleId] = (entries[raffleId] || 0) + count
      return { ...u, balance: u.balance - price, entries }
    })

    addHistory(raffleId, r.title, count)

    notify(`Purchased ${count} ticket(s) for ${r.title}`)
    log({ type: 'purchase', raffleId, count, user: prof.username })
    return { ok: true }
  }, [raffles, getProfile, updateProfile, addHistory, notify, log, applyServerPayload, refreshRaffles])

  const claimFreeTicket = useCallback(async (raffleId) => {
    const prof = getProfile()
    if (!prof) {
      notify('Please login first.', 'error')
      return { ok: false, error: 'Not logged in' }
    }

    const r = raffles.find(x => String(x.id) === String(raffleId))
    if (!r) {
      notify('Raffle not found', 'error')
      return { ok: false, error: 'Raffle not found' }
    }
    if (r.ended) {
      notify('This raffle has ended', 'error')
      return { ok: false, error: 'Raffle ended' }
    }

    const available = r.totalTickets - r.sold
    if (available <= 0) {
      notify('No tickets available', 'error')
      return { ok: false, error: 'No tickets available' }
    }

    const userOwned = prof.entries?.[raffleId] || 0
    const maxAllowed = Math.floor(r.totalTickets * 0.5)
    if (userOwned >= maxAllowed) {
      notify(`Limit exceeded. You can own at most ${maxAllowed} tickets.`, 'error')
      return { ok: false, error: 'Limit exceeded' }
    }

    const freeEntries = prof.freeEntries || {}
    if (freeEntries[raffleId]) {
      notify('Free ticket already claimed', 'error')
      return { ok: false, error: 'Already claimed' }
    }

    try {
      const payload = await apiRequest(`/raffles/${raffleId}/free-entry`, {
        method: 'POST',
        body: { username: prof.username },
      })
      const { applied } = applyServerPayload(payload)
      if (!applied) {
        await refreshRaffles()
      }
    } catch (err) {
      const message = err.message || 'Failed to claim free ticket'
      notify(message, 'error')
      return { ok: false, error: message }
    }

    updateProfile(u => {
      const entries = { ...(u.entries || {}) }
      entries[raffleId] = (entries[raffleId] || 0) + 1
      const fe = { ...(u.freeEntries || {}) }
      fe[raffleId] = true
      return { ...u, entries, freeEntries: fe }
    })

    notify(`Claimed a free ticket for ${r.title}`)
    log({ type: 'free_entry', raffleId, user: prof.username })
    return { ok: true }
  }, [raffles, getProfile, updateProfile, notify, log, applyServerPayload, refreshRaffles])

  const upsertRaffle = useCallback(async (raffle) => {
    const hasId = Boolean(raffle?.id)
    try {
      const payload = await apiRequest(hasId ? `/raffles/${raffle.id}` : '/raffles', {
        method: hasId ? 'PUT' : 'POST',
        body: raffle,
      })
      const { applied, raffle: updated } = applyServerPayload(payload)
      const saved = applied ? updated ?? raffle : applyLocalUpsert(updated ?? raffle)
      const targetId = saved?.id ?? raffle?.id
      audit({ type: hasId ? 'update_raffle' : 'create_raffle', target: targetId, user: user?.username })
      return { ok: true, raffle: saved ?? null, offline: !applied }
    } catch (err) {
      console.error('Failed to save raffle', err)
      const saved = applyLocalUpsert(raffle)
      if (saved) {
        audit({ type: hasId ? 'update_raffle' : 'create_raffle', target: saved.id, user: user?.username })
        return { ok: true, raffle: saved, offline: true }
      }
      return { ok: false, error: err.message || 'Failed to save raffle' }
    }
  }, [applyServerPayload, audit, user, applyLocalUpsert])

  const endRaffleManually = useCallback(async (id) => {
    try {
      const payload = await apiRequest(`/raffles/${id}/end`, { method: 'POST' })
      const { applied, raffle: ended } = applyServerPayload(payload)
      const result = applied ? ended ?? null : applyLocalEnd(id) ?? ended ?? null
      if (result?.winner) {
        log({ type: 'raffle_end', raffleId: result.id, winner: result.winner })
      }
      audit({ type: 'end_raffle', target: result?.id ?? id, user: user?.username })
      return { ok: true, raffle: result, offline: !applied }
    } catch (err) {
      console.error('Failed to end raffle manually', err)
      const local = applyLocalEnd(id)
      if (local) {
        if (local.winner) {
          log({ type: 'raffle_end', raffleId: local.id, winner: local.winner })
        }
        audit({ type: 'end_raffle', target: local.id ?? id, user: user?.username })
        return { ok: true, raffle: local, offline: true }
      }
      return { ok: false, error: err.message || 'Failed to end raffle' }
    }
  }, [applyServerPayload, applyLocalEnd, log, audit, user])

  const topRaffles = useMemo(() => {
    const active = raffles.filter(r => !r.ended)
    return [...active].sort((a, b) => (b.sold / b.totalTickets) - (a.sold / a.totalTickets)).slice(0, 3)
  }, [raffles])

  const categorized = useMemo(() => {
    const categories = {}
    raffles.forEach(r => {
      categories[r.category] = categories[r.category] || []
      categories[r.category].push(r)
    })
    return categories
  }, [raffles])

  return (
    <RaffleCtx.Provider value={{
      raffles,
      refreshRaffles,
      purchase,
      claimFreeTicket,
      upsertRaffle,
      endRaffleManually,
      topRaffles,
      categorized,
    }}>
      {children}
    </RaffleCtx.Provider>
  )
}

export function useRaffles() {
  return useContext(RaffleCtx)
}
