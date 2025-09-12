
import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRaffles } from '../context/RaffleContext'
import { useNotify } from '../context/NotificationContext'

export default function Admin() {
  const { user, getAllUsers } = useAuth()
  const { raffles, upsertRaffle, endRaffleManually } = useRaffles()
  const { notify } = useNotify()
  const [tab, setTab] = useState('raffles')

  if (!user || !user.isAdmin) return <Navigate to="/auth" replace />

  return (
    <div className="py-8 space-y-6">
      <div className="glass p-4 rounded-2xl flex items-center gap-2">
        <button className={"px-3 py-1.5 rounded-xl " + (tab==='raffles'?'bg-blue-light':'bg-white/10')} onClick={()=>setTab('raffles')}>Raffles</button>
        <button className={"px-3 py-1.5 rounded-xl " + (tab==='users'?'bg-blue-light':'bg-white/10')} onClick={()=>setTab('users')}>Users</button>
        <button className={"px-3 py-1.5 rounded-xl " + (tab==='analytics'?'bg-blue-light':'bg-white/10')} onClick={()=>setTab('analytics')}>Analytics</button>
      </div>
      {tab==='raffles' && <RafflesAdmin raffles={raffles} onSave={(r)=>{upsertRaffle(r); notify('Raffle saved')}} onEnd={(id)=>{endRaffleManually(id); notify('Raffle ended')}} />}
      {tab==='users' && <UsersAdmin users={getAllUsers()} />}
      {tab==='analytics' && <AnalyticsAdmin raffles={raffles} />}
    </div>
  )
}

function RafflesAdmin({ raffles, onSave, onEnd }) {
  const [editing, setEditing] = useState(null)
  const blank = { title:'', image:'', description:'', value:0, ticketPrice:1, totalTickets:100, endsAt: Date.now()+86400000, category:'General' }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Manage Raffles</h3>
        <button className="px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light" onClick={()=>setEditing(blank)}>+ New Raffle</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {raffles.map(r => (
          <div key={r.id} className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-2">
            <div className="font-semibold">{r.title}</div>
            <div className="text-sm text-white/70">Sold {r.sold}/{r.totalTickets} • Ticket ${r.ticketPrice}</div>
            <div className="text-sm">Ends: {new Date(r.endsAt).toLocaleString()}</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20" onClick={()=>setEditing(r)}>Edit</button>
              <button disabled={r.ended} className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light disabled:opacity-50" onClick={()=>onEnd(r.id)}>{r.ended?'Ended':'End Now'}</button>
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
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-2xl p-6 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">{form.id?'Edit Raffle':'New Raffle'}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 col-span-2" placeholder="Title" value={form.title} onChange={e=>set('title', e.target.value)} />
          <input className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 col-span-2" placeholder="Image URL" value={form.image} onChange={e=>set('image', e.target.value)} />
          <textarea className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 col-span-2" placeholder="Description" value={form.description} onChange={e=>set('description', e.target.value)} />
          <input type="number" className="bg-black/30 border border-white/10 rounded-xl px-3 py-2" placeholder="Value" value={form.value} onChange={e=>set('value', parseFloat(e.target.value||0))} />
          <input type="number" className="bg-black/30 border border-white/10 rounded-xl px-3 py-2" placeholder="Ticket Price" value={form.ticketPrice} onChange={e=>set('ticketPrice', parseFloat(e.target.value||0))} />
          <input type="number" className="bg-black/30 border border-white/10 rounded-xl px-3 py-2" placeholder="Total Tickets" value={form.totalTickets} onChange={e=>set('totalTickets', parseInt(e.target.value||0,10))} />
          <input type="datetime-local" className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 col-span-2" value={new Date(form.endsAt).toISOString().slice(0,16)} onChange={e=>set('endsAt', new Date(e.target.value).getTime())} />
          <input className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 col-span-2" placeholder="Category" value={form.category||'General'} onChange={e=>set('category', e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light" onClick={()=>onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  )
}

function UsersAdmin({ users }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-semibold">Users</h3>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-white/70">
            <tr>
              <th className="text-left p-2">Username</th>
              <th className="text-left p-2">Balance</th>
              <th className="text-left p-2">Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.username} className="border-t border-white/10">
                <td className="p-2">{u.username}</td>
                <td className="p-2">${(u.balance||0).toFixed(2)}</td>
                <td className="p-2">{u.isAdmin?'Yes':'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AnalyticsAdmin({ raffles }) {
  const totalTickets = useMemo(()=>raffles.reduce((s,r)=>s+r.sold,0),[raffles])
  const revenue = useMemo(()=>raffles.reduce((s,r)=>s + r.sold * r.ticketPrice, 0),[raffles])
  const byCat = useMemo(()=>{
    const m = {}
    raffles.forEach(r => { m[r.category] = (m[r.category]||0) + r.sold })
    return Object.entries(m).sort((a,b)=>b[1]-a[1])
  },[raffles])
  const top = useMemo(()=>{
    return [...raffles].sort((a,b)=>b.sold - a.sold)[0]
  },[raffles])

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-semibold">Analytics</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Tickets Sold" value={totalTickets} />
        <StatCard title="Revenue (demo)" value={"$"+revenue.toFixed(2)} />
        <StatCard title="Top Raffle" value={top?top.title:'—'} />
      </div>
      <div>
        <h4 className="mt-4 font-semibold">Popular Categories</h4>
        <div className="mt-2 space-y-2">
          {byCat.map(([cat, n])=>(
            <div key={cat} className="flex items-center gap-3">
              <div className="w-40">{cat}</div>
              <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden"><div className="h-2 bg-blue-light" style={{width: (n/Math.max(1,totalTickets))*100 + '%'}}></div></div>
              <div className="w-16 text-right">{n}</div>
            </div>
          ))}
          {byCat.length===0 && <div className="text-white/60">No data yet.</div>}
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
