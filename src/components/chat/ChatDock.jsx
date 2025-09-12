import { useEffect, useRef, useState } from 'react'
import { useChat } from '../../context/ChatContext'
import { useAuth } from '../../context/AuthContext'
import Message from './Message'

export default function ChatDock() {
  const { rooms, messagesByRoom, activeRoomId, collapsed, unreadCounts, setCollapsed, setActiveRoom, sendMessage } = useChat()
  const { user } = useAuth()

  const [guest, setGuest] = useState('')
  useEffect(() => {
    if (!user) {
      let g = sessionStorage.getItem('rr_guest_id')
      if (!g) {
        g = 'guest-' + Math.floor(Math.random() * 9000 + 1000)
        sessionStorage.setItem('rr_guest_id', g)
      }
      setGuest(g)
    }
  }, [user])

  const username = user?.username || guest

  const messages = messagesByRoom[activeRoomId] || []
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, activeRoomId])

  const [input, setInput] = useState('')
  const handleSend = () => {
    if (!input.trim()) return
    sendMessage({ roomId: activeRoomId, author: username, text: input.trim() })
    setInput('')
  }
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  const [typing, setTyping] = useState(false)
  const typingTimeout = useRef()
  const handleFocus = () => {
    setTyping(true)
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => setTyping(false), 2000)
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 sm:right-4 sm:bottom-4 bg-black/30 border border-white/10 rounded-full px-4 py-2 shadow-glow flex items-center gap-2"
      >
        <span>Chat \uD83D\uDCAC</span>
        {totalUnread > 0 && <span className="bg-red-500 text-white rounded-full px-2 text-xs">{totalUnread}</span>}
      </button>
    )
  }

  return (
    <div className="fixed z-50 inset-y-0 right-0 w-full sm:w-[360px] bg-black/30 border-l border-white/10 p-3 shadow-glow flex flex-col">
      <div className="flex items-center gap-1 mb-2">
        {rooms.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRoom(r.id)}
            className={`px-3 py-1 rounded-xl text-sm ${r.id === activeRoomId ? 'bg-blue-light text-darker' : 'bg-white/10'}`}
          >
            {r.name}
            {unreadCounts[r.id] > 0 && r.id !== activeRoomId && (
              <span className="ml-1 text-xs">{unreadCounts[r.id]}</span>
            )}
          </button>
        ))}
        <button onClick={() => setCollapsed(true)} className="ml-auto px-2 py-1 rounded-xl bg-white/10">×</button>
      </div>
      <div className="flex-1 overflow-y-auto mb-2 space-y-1" role="log" aria-live="polite">
        {messages.length === 0 && (
          <div className="text-sm opacity-70 text-center mt-4">Say hi to start the conversation!</div>
        )}
        {messages.map((m) => (
          <Message key={m.id} message={m} self={m.author === username} />
        ))}
        <div ref={bottomRef} />
      </div>
      {typing && (
        <div className="text-xs italic mb-1 text-center">
          <span className="animate-pulse mr-1">\u2022</span>Several users are typing…
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onFocus={handleFocus}
          rows={1}
          className="flex-1 resize-none rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-light"
        />
        <button
          onClick={handleSend}
          className="px-3 py-2 rounded-xl bg-blue-light text-darker disabled:opacity-50"
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}

