import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNotify } from './NotificationContext'
import { useAuth } from './AuthContext'
import { useAudit } from './AuditContext'

const RaffleCtx = createContext(null)

const now = () => new Date().getTime()
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

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
  const [raffles, setRaffles] = useState([])

  const applyServerPayload = useCallback((payload) => {
    if (!payload) return { applied: false, raffle: null }

    if (Array.isArray(payload)) {
      setRaffles(payload)
      return { applied: true, raffle: null }
    }

    if (Array.isArray(payload?.raffles)) {
      setRaffles(payload.raffles)
      return { applied: true, raffle: payload?.raffle ?? null }
    }

    if (Array.isArray(payload?.data)) {
      setRaffles(payload.data)
      return { applied: true, raffle: payload?.raffle ?? null }
    }

    if (Array.isArray(payload?.data?.raffles)) {
      setRaffles(payload.data.raffles)
      return { applied: true, raffle: payload?.data?.raffle ?? null }
    }

    if (payload?.raffle) {
      setRaffles(curr => {
        const targetId = String(payload.raffle.id)
        const exists = curr.some(r => String(r.id) === targetId)
        return exists
          ? curr.map(r => (String(r.id) === targetId ? payload.raffle : r))
          : [...curr, payload.raffle]
      })
      return { applied: true, raffle: payload.raffle }
    }

    if (payload?.id !== undefined) {
      setRaffles(curr => {
        const targetId = String(payload.id)
        const exists = curr.some(r => String(r.id) === targetId)
        return exists
          ? curr.map(r => (String(r.id) === targetId ? payload : r))
          : [...curr, payload]
      })
      return { applied: true, raffle: payload }
    }

    return { applied: false, raffle: null }
  }, [setRaffles])

  const refreshRaffles = useCallback(async () => {
    try {
      const payload = await apiRequest('/raffles')
      const { applied } = applyServerPayload(payload)
      if (!applied && payload === null) {
        setRaffles([])
      }
    } catch (err) {
      console.error('Failed to fetch raffles from API', err)
    }
  }, [applyServerPayload])

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
    try {
      const hasId = Boolean(raffle.id)
      const payload = await apiRequest(hasId ? `/raffles/${raffle.id}` : '/raffles', {
        method: hasId ? 'PUT' : 'POST',
        body: raffle,
      })
      const { applied, raffle: updated } = applyServerPayload(payload)
      if (!applied) {
        await refreshRaffles()
      }
      const targetId = updated?.id ?? raffle.id
      audit({ type: hasId ? 'update_raffle' : 'create_raffle', target: targetId, user: user?.username })
      return { ok: true }
    } catch (err) {
      console.error('Failed to save raffle', err)
      return { ok: false, error: err.message || 'Failed to save raffle' }
    }
  }, [applyServerPayload, refreshRaffles, audit, user])

  const endRaffleManually = useCallback(async (id) => {
    try {
      const payload = await apiRequest(`/raffles/${id}/end`, { method: 'POST' })
      const { applied, raffle: ended } = applyServerPayload(payload)
      if (!applied) {
        await refreshRaffles()
      }
      if (ended?.winner) {
        log({ type: 'raffle_end', raffleId: ended.id, winner: ended.winner })
      }
      audit({ type: 'end_raffle', target: id, user: user?.username })
      return { ok: true, raffle: ended ?? null }
    } catch (err) {
      console.error('Failed to end raffle manually', err)
      return { ok: false, error: err.message || 'Failed to end raffle' }
    }
  }, [applyServerPayload, refreshRaffles, log, audit, user])

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
