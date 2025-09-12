
import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRaffles } from '../context/RaffleContext'
  import { useNotify } from '../context/NotificationContext'
  import ActivityFeed from '../components/ActivityFeed'

export default function Dashboard() {
  const { getProfile, updateProfile } = useAuth()
  const { raffles } = useRaffles()
  const [amt, setAmt] = useState(10)
  const { notify, log } = useNotify()
    const profile = getProfile()

  const myActive = useMemo(()=>{
    const ids = Object.keys(profile.entries || {}).map(n=>parseInt(n,10))
    return raffles.filter(r => ids.includes(r.id) && !r.ended)
  }, [profile, raffles])

  const myEnded = useMemo(()=>{
    const ids = Object.keys(profile.entries || {}).map(n=>parseInt(n,10))
    return raffles.filter(r => ids.includes(r.id) && r.ended)
  }, [profile, raffles])

  const myWins = useMemo(()=>{
    return raffles.filter(r => r.ended && r.winner === profile.username)
  }, [profile, raffles])

  const topup = () => {
    const a = parseFloat(amt || 0)
    if (a <= 0) return
    updateProfile(u => ({ ...u, balance: u.balance + a })); notify(`Added $${a.toFixed(2)} to your balance`); log({ type:'topup', user: profile.username, amount: a })
  }

  return (
    <div className="py-8 space-y-8">
      <section className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold">My Wallet</h2>
        <div className="mt-2 text-white/80">Current Balance: <b className="text-blue-light">${profile.balance.toFixed(2)}</b></div>
        <div className="mt-3 flex items-center gap-2">
          <input type="number" min="1" value={amt} onChange={e=>setAmt(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl px-3 py-2"/>
          <button onClick={topup} className="px-4 py-2 rounded-xl bg-blue hover:bg-blue-light">Top up</button>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold">Active Entries</h3>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myActive.map(r => (
            <div key={r.id} className="p-4 border border-white/10 rounded-xl bg-black/20">
              <div className="flex items-center gap-3">
                <img src={r.image} className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-sm text-white/70">Your tickets: <b>{profile.entries[r.id]}</b></div>
                </div>
              </div>
            </div>
          ))}
          {myActive.length===0 && <div className="text-white/60">No active entries yet.</div>}
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold">Ended Raffles</h3>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEnded.map(r => (
            <div key={r.id} className="p-4 border border-white/10 rounded-xl bg-black/20">
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-white/70">Your tickets: <b>{profile.entries[r.id]}</b></div>
              <div className="text-sm mt-1">Winner: <b className={r.winner===profile.username?"text-blue-light":"text-white/80"}>{r.winner || "TBD"}</b></div>
            </div>
          ))}
          {myEnded.length===0 && <div className="text-white/60">No ended raffles yet.</div>}
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold">Wins</h3>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myWins.map(r => (
            <div key={r.id} className="p-4 border border-white/10 rounded-xl bg-black/20">
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-white/70">You won this raffle! 🎉</div>
            </div>
          ))}
          {myWins.length===0 && <div className="text-white/60">No wins yet. Good luck!</div>}
        </div>
      </section>
    </div>
  )
}
