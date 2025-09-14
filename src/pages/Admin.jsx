
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRaffles } from '../context/RaffleContext'
import { useNotify } from '../context/NotificationContext'
import { useTranslation } from 'react-i18next'

export default function Admin() {
  const { getAllUsers, hasRole } = useAuth()
  const { raffles, upsertRaffle, endRaffleManually } = useRaffles()
  const { notify } = useNotify()
  const [tab, setTab] = useState('raffles')
  const { t } = useTranslation()

  if (!hasRole('admin')) return <Navigate to="/auth" replace />

  return (
    <div className="py-8 space-y-6">
      <div className="glass p-4 rounded-2xl flex items-center gap-2">
        <button className={"px-3 py-1.5 rounded-xl " + (tab==='raffles'?'bg-blue-light':'bg-white/10')} onClick={()=>setTab('raffles')}>{t('admin.raffles')}</button>
        <button className={"px-3 py-1.5 rounded-xl " + (tab==='users'?'bg-blue-light':'bg-white/10')} onClick={()=>setTab('users')}>{t('admin.users')}</button>
        <button className={"px-3 py-1.5 rounded-xl " + (tab==='analytics'?'bg-blue-light':'bg-white/10')} onClick={()=>setTab('analytics')}>{t('admin.analytics')}</button>
      </div>
      {tab==='raffles' && <RafflesAdmin raffles={raffles} onSave={(r)=>{upsertRaffle(r); notify('Raffle saved')}} onEnd={(id)=>{endRaffleManually(id); notify('Raffle ended')}} />}
      {tab==='users' && <UsersAdmin users={getAllUsers()} />}
      {tab==='analytics' && <AnalyticsAdmin raffles={raffles} users={getAllUsers()} />}
    </div>
  )
}

function RafflesAdmin({ raffles, onSave, onEnd }) {
  const [editing, setEditing] = useState(null)
  const { t } = useTranslation()
  const blank = { title:'', image:'', description:'', value:0, ticketPrice:1, totalTickets:100, endsAt: Date.now()+86400000, category:'General' }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{t('admin.manageRaffles')}</h3>
        <button className="px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light" onClick={()=>setEditing(blank)}>{t('admin.newRaffle')}</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {raffles.map(r => (
          <div key={r.id} className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-2">
            <div className="font-semibold">{r.title}</div>
            <div className="text-sm text-white/70">Sold {r.sold}/{r.totalTickets} • Ticket ${r.ticketPrice}</div>
            <div className="text-sm">Ends: {new Date(r.endsAt).toLocaleString()}</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20" onClick={()=>setEditing(r)}>{t('admin.edit')}</button>
              <button disabled={r.ended} className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light disabled:opacity-50" onClick={()=>onEnd(r.id)}>{r.ended?t('admin.ended'):t('admin.endNow')}</button>
            </div>
          </div>
        ))}
      </div>
      {editing && <RaffleEditor data={editing} onClose={()=>setEditing(null)} onSave={(d)=>{onSave(d); setEditing(null)}}/>}
    </div>
  )
}

