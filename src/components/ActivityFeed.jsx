import { useEffect, useRef, useState } from 'react'
import { formatCurrency } from '../utils/currency'

// Generate random sample events for the activity feed
function createDummyEvent() {
  const id = Date.now() + Math.random()
  const users = ['Alice', 'Bob', 'Charlie', 'Dana']
  const raffles = [1, 2, 3]
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const type = pick(['purchase', 'topup', 'raffle_end'])
  if (type === 'purchase') {
    return { id, type, user: pick(users), count: Math.ceil(Math.random() * 5), raffleId: pick(raffles) }
  }
  if (type === 'topup') {
    return { id, type, user: pick(users), amount: Math.random() * 100 }
  }
  return { id, type, winner: pick(users), raffleId: pick(raffles) }
}

export default function ActivityFeed() {
  const [items, setItems] = useState([])
  const processed = useRef(new Set())

  useEffect(() => {
    let timeout
    const schedule = () => {
      const delay = 5000 + Math.random() * 5000 // 5-10 seconds
      timeout = setTimeout(() => {
        const ev = createDummyEvent()
        processed.current.add(ev.id)
        const entry = { ...ev, show: false }
        setItems((prev) => {
          const next = [...prev, entry]
          if (next.length > 10) {
            const removed = next.shift()
            processed.current.delete(removed.id)
          }
          return next
        })
        // trigger enter animation
        setTimeout(() => {
          setItems((prev) => prev.map((it) => (it.id === ev.id ? { ...it, show: true } : it)))
        }, 50)
        // schedule removal
        setTimeout(() => {
          setItems((prev) => prev.map((it) => (it.id === ev.id ? { ...it, show: false } : it)))
          setTimeout(() => {
            setItems((prev) => prev.filter((it) => it.id !== ev.id))
            processed.current.delete(ev.id)
          }, 500)
        }, 30000)
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timeout)
  }, [])

  if (items.length === 0) return null

  const renderText = (e) => {
    if (e.type === 'purchase') {
      return `${e.user} bought ${e.count} ticket${e.count > 1 ? 's' : ''} for Raffle #${e.raffleId}`
    }
    if (e.type === 'topup') {
      return `${e.user} added ${formatCurrency(e.amount)} to their balance`
    }
    if (e.type === 'raffle_end') {
      return `${e.winner} won the Raffle #${e.raffleId} raffle 🎉`
    }
    return ''
  }

  return (
    <div className="fixed top-20 left-0 w-full flex justify-center z-40 px-4 pointer-events-none">
      <div className="pointer-events-auto bg-black/40 backdrop-blur-md rounded-xl shadow-glow overflow-hidden">
        <ul className="flex gap-4 py-2 px-4">
          {items.map((e) => (
            <li
              key={e.id}
              className={`flex items-center gap-2 text-xs sm:text-sm min-w-max transition-all duration-500 ${
                e.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-darker ${
                  e.type === 'raffle_end' ? 'bg-claret-light' : 'bg-blue-light'
                }`}
              >
                {(e.type === 'raffle_end' ? e.winner : e.user)?.[0]?.toUpperCase()}
              </div>
              <span className="truncate max-w-[200px] sm:max-w-xs">
                {e.type === 'purchase' ? '🎟️' : e.type === 'topup' ? '💰' : '🏆'} {renderText(e)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
