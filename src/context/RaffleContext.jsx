
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import seed from '../data/raffles'
import { useNotify } from './NotificationContext'
import { useAuth } from './AuthContext'

const RaffleCtx = createContext(null)

const now = () => new Date().getTime()

function drawWinner(r) {
  let winner = null
  if (r.entries && r.entries.length > 0) {
    const pool = r.entries.flatMap(e => Array(e.count).fill(e.username))
    const idx = Math.floor(Math.random() * pool.length)
    winner = pool[idx]
  }
  return winner
}

function loadRaffles() {
  const raw = localStorage.getItem('rr_raffles')
  if (raw) return JSON.parse(raw)
  const seeded = seed()
  localStorage.setItem('rr_raffles', JSON.stringify(seeded))
  return seeded
}

function saveRaffles(raffles) {
  localStorage.setItem('rr_raffles', JSON.stringify(raffles))
}

export function RaffleProvider({ children }) {
    const { notify, log } = useNotify()
  const [raffles, setRaffles] = useState([])
  const { user, getProfile, updateProfile } = useAuth()

  useEffect(() => {
    setRaffles(loadRaffles())
  }, [])

  // Resolve ended raffles & draw winners once
  useEffect(() => {
    const updated = raffles.map(r => {
      if (r.ended) return r
      if (now() > r.endsAt) {
        // pick a winner if at least one entry was sold
        let winner = null
        if (r.entries && r.entries.length > 0) {
          const pool = r.entries.flatMap(e => Array(e.count).fill(e.username))
          const idx = Math.floor(Math.random() * pool.length)
          winner = pool[idx]
        }
        const endedR = { ...r, ended: true, winner }
          if (winner) log({ type:'raffle_end', raffleId:r.id, winner })
          return endedR
      }
      return r
    })
    if (JSON.stringify(updated) !== JSON.stringify(raffles)) {
      setRaffles(updated)
      saveRaffles(updated)
    }
  }, [raffles])

  const purchase = (raffleId, count) => {
    const prof = getProfile()
    if (!prof) return { ok: false, error: 'Not logged in' }

    const r = raffles.find(x => x.id === raffleId)
    if (!r) return { ok: false, error: 'Raffle not found' }
    if (r.ended) return { ok: false, error: 'This raffle has ended' }

    const price = r.ticketPrice * count
    if (prof.balance < price) return { ok: false, error: 'Insufficient balance' }

    const userOwned = (prof.entries[raffleId] || 0)
    const maxAllowed = Math.floor(r.totalTickets * 0.5)
    if (userOwned + count > maxAllowed) {
      return { ok: false, error: `Limit exceeded. You can own at most ${maxAllowed} tickets.` }
    }

    if (r.sold + count > r.totalTickets) return { ok: false, error: 'Not enough tickets available' }

    // Update raffle
    const updatedRaffles = raffles.map(x => {
      if (x.id !== raffleId) return x
      const newEntries = [...(x.entries || [])]
      const idx = newEntries.findIndex(e => e.username === prof.username)
      if (idx >= 0) newEntries[idx] = { ...newEntries[idx], count: newEntries[idx].count + count }
      else newEntries.push({ username: prof.username, count })

      return { ...x, sold: x.sold + count, entries: newEntries }
    })
    setRaffles(updatedRaffles)
    saveRaffles(updatedRaffles)

    // Update user
    updateProfile((u) => {
      const entries = { ...(u.entries || {}) }
      entries[raffleId] = (entries[raffleId] || 0) + count
      return { ...u, balance: u.balance - price, entries }
    })

    notify(`Purchased ${count} ticket(s) for ${r.title}`); log({ type:'purchase', raffleId: raffleId, count, user: prof.username }); return { ok: true }
  }

  const upsertRaffle = (raffle) => {
    setRaffles(curr => {
      let next
      if (raffle.id) {
        next = curr.map(r => (r.id === raffle.id ? { ...r, ...raffle } : r))
      } else {
        const newId = curr.reduce((m, r) => Math.max(m, r.id), 0) + 1
        const newRaffle = { ...raffle, id: newId, sold: 0, entries: [], ended: false, winner: null }
        next = [...curr, newRaffle]
      }
      saveRaffles(next)
      return next
    })
  }

  const endRaffleManually = (id) => {
    let ended = null
    const updated = raffles.map(r => {
      if (r.id !== id) return r
      if (r.ended) return r
      const winner = drawWinner(r)
      const endedR = { ...r, ended: true, winner }
      ended = endedR
      return endedR
    })
    setRaffles(updated)
    saveRaffles(updated)
    if (ended?.winner) log({ type:'raffle_end', raffleId: ended.id, winner: ended.winner })
  }

  const topRaffles = useMemo(() => {
    const active = raffles.filter(r => !r.ended)
    return [...active].sort((a,b) => (b.sold/b.totalTickets) - (a.sold/a.totalTickets)).slice(0,3)
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
    <RaffleCtx.Provider value={{ raffles, setRaffles, purchase, upsertRaffle, endRaffleManually, topRaffles, categorized }}>
      {children}
    </RaffleCtx.Provider>
  )
}

export function useRaffles() {
  return useContext(RaffleCtx)
}
