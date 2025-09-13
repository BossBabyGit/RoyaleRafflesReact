
import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRaffles } from '../context/RaffleContext'
import { useNotify } from '../context/NotificationContext'
import DepositModal from '../components/DepositModal'
import { useTranslation } from 'react-i18next'
import badges from '../data/badges'
import BadgeGallery from '../components/BadgeGallery'

export default function Dashboard() {
  const { getProfile, updateProfile } = useAuth()
  const { raffles } = useRaffles()
  const [amt, setAmt] = useState(10)
  const [showDeposit, setShowDeposit] = useState(false)
  const { notify, log } = useNotify()
  const profile = getProfile()
  const { t } = useTranslation()

  const earnedBadges = useMemo(() => {
    return badges.filter((b) => b.criteria(profile, raffles)).map((b) => b.id)
  }, [profile, raffles])

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

  const openDeposit = () => {
    const a = parseFloat(amt || 0)
    if (a <= 0) return
    setShowDeposit(true)
  }

  const handleDepositSuccess = (a) => {
    updateProfile(u => ({
      ...u,
      balance: u.balance + a,
      deposits: [...(u.deposits || []), { id: Date.now(), amount: a, date: new Date().toISOString() }]
    }))
    notify(`Added $${a.toFixed(2)} to your balance`)
    log({ type: 'topup', user: profile.username, amount: a })
  }

  return (
    <div className="py-8 space-y-8">
      <section className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold">{t('dashboard.myWallet')}</h2>
        <div className="mt-2 text-white/80">{t('dashboard.currentBalance')} <b className="text-blue-light">${profile.balance.toFixed(2)}</b></div>
        <div className="mt-3 flex items-center gap-2">
          <input type="number" min="1" value={amt} onChange={e=>setAmt(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl px-3 py-2"/>
          <button onClick={openDeposit} className="px-4 py-2 rounded-xl bg-blue hover:bg-blue-light">{t('dashboard.topUp')}</button>
        </div>
        <div className="mt-4 space-y-1 text-sm text-white/70">
          {(profile.deposits || []).map(d => (
            <div key={d.id} className="flex justify-between border-b border-white/10 pb-1">
              <span>{new Date(d.date).toLocaleString()}</span>
              <span className="text-blue-light">${d.amount.toFixed(2)}</span>
            </div>
          ))}
          {(!profile.deposits || profile.deposits.length === 0) && <div className="text-white/60">{t('dashboard.noDeposits')}</div>}
        </div>
      </section>

      <BadgeGallery earned={earnedBadges} username={profile.username} />

      <section className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold">{t('dashboard.activeEntries')}</h3>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myActive.map(r => (
            <div key={r.id} className="p-4 border border-white/10 rounded-xl bg-black/20">
              <div className="flex items-center gap-3">
                <img src={r.image} className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-sm text-white/70">{t('dashboard.yourTickets')} <b>{profile.entries[r.id]}</b></div>
                </div>
              </div>
            </div>
          ))}
          {myActive.length===0 && <div className="text-white/60">{t('dashboard.noActiveEntries')}</div>}
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold">{t('dashboard.endedRaffles')}</h3>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEnded.map(r => (
            <div key={r.id} className="p-4 border border-white/10 rounded-xl bg-black/20">
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-white/70">{t('dashboard.yourTickets')} <b>{profile.entries[r.id]}</b></div>
              <div className="text-sm mt-1">{t('dashboard.winner')} <b className={r.winner===profile.username?"text-blue-light":"text-white/80"}>{r.winner || "TBD"}</b></div>
            </div>
          ))}
          {myEnded.length===0 && <div className="text-white/60">{t('dashboard.noEnded')}</div>}
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold">{t('dashboard.wins')}</h3>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myWins.map(r => (
            <div key={r.id} className="p-4 border border-white/10 rounded-xl bg-black/20">
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-white/70">{t('dashboard.youWon')}</div>
            </div>
          ))}
          {myWins.length===0 && <div className="text-white/60">{t('dashboard.noWins')}</div>}
        </div>
      </section>
      {showDeposit && (
        <DepositModal
          amount={parseFloat(amt)}
          onClose={() => setShowDeposit(false)}
          onSuccess={(a) => { handleDepositSuccess(a); setShowDeposit(false) }}
        />
      )}
    </div>
  )
}
