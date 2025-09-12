
import { useNotify } from '../context/NotificationContext'
import { useRaffles } from '../context/RaffleContext'

function timeAgo(t) {
  const d = Date.now() - t
  const s = Math.floor(d/1000)
  if (s<60) return s + 's ago'
  const m = Math.floor(s/60)
  if (m<60) return m + 'm ago'
  const h = Math.floor(m/60)
  if (h<24) return h + 'h ago'
  const dd = Math.floor(h/24)
  return dd + 'd ago'
}

export default function ActivityFeed() {
  const { activity, clearActivity } = useNotify()
  const { raffles } = useRaffles()

  const getR = id => raffles.find(r => r.id === id)

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Activity</h3>
        <button className="text-sm px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20" onClick={clearActivity}>Clear</button>
      </div>
      <div className="mt-4 space-y-3 max-h-80 overflow-auto">
        {activity.length ? activity.map(a => (
          <div key={a.id} className="p-3 rounded-xl bg-black/20 border border-white/10 text-sm flex items-center justify-between">
            <div>
              {a.type==='purchase' && <span><b>{a.user}</b> bought <b>{a.count}</b> ticket(s) for <b>{getR(a.raffleId)?.title||'#'+a.raffleId}</b></span>}
              {a.type==='topup' && <span><b>{a.user}</b> topped up <b>${a.amount?.toFixed?.(2)||a.amount}</b></span>}
              {a.type==='raffle_end' && <span>Raffle <b>{getR(a.raffleId)?.title||'#'+a.raffleId}</b> ended. Winner: <b>{a.winner}</b></span>}
              {a.type==='raffle_end_manual' && <span>Admin ended <b>{getR(a.raffleId)?.title||'#'+a.raffleId}</b>. Winner: <b>{a.winner||'None'}</b></span>}
            </div>
            <div className="text-white/50">{timeAgo(a.time)}</div>
          </div>
        )) : <div className="text-white/60">No recent activity.</div>}
      </div>
    </div>
  )
}
