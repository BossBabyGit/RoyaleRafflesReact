import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotificationContext'
import { useTranslation } from 'react-i18next'

// Lightweight confetti helper using emoji burst
function confetti() {
  const el = document.createElement('div')
  el.className = 'fixed inset-0 pointer-events-none flex items-center justify-center z-[200] text-6xl animate-bounce'
  el.textContent = '🎉'
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2000)
}

function Countdown({ endsAt, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(() => endsAt - Date.now())

  useEffect(() => {
    if (timeLeft <= 0) return
    const id = setInterval(() => {
      const next = endsAt - Date.now()
      if (next <= 0) {
        clearInterval(id)
        setTimeLeft(0)
        onEnd?.()
      } else {
        setTimeLeft(next)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [endsAt, onEnd, timeLeft])

  const format = (ms) => {
    const total = Math.max(ms, 0)
    const d = Math.floor(total / (1000 * 60 * 60 * 24))
    const h = Math.floor(total / (1000 * 60 * 60)) % 24
    const m = Math.floor(total / (1000 * 60)) % 60
    const s = Math.floor(total / 1000) % 60
    return `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return <span>{format(timeLeft)}</span>
}

function OptionCard({ option, selected, onVote, disabled }) {
  const { t } = useTranslation()
  return (
    <div className="glass rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative">
      {option.image ? (
        <img src={option.image} alt={option.label} className="w-32 h-32 object-cover rounded-xl" />
      ) : (
        <div className="w-32 h-32 flex items-center justify-center text-5xl">🎁</div>
      )}
      <div className="font-semibold">{option.label}</div>
      <button
        onClick={() => onVote(option.id)}
        disabled={disabled}
        aria-label={t('communityVote.voteFor', { option: option.label })}
        className={
          'px-4 py-1.5 rounded-xl transition ' +
          (selected ? 'bg-claret hover:bg-claret-light' : 'bg-blue hover:bg-blue-light') +
          (disabled ? ' opacity-50 cursor-not-allowed' : '')
        }
      >
        {selected ? t('communityVote.changeVote') : t('communityVote.vote')}
      </button>
    </div>
  )
}

function Results({ options, tallies, totalVotes, winningOptionId, closed }) {
  return (
    <div className="space-y-4">
      {options.map((opt) => {
        const votes = tallies[opt.id] || 0
        const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
        return (
          <div key={opt.id}>
            <div className="flex justify-between text-sm mb-1">
              <div className="flex items-center gap-1">
                {closed && winningOptionId === opt.id && <span>👑</span>}
                <span className="text-white/80">{opt.label}</span>
              </div>
              <span className="text-white/80">{votes} ({pct.toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className={
                  'h-full transition-all duration-700 ' +
                  (closed && winningOptionId === opt.id ? 'bg-blue-light' : 'bg-blue')
                }
                style={{ width: pct + '%' }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function CommunityVote() {
  const { user } = useAuth()
  const { notify, log } = useNotify()
  const { t } = useTranslation()

  const poll = {
    id: 'poll_001',
    title: 'What prize should we raffle next?',
    endsAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
    options: [
      { id: 'ps5', label: 'PS5', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/PlayStation_5.png' },
      { id: 'iphone', label: 'iPhone 15', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/IPhone_15_Pink.svg' },
      { id: 'cash', label: 'Cash Prize', image: 'https://upload.wikimedia.org/wikipedia/commons/1/12/US_one_hundred_dollar_bill%2C_obverse%2C_series_2009.jpg' },
      { id: 'switch', label: 'Nintendo Switch', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Nintendo_Switch_%28White%29.png' }
    ]
  }

  const storageKey = `rr_poll_votes_${poll.id}`
  const [votes, setVotes] = useState({})
  const [voterId, setVoterId] = useState('')
  const [closed, setClosed] = useState(Date.now() >= poll.endsAt)
  const [winning, setWinning] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    setVotes(raw ? JSON.parse(raw) : {})
  }, [])

  useEffect(() => {
    if (user) setVoterId(user.username)
    else {
      let g = sessionStorage.getItem('rr_guest_id')
      if (!g) {
        g = 'guest-' + Math.random().toString(36).slice(2, 8)
        sessionStorage.setItem('rr_guest_id', g)
      }
      setVoterId(g)
    }
  }, [user])

  const selected = votes[voterId]

  const tallies = useMemo(() => {
    const t = {}
    Object.values(votes).forEach((v) => {
      t[v] = (t[v] || 0) + 1
    })
    return t
  }, [votes])
  const totalVotes = Object.values(tallies).reduce((a, b) => a + b, 0)

  useEffect(() => {
    if (closed) {
      const win = poll.options.reduce(
        (best, opt) => ((tallies[opt.id] || 0) > (tallies[best] || 0) ? opt.id : best),
        poll.options[0]?.id
      )
      setWinning(win)
    }
  }, [closed, tallies, poll.options])

  const castVote = (optionId) => {
    if (closed) return
    const optionLabel = poll.options.find((o) => o.id === optionId)?.label
    setVotes((v) => {
      const next = { ...v, [voterId]: optionId }
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
    notify(t('communityVote.youVoted', { option: optionLabel }))
    log({ type: 'vote', pollId: poll.id, voter: voterId, option: optionId })
  }

  const handleEnd = () => {
    if (closed) return
    setClosed(true)
    const win = poll.options.reduce(
      (best, opt) => ((tallies[opt.id] || 0) > (tallies[best] || 0) ? opt.id : best),
      poll.options[0]?.id
    )
    setWinning(win)
    confetti()
    log({ type: 'poll-ended', pollId: poll.id, winner: win })
    const label = poll.options.find((o) => o.id === win)?.label
    notify(t('communityVote.winner', { option: label }))
  }

  return (
    <div className="py-8">
      {/* HERO */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold">{t('communityVote.title')}</h1>
        <p className="text-white/70 max-w-xl">{poll.title}</p>
        {!closed ? (
          <div className="text-xl">
            {t('communityVote.pollEndsIn')} <Countdown endsAt={poll.endsAt} onEnd={handleEnd} />
          </div>
        ) : (
          <div className="text-xl">{t('communityVote.votingClosed')}</div>
        )}
      </section>

      {/* OPTIONS */}
      {poll.options.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {poll.options.map((opt) => (
              <OptionCard
                key={opt.id}
                option={opt}
                selected={selected === opt.id}
                onVote={castVote}
                disabled={closed}
              />
            ))}
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span>Results updating live</span>
            </div>
            <Results
              options={poll.options}
              tallies={tallies}
              totalVotes={totalVotes}
              winningOptionId={winning}
              closed={closed}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-white/60 mt-8">No options available.</div>
      )}
    </div>
  )
}

