import { createContext, useContext, useState } from 'react'

const AuditCtx = createContext(null)

function loadLogs() {
  const raw = localStorage.getItem('rr_audit')
  return raw ? JSON.parse(raw) : []
}

function saveLogs(list) {
  localStorage.setItem('rr_audit', JSON.stringify(list))
}

export function AuditProvider({ children }) {
  const [logs, setLogs] = useState(loadLogs())

  const log = (entry) => {
    const e = { id: Math.random().toString(36).slice(2), timestamp: Date.now(), ...entry }
    setLogs(curr => {
      const next = [e, ...curr].slice(0, 200)
      saveLogs(next)
      return next
    })
  }

  const clear = () => {
    setLogs([])
    saveLogs([])
  }

  return (
    <AuditCtx.Provider value={{ logs, log, clear }}>
      {children}
    </AuditCtx.Provider>
  )
}

export function useAudit() {
  return useContext(AuditCtx)
}

