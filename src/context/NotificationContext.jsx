
import { createContext, useContext, useEffect, useState } from 'react'

const NotifCtx = createContext(null)

function loadActivity() {
  const raw = localStorage.getItem('rr_activity')
  return raw ? JSON.parse(raw) : []
}
function saveActivity(list) {
  localStorage.setItem('rr_activity', JSON.stringify(list))
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [activity, setActivity] = useState(loadActivity())

  const notify = (msg, kind='info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, msg, kind }])
    setTimeout(()=>{
      setToasts(t => t.filter(x => x.id !== id))
    }, 3500)
  }

  const log = (entry) => {
    const e = { id: Math.random().toString(36).slice(2), time: Date.now(), ...entry }
    setActivity(a => {
      const next = [e, ...a].slice(0, 200)
      saveActivity(next)
      return next
    })
  }

  const clearActivity = () => {
    setActivity([])
    saveActivity([])
  }

  return (
    <NotifCtx.Provider value={{ notify, activity, log, clearActivity }}>
      {children}
      <div className="fixed top-16 right-4 z-[100] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={"px-4 py-2 rounded-xl shadow-glow border " + (t.kind==='error'?'bg-red-500/20 border-red-400/40':'bg-black/60 border-white/10')}>
            <div className="text-sm">{t.msg}</div>
          </div>
        ))}
      </div>
    </NotifCtx.Provider>
  )
}

export function useNotify() {
  return useContext(NotifCtx)
}
