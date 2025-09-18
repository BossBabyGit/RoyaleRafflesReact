
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BuyModal from './BuyModal'
import ShareModal from './ShareModal'
import { useRaffles } from '../context/RaffleContext'
import { formatCurrency } from '../utils/currency'

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
  const [shareOpen, setShareOpen] = useState(false)
  const { claimFreeTicket } = useRaffles()
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
        {r.ended && <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs bg-claret">Ended</div>}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold"><Link className="hover:underline" to={`/raffles/${r.id}`}>{r.title}</Link></h3>
        <p className="text-white/70 text-sm line-clamp-2">{r.description}</p>
        <div className="text-xs text-white/70">Estimated value: <span className="text-white font-semibold">{formatCurrency(r.value)}</span></div>
        <Progress sold={r.sold} total={r.totalTickets} />
        <div className="flex items-center justify-between text-sm text-white/80">
          <span>Sold: <b>{r.sold}</b> / {r.totalTickets}</span>
          <span>Time left: <b>{timeLeft}</b></span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">Ticket: <b className="text-blue-light">{formatCurrency(r.ticketPrice)}</b></span>
          <div className="flex gap-2">
            <button disabled={r.ended} onClick={()=>setShareOpen(true)} className="px-3 py-1.5 rounded-xl bg-blue-light hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-black">Free Entry</button>
            <button disabled={r.ended} onClick={()=>setOpen(true)} className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light disabled:opacity-50 disabled:cursor-not-allowed">Enter</button>
          </div>
        </div>
        <div className="text-[11px] text-white/60 pt-2 border-t border-white/10 mt-3">18+ UK residents only. No purchase necessary. See prize page for postal entry.</div>
      </div>
      {open && <BuyModal r={r} onClose={()=>setOpen(false)} onPurchase={onPurchase} />}
      {shareOpen && (
        <ShareModal
          shareText={`I joined this raffle for free on Royale Raffles! ${window.location.origin}/raffles/${r.id}`}
          url={window.location.origin + `/raffles/${r.id}`}
          onClose={()=>setShareOpen(false)}
          onShared={()=>claimFreeTicket(r.id)}
        />
      )}
    </div>
  )
}
