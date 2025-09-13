import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRaffles } from '../context/RaffleContext'
import { useTranslation } from 'react-i18next'

function maskUsername(name, currentUser) {
  if (currentUser && currentUser.username === name) return name
  return name.length <= 3 ? name : name.slice(0,3) + '***'
}

function avatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue},70%,80%)`
}

function Avatar({ username }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
      style={{ backgroundColor: avatarColor(username) }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  )
}

export default function HallOfFame() {
  const { user, getAllUsers } = useAuth()
  const { raffles } = useRaffles()
  const [season, setSeason] = useState('week') // week, month, all
  const { t } = useTranslation()

  const stats = useMemo(() => {
    const days = season === 'week' ? 7 : season === 'month' ? 30 : null
    const cutoff = days ? Date.now() - days * 24 * 60 * 60 * 1000 : 0

    const tickets = {}
    const wins = {}

    raffles.forEach(r => {
      if (cutoff === 0 || r.endsAt >= cutoff) {
        r.entries?.forEach(e => {
          tickets[e.username] = (tickets[e.username] || 0) + e.count
        })
      }
      if (r.ended && r.winner && (cutoff === 0 || r.endsAt >= cutoff)) {
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
  }, [season, raffles, getAllUsers])

  const medal = idx => idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null

  const renderList = (list, formatter) => {
    if (!list.length) return <div className="text-center py-6 text-white/60">{t('hallOfFame.noChampions')}</div>
    const maxValue = list[0]?.value || 1
    return (
      <ul className="space-y-3">
        {list.map((item, idx) => (
          <li
            key={item.username}
            className="animate-fade-in-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-sm">{idx + 1}</span>
              <Avatar username={item.username} />
              <span className="flex-1 text-sm">{maskUsername(item.username, user)}</span>
              <span className="text-sm font-medium flex items-center gap-1">
                {formatter(item)} {medal(idx)}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-blue-light" style={{width: `${(item.value / maxValue) * 100}%`}}></div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="py-8">
      <section className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold">{t('hallOfFame.title')}</h1>
        <p className="text-white/70 mt-4 max-w-md">{t('hallOfFame.tagline')}</p>
        <div className="mt-8 flex gap-3">
          <button onClick={() => setSeason('week')}
            className={`px-4 py-2 rounded-xl transition ${
              season==='week' ? 'bg-blue text-white' : 'bg-white/10 hover:bg-white/20'
            }`}>
            {t('hallOfFame.currentWeek')}
          </button>
          <button onClick={() => setSeason('month')}
            className={`px-4 py-2 rounded-xl transition ${
              season==='month' ? 'bg-blue text-white' : 'bg-white/10 hover:bg-white/20'
            }`}>
            {t('hallOfFame.currentMonth')}
          </button>
          <button onClick={() => setSeason('all')}
            className={`px-4 py-2 rounded-xl transition ${
              season==='all' ? 'bg-blue text-white' : 'bg-white/10 hover:bg-white/20'
            }`}>
            {t('hallOfFame.allTime')}
          </button>
        </div>
      </section>

      {/* Season Champions */}
      {stats.mostTickets[0] || stats.mostWins[0] || stats.luckiest[0] ? (
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {stats.mostTickets[0] && (
            <div className="glass rounded-2xl p-4 flex flex-col items-center shadow-glow animate-fade-in-up">
              <Avatar username={stats.mostTickets[0].username} />
              <div className="mt-2 font-semibold flex items-center gap-1">
                {maskUsername(stats.mostTickets[0].username, user)} <span>🥇</span>
              </div>
              <div className="text-sm text-white/60">{t('hallOfFame.championMostTickets')}</div>
            </div>
          )}
          {stats.mostWins[0] && (
            <div className="glass rounded-2xl p-4 flex flex-col items-center shadow-glow animate-fade-in-up">
              <Avatar username={stats.mostWins[0].username} />
              <div className="mt-2 font-semibold flex items-center gap-1">
                {maskUsername(stats.mostWins[0].username, user)} <span>🥇</span>
              </div>
              <div className="text-sm text-white/60">{t('hallOfFame.championMostWins')}</div>
            </div>
          )}
          {stats.luckiest[0] && (
            <div className="glass rounded-2xl p-4 flex flex-col items-center shadow-glow animate-fade-in-up">
              <Avatar username={stats.luckiest[0].username} />
              <div className="mt-2 font-semibold flex items-center gap-1">
                {maskUsername(stats.luckiest[0].username, user)} <span>🥇</span>
              </div>
              <div className="text-sm text-white/60">{t('hallOfFame.championLuckiest')}</div>
            </div>
          )}
        </section>
      ) : (
        <div className="text-center text-white/60 mt-10">{t('hallOfFame.noChampions')}</div>
      )}

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="glass rounded-2xl p-6 border border-white/10 shadow-glow">
          <h3 className="font-semibold mb-4">🎟️ {t('hallOfFame.mostTickets')}</h3>
          {renderList(stats.mostTickets, i => i.value)}
        </div>
        <div className="glass rounded-2xl p-6 border border-white/10 shadow-glow">
          <h3 className="font-semibold mb-4">🏆 {t('hallOfFame.mostWins')}</h3>
          {renderList(stats.mostWins, i => i.value)}
        </div>
        <div className="glass rounded-2xl p-6 border border-white/10 shadow-glow">
          <h3 className="font-semibold mb-4" title="Must have at least 5 tickets to qualify">🍀 {t('hallOfFame.luckiest')}</h3>
          {renderList(stats.luckiest, i => `${Math.round(i.value * 100)}%`)}
        </div>
      </section>
    </div>
  )
}

