
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BuyModal from './BuyModal'

function Progress({ sold, total }) {
  const pct = Math.round((sold/total)*100)
  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
      <div className="bg-blue-light h-2" style={{ width: pct + '%' }}></div>
    </div>
  )
}

export default function RaffleCard({ r, onPurchase }) {
  const [open, setOpen] = useState(false)
  const { user, toggleFavorite, isFavorite } = useAuth()
  const fav = isFavorite(r.id)
  const timeLeft = useMemo(() => {
    const ms = r.endsAt - Date.now()
    if (ms <= 0) return "Ended"
    const d = Math.floor(ms/86400000)
    const h = Math.floor((ms%86400000)/3600000)
    const m = Math.floor((ms%3600000)/60000)
    return `${d}d ${h}h ${m}m`
  }, [r.endsAt, r.sold])

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-glow border border-white/10 hover:shadow-lg transition-colors">
      <div className="relative">
        <Link to={`/raffles/${r.id}`}><img src={r.image} alt={r.title} className="w-full h-48 object-cover hover:opacity-90 transition" /></Link>
        <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs bg-black/60 border border-white/10">{r.category}</div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {user && (
            <button onClick={() => toggleFavorite(r.id)} className="text-xl leading-none">
              {fav ? '★' : '☆'}
            </button>
          )}
          {r.ended && <div className="px-2 py-1 rounded-lg text-xs bg-claret">Ended</div>}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold"><Link className="hover:underline" to={`/raffles/${r.id}`}>{r.title}</Link></h3>
        <p className="text-white/70 text-sm line-clamp-2">{r.description}</p>
        <div className="text-xs text-white/70">Estimated value: <span className="text-white font-semibold">${r.value}</span></div>
        <Progress sold={r.sold} total={r.totalTickets} />
        <div className="flex items-center justify-between text-sm text-white/80">
          <span>Sold: <b>{r.sold}</b> / {r.totalTickets}</span>
          <span>Time left: <b>{timeLeft}</b></span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">Ticket: <b className="text-blue-light">${r.ticketPrice.toFixed(2)}</b></span>
          <button disabled={r.ended} onClick={()=>setOpen(true)} className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light disabled:opacity-50 disabled:cursor-not-allowed">Enter</button>
        </div>
      </div>
      {open && <BuyModal r={r} onClose={()=>setOpen(false)} onPurchase={onPurchase} />}
    </div>
  )
}
