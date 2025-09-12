import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRaffles } from '../context/RaffleContext'

function maskUsername(name, currentUser) {
  if (currentUser && currentUser.username === name) return name
  return name.length <= 3 ? name : name.slice(0,3) + '***'
}

export default function HallOfFame() {
  const { user, getAllUsers } = useAuth()
  const { raffles } = useRaffles()
  const [range, setRange] = useState('week') // 'week' or 'month'

  const stats = useMemo(() => {
    const days = range === 'week' ? 7 : 30
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

    const tickets = {}
    const wins = {}

    raffles.forEach(r => {
      if (r.endsAt >= cutoff) {
        r.entries?.forEach(e => {
          tickets[e.username] = (tickets[e.username] || 0) + e.count
        })
      }
      if (r.ended && r.winner && r.endsAt >= cutoff) {
        wins[r.winner] = (wins[r.winner] || 0) + 1
      }
    })

    const users = getAllUsers()

    const mostTickets = Object.entries(tickets)
      .map(([username, value]) => ({ username, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0,10)

    const mostWins = Object.entries(wins)
      .map(([username, value]) => ({ username, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0,10)

    const luckiest = users.map(u => {
      const t = tickets[u.username] || 0
      const w = wins[u.username] || 0
      return { username: u.username, tickets: t, wins: w, value: t >= 5 ? w / t : 0 }
    }).filter(x => x.tickets >= 5 && x.value > 0)
      .sort((a,b) => b.value - a.value)
      .slice(0,10)

    return { mostTickets, mostWins, luckiest }
  }, [range, raffles, getAllUsers])

  const renderList = (list, formatter, maxValue) => {
    if (!list.length) return <div className="text-center py-6 text-white/60">No data yet</div>
    return (
      <ul className="space-y-3">
        {list.map((item, idx) => (
          <li key={item.username}>
            <div className="flex items-center gap-2">
              <span className="w-5 text-sm">{idx + 1}.</span>
              <span className="flex-1 text-sm">{maskUsername(item.username, user)}</span>
              <span className="text-sm font-medium">{formatter(item)}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-blue-light" style={{width: `${(item.value / (maxValue || 1)) * 100}%`}}></div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="py-8">
      <section className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold">Hall of Fame</h1>
        <p className="text-white/70 mt-4 max-w-md">Celebrating our top raffle legends.</p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setRange('week')}
            className={`px-4 py-2 rounded-xl transition ${range==='week' ? 'bg-blue text-white' : 'bg-white/10 hover:bg-white/20'}`}
          >
            This Week
          </button>
          <button
            onClick={() => setRange('month')}
            className={`px-4 py-2 rounded-xl transition ${range==='month' ? 'bg-blue text-white' : 'bg-white/10 hover:bg-white/20'}`}
          >
            This Month
          </button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="glass rounded-2xl p-6 border border-white/10 shadow-glow">
          <h3 className="font-semibold mb-4">🎟️ Most Tickets Bought</h3>
          {renderList(stats.mostTickets, i => i.value, stats.mostTickets[0]?.value)}
        </div>
        <div className="glass rounded-2xl p-6 border border-white/10 shadow-glow">
          <h3 className="font-semibold mb-4">🏆 Most Wins</h3>
          {renderList(stats.mostWins, i => i.value, stats.mostWins[0]?.value)}
        </div>
        <div className="glass rounded-2xl p-6 border border-white/10 shadow-glow">
          <h3 className="font-semibold mb-4">🍀 Luckiest</h3>
          {renderList(stats.luckiest, i => `${Math.round(i.value * 100)}%`, stats.luckiest[0]?.value)}
        </div>
      </section>
    </div>
  )
}

