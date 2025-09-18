
import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRaffles } from '../context/RaffleContext'
import { useAuth } from '../context/AuthContext'
import BuyModal from '../components/BuyModal'
import ShareModal from '../components/ShareModal'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../utils/currency'

const PrizeDiorama = lazy(() => import('../components/PrizeDiorama'))

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
  const { raffles, purchase, claimFreeTicket } = useRaffles()
  const { user, getProfile } = useAuth()
  const nav = useNavigate()
  const { t } = useTranslation()

  const r = useMemo(()=> raffles.find(x => String(x.id) === String(id)), [raffles, id])
  const [open, setOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  if (!r) {
    return (
      <div className="py-10">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-bold">{t('raffleDetails.notFound')}</h2>
          <p className="text-white/70 mt-2">{t('raffleDetails.notFoundDesc')} <Link className="text-blue-light underline" to="/raffles">{t('header.raffles')}</Link></p>
        </div>
      </div>
    )
  }

  const profile = user ? getProfile() : null
  const youHave = profile?.entries?.[r.id] || 0
  const maxPerUser = Math.floor(r.totalTickets * 0.5)
  const available = r.totalTickets - r.sold
  const freeClaimed = profile?.freeEntries?.[r.id]

  const shareText = `I joined this raffle for free on Royale Raffles! ${window.location.origin}/raffles/${r.id}`
  const shareUrl = window.location.origin + '/raffles/' + r.id
  const handleShared = () => {
    claimFreeTicket(r.id)
  }

  return (
    <div className="py-8 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl overflow-hidden">
          <img src={r.image} alt={r.title} className="w-full h-80 object-cover" />
          {r.dioramaUrl && (
            <Suspense fallback={null}>
              <PrizeDiorama src={r.dioramaUrl} className="w-full h-80" />
            </Suspense>
          )}
        </div>
        <div className="glass rounded-2xl p-6 space-y-3">
          <h1 className="text-3xl font-extrabold">{r.title}</h1>
          <p className="text-white/70">{r.description}</p>
          <div className="text-sm text-white/80">{t('raffleDetails.estimated')} <b className="text-white">{formatCurrency(r.value)}</b></div>
          <div className="text-sm text-white/80">{t('raffleDetails.ticketPrice')} <b className="text-blue-light">{formatCurrency(r.ticketPrice)}</b></div>
          <div className="text-sm text-white/80">{t('raffleDetails.progress')} <b>{r.sold}</b> / {r.totalTickets} sold</div>
          <div className="text-sm text-white/80">{t('raffleDetails.timeLeft')} <b><Countdown endsAt={r.endsAt} ended={r.ended} /></b></div>
          {user && (
            <div className="text-sm text-white/80">{t('raffleDetails.yourTickets')} <b>{youHave}</b> • {t('raffleDetails.maxPerUser')} <b>{maxPerUser}</b></div>
          )}
          <div className="pt-2 flex gap-3 flex-wrap">
            <button onClick={()=>nav(-1)} className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20">{t('raffleDetails.back')}</button>
            <button disabled={r.ended || available<=0 || freeClaimed} onClick={()=>setShareOpen(true)} className="px-4 py-2 rounded-2xl bg-blue-light hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-black">
              {freeClaimed ? 'Free Entry Claimed' : 'Share & Claim Free Entry'}
            </button>
            <button disabled={r.ended || available<=0} onClick={()=>setOpen(true)} className="px-4 py-2 rounded-2xl bg-claret hover:bg-claret-light disabled:opacity-50 disabled:cursor-not-allowed">
              {r.ended ? t('raffleDetails.ended') : t('raffleDetails.enter')}
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-black/30 text-sm text-white/80">
          <h2 className="text-lg font-semibold text-white">Free Entry Route</h2>
          <p className="mt-2">To enter this raffle without purchasing tickets, send a first-class postal entry to the Royale Raffles free entry team. The full postal address will be confirmed before launch and can be requested by emailing <a href="mailto:support@northedgegroup.co.uk" className="text-blue-light underline">support@northedgegroup.co.uk</a>. Include your full name, email address, contact number, the raffle name, and confirmation that you are aged 18 or over. Postal entries must arrive before the published closing date.</p>
        </div>
        <div className="text-xs text-white/60">Royale Raffles competitions are open to UK residents aged 18+. Winners are chosen at random using the RANDOM.ORG verified draw service, and full results are published in the Winners Hub.</div>
        <h2 className="text-xl font-semibold">{t('raffleDetails.participants')}</h2>
        <p className="text-white/70 text-sm">{t('raffleDetails.recentEntries')}</p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(r.entries && r.entries.length>0) ? r.entries.map((e, i)=>(
            <div key={i} className="p-3 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between">
              <span className="text-white/80">{mask(e.username)}</span>
              <span className="text-white/60 text-sm">× {e.count}</span>
            </div>
          )) : <div className="text-white/60">{t('raffleDetails.noEntries')}</div>}
        </div>
      </div>

      {open && <BuyModal r={r} onClose={()=>setOpen(false)} onPurchase={purchase} />}
      {shareOpen && <ShareModal shareText={shareText} url={shareUrl} onClose={()=>setShareOpen(false)} onShared={handleShared} />}
    </div>
  )
}