function RaffleEditor({ data, onClose, onSave }) {
  const [form, setForm] = useState({ ...data })
  const { t } = useTranslation()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-2xl p-6 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">{form.id?t('admin.editRaffle'):t('admin.newRaffleTitle')}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label htmlFor="raffle-title" className="sr-only">{t('admin.title')}</label>
          <input
            id="raffle-title"
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 col-span-2"
            placeholder={t('admin.title')}
            aria-label={t('admin.title')}
            value={form.title}
            onChange={e=>set('title', e.target.value)}
          />
          <label htmlFor="raffle-image" className="sr-only">{t('admin.imageUrl')}</label>
          <input
            id="raffle-image"
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 col-span-2"
            placeholder={t('admin.imageUrl')}
            aria-label={t('admin.imageUrl')}
            value={form.image}
            onChange={e=>set('image', e.target.value)}
          />
          <label htmlFor="raffle-description" className="sr-only">{t('admin.description')}</label>
          <textarea
            id="raffle-description"
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 col-span-2"
            placeholder={t('admin.description')}
            aria-label={t('admin.description')}
            value={form.description}
            onChange={e=>set('description', e.target.value)}
          />
          <label htmlFor="raffle-value" className="sr-only">{t('admin.value')}</label>
          <input
            id="raffle-value"
            type="number"
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            placeholder={t('admin.value')}
            aria-label={t('admin.value')}
            value={form.value}
            onChange={e=>set('value', parseFloat(e.target.value||0))}
          />
          <label htmlFor="raffle-ticketPrice" className="sr-only">{t('admin.ticketPrice')}</label>
          <input
            id="raffle-ticketPrice"
            type="number"
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            placeholder={t('admin.ticketPrice')}
            aria-label={t('admin.ticketPrice')}
            value={form.ticketPrice}
            onChange={e=>set('ticketPrice', parseFloat(e.target.value||0))}
          />
          <label htmlFor="raffle-totalTickets" className="sr-only">{t('admin.totalTickets')}</label>
          <input
            id="raffle-totalTickets"
            type="number"
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            placeholder={t('admin.totalTickets')}
            aria-label={t('admin.totalTickets')}
            value={form.totalTickets}
            onChange={e=>set('totalTickets', parseInt(e.target.value||0,10))}
          />
          <label htmlFor="raffle-endsAt" className="sr-only">End Date</label>
          <input
            id="raffle-endsAt"
            type="datetime-local"
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 col-span-2"
            value={new Date(form.endsAt).toISOString().slice(0,16)}
            onChange={e=>set('endsAt', new Date(e.target.value).getTime())}
            aria-label="End Date"
          />
          <label htmlFor="raffle-category" className="sr-only">{t('admin.category')}</label>
          <input
            id="raffle-category"
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 col-span-2"
            placeholder={t('admin.category')}
            aria-label={t('admin.category')}
            value={form.category||'General'}
            onChange={e=>set('category', e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20" onClick={onClose}>{t('admin.cancel')}</button>
          <button className="px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light" onClick={()=>onSave(form)}>{t('admin.save')}</button>
        </div>
      </div>
    </div>
  )
}

function UsersAdmin({ users }) {
  const { t } = useTranslation()
  const { getAllUsers, updateUser, toggleAdmin, deleteUser } = useAuth()
  const { notify } = useNotify()
  const [list, setList] = useState(users)
  const [editing, setEditing] = useState(null)

  useEffect(() => setList(users), [users])

  const refresh = () => setList(getAllUsers())

  const handleSave = (username, updates) => {
    updateUser(username, updates)
    refresh()
    notify('User updated')
  }

  const handleToggle = (u) => {
    if (window.confirm(t('admin.confirmToggleAdmin'))) {
      toggleAdmin(u.username)
      refresh()
      notify('Admin status changed')
    }
  }

  const handleDelete = (u) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      deleteUser(u.username)
      refresh()
      notify('User deleted')
    }
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-semibold">{t('admin.users')}</h3>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-white/70">
            <tr>
              <th className="text-left p-2">{t('admin.username')}</th>
              <th className="text-left p-2">{t('admin.balance')}</th>
              <th className="text-left p-2">{t('admin.admin')}</th>
              <th className="text-left p-2">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map(u => (
              <tr key={u.username} className="border-t border-white/10">
                <td className="p-2">{u.username}</td>
                <td className="p-2">${(u.balance||0).toFixed(2)}</td>
                <td className="p-2">{u.roles?.includes('admin')?t('admin.yes'):t('admin.no')}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20" onClick={()=>setEditing(u)}>{t('admin.edit')}</button>
                    <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20" onClick={()=>handleToggle(u)}>{t('admin.toggleAdmin')}</button>
                    <button className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light" onClick={()=>handleDelete(u)}>{t('admin.delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <UserEditor
          data={editing}
          onClose={()=>setEditing(null)}
          onSave={(d)=>{handleSave(editing.username, d); setEditing(null)}}
        />
      )}
    </div>
  )
}

function UserEditor({ data, onClose, onSave }) {
  const { t } = useTranslation()
  const [balance, setBalance] = useState(data.balance || 0)
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-sm p-6 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">{t('admin.editUser')}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <label htmlFor="user-balance" className="sr-only">{t('admin.balance')}</label>
        <input
          id="user-balance"
          type="number"
          className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 w-full"
          placeholder={t('admin.balance')}
          aria-label={t('admin.balance')}
          value={balance}
          onChange={e=>setBalance(parseFloat(e.target.value||0))}
        />
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20" onClick={onClose}>{t('admin.cancel')}</button>
          <button className="px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light" onClick={()=>onSave({ balance })}>{t('admin.save')}</button>
        </div>
      </div>
    </div>
  )
}

