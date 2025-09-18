
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/currency'

export default function BuyModal({ r, onClose, onPurchase }) {
  const [count, setCount] = useState(1)
  const [err, setErr] = useState('')
  const { user } = useAuth()

  const maxByCap = Math.floor(r.totalTickets * 0.5)
  const available = r.totalTickets - r.sold

  const handleBuy = () => {
    const c = parseInt(count || 0, 10)
    if (!user) {
      setErr('Please login first.')
      return
    }
    if (c <= 0) { setErr('Enter at least 1 ticket'); return }
    if (c > available) { setErr('Not enough tickets available'); return }
    const res = onPurchase(r.id, c)
    if (!res.ok) setErr(res.error)
    else onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Enter Raffle</h3>
            <p className="text-xs text-white/60">Test Mode checkout - no live payments are processed.</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <p className="text-white/80 text-sm">How many tickets would you like to buy for <b>{r.title}</b>?</p>
        <div className="space-y-2">
          <label htmlFor="ticket-count" className="sr-only">Ticket count</label>
          <input
            id="ticket-count"
            type="number"
            min="1"
            max={Math.min(maxByCap, available)}
            value={count}
            onChange={e=>setCount(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none"
            aria-label="Ticket count"
          />
          <div className="text-xs text-white/70">Max per user: <b>{maxByCap}</b> • Available: <b>{available}</b></div>
          <div className="text-sm">Total: <b className="text-blue-light">{formatCurrency(r.ticketPrice * (parseInt(count||0,10)||0))}</b></div>
          {err && <div className="text-sm text-red-400">{err}</div>}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">Cancel</button>
          <button onClick={handleBuy} className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light">Pay & Enter</button>
        </div>
      </div>
    </div>
  )
}
