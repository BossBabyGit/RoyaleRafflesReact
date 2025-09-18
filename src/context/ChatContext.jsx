import { createContext, useContext, useEffect, useState } from 'react'

const ChatCtx = createContext(null)
const STORAGE_KEY = 'rr_chat_state_v1'

const DEFAULT_ROOMS = [
  { id: 'lobby', name: 'Lobby' },
  { id: 'giveaways', name: 'Giveaways' },
  { id: 'winners', name: 'Winners' },
]

function seedMessages() {
  const now = Date.now()
  return {
    lobby: [
      { id: 'm1', author: 'alice', text: 'Anyone entering the iPhone raffle today?', ts: now - 1000 * 60 * 5 },
      { id: 'm2', author: 'bob', text: 'Just grabbed 5 tickets 🎟️', ts: now - 1000 * 60 * 4 },
    ],
    giveaways: [
      { id: 'm3', author: 'charlie', text: 'What\u2019s the next prize? PS5 or Cash?', ts: now - 1000 * 60 * 3 },
      { id: 'm4', author: 'host', text: 'Vote on the Community page!', ts: now - 1000 * 60 * 2 },
    ],
    winners: [
      { id: 'm5', author: 'alice', text: 'GG to the PS5 winner last night \uD83C\uDF89', ts: now - 1000 * 60 },
    ],
  }
}

export function ChatProvider({ children }) {
  const [state, setState] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw
      ? JSON.parse(raw)
      : {
          rooms: [],
          messagesByRoom: {},
          activeRoomId: 'lobby',
          collapsed: false,
          unreadCounts: {},
        }
  })

  const seedIfEmpty = () => {
    setState((s) => {
      if (s.rooms.length) return s
      const messages = seedMessages()
      const unread = {}
      DEFAULT_ROOMS.forEach((r) => (unread[r.id] = 0))
      return {
        rooms: DEFAULT_ROOMS,
        messagesByRoom: messages,
        activeRoomId: 'lobby',
        collapsed: false,
        unreadCounts: unread,
      }
    })
  }

  useEffect(() => {
    if (!state.rooms.length) seedIfEmpty()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const setCollapsed = (v) => setState((s) => ({ ...s, collapsed: v }))

  const setActiveRoom = (roomId) =>
    setState((s) => ({
      ...s,
      activeRoomId: roomId,
      unreadCounts: { ...s.unreadCounts, [roomId]: 0 },
    }))

  const sendMessage = ({ roomId, author, text }) =>
    setState((s) => {
      const msg = {
        id: Math.random().toString(36).slice(2),
        author,
        text,
        ts: Date.now(),
      }
      const messages = {
        ...s.messagesByRoom,
        [roomId]: [...(s.messagesByRoom[roomId] || []), msg],
      }
      const unread = { ...s.unreadCounts }
      if (s.collapsed || s.activeRoomId !== roomId) {
        unread[roomId] = (unread[roomId] || 0) + 1
      }
      return { ...s, messagesByRoom: messages, unreadCounts: unread }
    })

  return (
    <ChatCtx.Provider
      value={{
        ...state,
        setCollapsed,
        setActiveRoom,
        sendMessage,
        seedIfEmpty,
      }}
    >
      {children}
    </ChatCtx.Provider>
  )
}

export function useChat() {
  return useContext(ChatCtx)
}

