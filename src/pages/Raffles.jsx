
import { useMemo, useState } from 'react'
import { useRaffles } from '../context/RaffleContext'
import RaffleCard from '../components/RaffleCard'
import { useTranslation } from 'react-i18next'

export default function Raffles() {
  const { raffles, purchase } = useRaffles()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [status, setStatus] = useState('active')
  const [sort, setSort] = useState('ending')
  const { t } = useTranslation()

  const filtered = useMemo(() => {
    return raffles.filter(r => {
      const matchesQ = r.title.toLowerCase().includes(q.toLowerCase())
      const matchesCat = cat === 'all' || r.category === cat
      const matchesStatus = status === 'all' || (status === 'active' ? !r.ended : r.ended)
      return matchesQ && matchesCat && matchesStatus
    }).sort((a,b)=>{
      if (sort==='ending') return a.endsAt - b.endsAt
      if (sort==='progress') return (b.sold/b.totalTickets) - (a.sold/a.totalTickets)
      if (sort==='value') return b.value - a.value
      return 0
    })
  }, [raffles, q, cat, status, sort])

  const cats = Array.from(new Set(raffles.map(r=>r.category)))

  return (
    <div className="py-8">
      <div className="glass rounded-2xl p-4 mb-6 text-sm text-white/80 border border-white/10">
        <p><strong>Important:</strong> Royale Raffles competitions are open to UK residents aged 18 and over. Every prize has a free postal entry route and all prices are displayed in pounds sterling.</p>
      </div>
      <div className="glass rounded-2xl p-4 md:p-6">
        <div className="grid md:grid-cols-5 gap-3">
          <label htmlFor="raffle-search" className="sr-only">{t('raffles.search')}</label>
          <input
            id="raffle-search"
            placeholder={t('raffles.search')}
            aria-label={t('raffles.search')}
            value={q}
            onChange={e=>setQ(e.target.value)}
            className="md:col-span-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none"
          />
          <select value={cat} onChange={e=>setCat(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl px-3 py-2">
            <option value="all">{t('raffles.all')}</option>
            {cats.map(c=>(
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl px-3 py-2">
            <option value="active">{t('raffles.active')}</option>
            <option value="ended">{t('raffles.ended')}</option>
            <option value="all">{t('raffles.all')}</option>
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl px-3 py-2">
            <option value="ending">{t('raffles.endingSoon')}</option>
            <option value="progress">{t('raffles.mostPopular')}</option>
            <option value="value">{t('raffles.prizeValue')}</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filtered.map(r => (
          <RaffleCard key={r.id} r={r} onPurchase={purchase} />
        ))}
      </div>
    </div>
  )
}
