
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRaffles } from '../context/RaffleContext'
import { useAuth } from '../context/AuthContext'
import BuyModal from '../components/BuyModal'

function mask(name) {
  if (!name) return ''
  if (name.length <= 3) return name[0] + '**'
  return name.slice(0,3) + '***'
}

function Countdown({ endsAt, ended }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (ended) return
    const t = setInterval(()=>setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [ended])
  if (ended) return <span className="text-red-300">Ended</span>
  const ms = Math.max(0, endsAt - now)
  const d = Math.floor(ms/86400000)
  const h = Math.floor((ms%86400000)/3600000)
  const m = Math.floor((ms%3600000)/60000)
  const s = Math.floor((ms%60000)/1000)
  return <span>{d}d {h}h {m}m {s}s</span>
}

export default function RaffleDetails() {
  const { id } = useParams()
  const { raffles, purchase } = useRaffles()
  const { user, getProfile, toggleFavorite, isFavorite } = useAuth()
  const nav = useNavigate()

  const r = useMemo(()=> raffles.find(x => String(x.id) === String(id)), [raffles, id])
  const [open, setOpen] = useState(false)

  if (!r) {
    return (
      <div className="py-10">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-bold">Raffle not found</h2>
          <p className="text-white/70 mt-2">This raffle doesn't exist. Go back to the <Link className="text-blue-light underline" to="/raffles">raffles</Link> list.</p>
        </div>
      </div>
    )
  }

  const profile = user ? getProfile() : null
  const youHave = profile?.entries?.[r.id] || 0
  const fav = isFavorite(r.id)
  const maxPerUser = Math.floor(r.totalTickets * 0.5)
  const available = r.totalTickets - r.sold

  return (
    <div className="py-8 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl overflow-hidden">
          <img src={r.image} alt={r.title} className="w-full h-80 object-cover" />
        </div>
        <div className="glass rounded-2xl p-6 space-y-3">
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            {r.title}
            {user && (
              <button onClick={() => toggleFavorite(r.id)} className="text-2xl leading-none">
                {fav ? '★' : '☆'}
              </button>
            )}
          </h1>
          <p className="text-white/70">{r.description}</p>
          <div className="text-sm text-white/80">Estimated value: <b className="text-white">${r.value}</b></div>
          <div className="text-sm text-white/80">Ticket price: <b className="text-blue-light">${r.ticketPrice.toFixed(2)}</b></div>
          <div className="text-sm text-white/80">Progress: <b>{r.sold}</b> / {r.totalTickets} sold</div>
          <div className="text-sm text-white/80">Time left: <b><Countdown endsAt={r.endsAt} ended={r.ended} /></b></div>
          {user && (
            <div className="text-sm text-white/80">Your tickets: <b>{youHave}</b> • Max per user: <b>{maxPerUser}</b></div>
          )}
          <div className="pt-2 flex gap-3">
            <button onClick={()=>nav(-1)} className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20">Back</button>
            <button disabled={r.ended || available<=0} onClick={()=>setOpen(true)} className="px-4 py-2 rounded-2xl bg-claret hover:bg-claret-light disabled:opacity-50 disabled:cursor-not-allowed">
              {r.ended ? 'Ended' : 'Enter Raffle'}
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Participants</h2>
        <p className="text-white/70 text-sm">Recent entries (anonymized):</p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(r.entries && r.entries.length>0) ? r.entries.map((e, i)=>(
            <div key={i} className="p-3 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between">
              <span className="text-white/80">{mask(e.username)}</span>
              <span className="text-white/60 text-sm">× {e.count}</span>
            </div>
          )) : <div className="text-white/60">No entries yet. Be the first!</div>}
        </div>
      </div>

      {open && <BuyModal r={r} onClose={()=>setOpen(false)} onPurchase={purchase} />}
    </div>
  )
}