function AnalyticsAdmin({ raffles, users = [] }) {
  // --- Aggregates ---
  const totalTickets = useMemo(
    () => raffles.reduce((s, r) => s + (r.sold || 0), 0),
    [raffles]
  )

  const revenue = useMemo(
    () => raffles.reduce((s, r) => s + (r.sold || 0) * (r.ticketPrice || 0), 0),
    [raffles]
  )

  const prizeCostTotal = useMemo(
    () => raffles.reduce((s, r) => s + (r.value || 0), 0),
    [raffles]
  )
  const prizeCostEnded = useMemo(
    () => raffles.filter(r => r.ended).reduce((s, r) => s + (r.value || 0), 0),
    [raffles]
  )

  const profitTotal = revenue - prizeCostTotal
  const profitEnded = revenue - prizeCostEnded

  const activeRaffles = raffles.filter(r => !r.ended).length
  const endedRaffles  = raffles.filter(r => r.ended).length

  // Popular categories (kept from your version)
  const byCat = useMemo(() => {
    const m = {}
    raffles.forEach(r => {
      m[r.category || 'General'] = (m[r.category || 'General'] || 0) + (r.sold || 0)
    })
    return Object.entries(m).sort((a,b)=>b[1]-a[1])
  }, [raffles])

  // --- User-level metrics ---
  const joinedUsers = useMemo(() => {
    return users.filter(u => {
      const entries = u?.entries || {}
      return Object.values(entries).some(v => (v || 0) > 0)
    })
  }, [users])

  // Demo heuristic for "topped up":
  // default registered balance is 100; if balance !== 100 OR they have entries, count as 'topped up'
  const toppedUpUsers = useMemo(() => {
    return users.filter(u => {
      const hasEntries = Object.values(u?.entries || {}).some(v => (v || 0) > 0)
      return (u.balance ?? 0) !== 100 || hasEntries
    })
  }, [users])

  const totalUsers = users.length
  const buyersCount = joinedUsers.length

  const totalTicketsByUsers = useMemo(() => {
    // Sum per-user entries across all raffles
    return users.reduce((sum, u) => {
      const entries = u?.entries || {}
      const mine = Object.values(entries).reduce((s, v) => s + (v || 0), 0)
      return sum + mine
    }, 0)
  }, [users])

  const avgTicketsPerUserOverall = totalUsers > 0 ? (totalTicketsByUsers / totalUsers) : 0
  const avgTicketsPerBuyer       = buyersCount > 0 ? (totalTicketsByUsers / buyersCount) : 0

  // --- Simple bar components (no external libs) ---
  const BarPair = ({ aLabel, aValue, bLabel, bValue, format = v => v }) => {
    const max = Math.max(aValue, bValue, 1)
    const aW = Math.round((aValue / max) * 100)
    const bW = Math.round((bValue / max) * 100)
    return (
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm text-white/80">
            <span>{aLabel}</span><span>{format(aValue)}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-1">
            <div className="h-2 bg-blue-light" style={{ width: `${aW}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-white/80">
            <span>{bLabel}</span><span>{format(bValue)}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-1">
            <div className="h-2 bg-claret" style={{ width: `${bW}%` }} />
          </div>
        </div>
      </div>
    )
  }

  const Funnel = ({ stages }) => {
    const max = Math.max(...stages.map(s => s.value), 1)
    return (
      <div className="space-y-3">
        {stages.map((s, idx) => {
          const w = Math.round((s.value / max) * 100)
          return (
            <div key={idx}>
              <div className="flex justify-between text-sm text-white/80">
                <span>{s.label}</span><span>{s.value}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                <div className="h-2 bg-white/60" style={{ width: `${w}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const currency = (n) => `$${(n || 0).toFixed(2)}`

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <h3 className="text-xl font-semibold">Analytics</h3>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Tickets Sold" value={totalTickets} />
        <StatCard title="Revenue (demo)" value={currency(revenue)} />
        <StatCard title="Prize Cost (all)" value={currency(prizeCostTotal)} />
        <StatCard title="Profit (all)" value={currency(profitTotal)} />

        <StatCard title="Avg Tickets / User" value={avgTicketsPerUserOverall.toFixed(2)} />
        <StatCard title="Avg Tickets / Buyer" value={avgTicketsPerBuyer.toFixed(2)} />
        <StatCard title="Active Raffles" value={activeRaffles} />
        <StatCard title="Ended Raffles" value={endedRaffles} />
      </div>

      {/* Revenue vs Cost */}
      <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Revenue vs. Prize Cost</h4>
          <div className="text-sm text-white/60">All raffles</div>
        </div>
        <BarPair
          aLabel="Revenue"
          aValue={revenue}
          bLabel="Prize Cost"
          bValue={prizeCostTotal}
          format={currency}
        />
        <div className="mt-4 text-xs text-white/60">
          Also tracking ended raffles only: <b>Profit (ended)</b> = {currency(profitEnded)} • <b>Prize Cost (ended)</b> = {currency(prizeCostEnded)}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Conversion Funnel</h4>
          <div className="text-sm text-white/60">Registered → Topped Up → Joined</div>
        </div>
        <Funnel stages={[
          { label: 'Registered', value: totalUsers },
          { label: 'Topped Up (demo)', value: toppedUpUsers.length },
          { label: 'Joined a Raffle', value: buyersCount },
        ]}/>
        <div className="mt-3 text-xs text-white/60">
          Demo heuristic: users with balance ≠ 100 or with entries are considered "topped up".
        </div>
      </div>

      {/* Popular Categories (kept) */}
      <div>
        <h4 className="mt-2 font-semibold">Popular Categories</h4>
        <div className="mt-2 space-y-2">
          {byCat.map(([cat, n]) => (
            <div key={cat} className="flex items-center gap-3">
              <div className="w-40">{cat}</div>
              <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="h-2 bg-blue-light" style={{ width: (n / Math.max(1, totalTickets)) * 100 + '%' }} />
              </div>
              <div className="w-16 text-right">{n}</div>
            </div>
          ))}
          {byCat.length === 0 && <div className="text-white/60">No data yet.</div>}
        </div>
      </div>
    </div>
  )
}


function StatCard({ title, value }) {
  return (
    <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
      <div className="text-white/70 text-sm">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  )
}
