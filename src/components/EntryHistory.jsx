import { useAuth } from '../context/AuthContext'

export default function EntryHistory() {
  const { getProfile } = useAuth()
  const profile = getProfile()
  const history = profile?.history || []

  return (
    <div className="mt-4 space-y-1 text-sm text-white/70">
      {history.map((h) => (
        <div key={h.id} className="flex justify-between border-b border-white/10 pb-1">
          <span>{h.title}</span>
          <span className="text-white">{h.count}</span>
          <span>{new Date(h.date).toLocaleString()}</span>
        </div>
      ))}
      {history.length === 0 && <div className="text-white/60">No purchases yet.</div>}
    </div>
  )
}
