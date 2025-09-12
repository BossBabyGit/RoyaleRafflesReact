
import { useMemo, useState } from 'react'
import { useRaffles } from '../context/RaffleContext'
import RaffleCard from '../components/RaffleCard'

export default function Raffles() {
  const { raffles, purchase } = useRaffles()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [status, setStatus] = useState('Active')
  const [sort, setSort] = useState('ending')

  const filtered = useMemo(() => {
    return raffles.filter(r => {
      const matchesQ = r.title.toLowerCase().includes(q.toLowerCase())
      const matchesCat = cat === 'All' || r.category === cat
      const matchesStatus = status === 'All' || (status==='Active' ? !r.ended : r.ended)
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
      <div className="glass rounded-2xl p-4 md:p-6">
        <div className="grid md:grid-cols-5 gap-3">
          <input placeholder="Search raffles..." value={q} onChange={e=>setQ(e.target.value)}
            className="md:col-span-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" />
          <select value={cat} onChange={e=>setCat(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl px-3 py-2">
            <option>All</option>
            {cats.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl px-3 py-2">
            <option>Active</option>
            <option>Ended</option>
            <option>All</option>
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl px-3 py-2">
            <option value="ending">Ending Soon</option>
            <option value="progress">Most Popular</option>
            <option value="value">Prize Value</option>
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
