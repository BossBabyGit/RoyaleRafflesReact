export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const COLORS = [
  'bg-pink-500/30 text-pink-200',
  'bg-blue-500/30 text-blue-200',
  'bg-green-500/30 text-green-200',
  'bg-yellow-500/30 text-yellow-200',
  'bg-purple-500/30 text-purple-200',
  'bg-red-500/30 text-red-200',
  'bg-teal-500/30 text-teal-200',
]

export function colorFor(name) {
  let hash = 0
  for (const ch of name) hash = (hash + ch.charCodeAt(0)) % COLORS.length
  return COLORS[hash]
}

export default function Message({ message, self }) {
  const color = colorFor(message.author)
  return (
    <div className={`flex mb-2 ${self ? 'justify-end' : 'justify-start'}`}>
      {!self && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 text-xs font-bold border border-white/10 ${color}`}>
          {message.author[0].toUpperCase()}
        </div>
      )}
      <div className={`max-w-[75%] rounded-xl px-3 py-1 bg-black/30 border border-white/10 ${self ? 'ml-auto text-right' : ''}`}>
        <div className="text-[10px] opacity-70 flex justify-between gap-2">
          <span>{message.author}</span>
          <span>{formatTime(message.ts)}</span>
        </div>
        <div className="whitespace-pre-wrap break-words text-sm">{message.text}</div>
      </div>
      {self && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 text-xs font-bold border border-white/10 ${color}`}>
          {message.author[0].toUpperCase()}
        </div>
      )}
    </div>
  )
}

