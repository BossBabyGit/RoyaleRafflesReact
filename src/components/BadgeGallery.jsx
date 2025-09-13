import badges from '../data/badges'

export default function BadgeGallery({ earned = [], username }) {
  const shareBadge = (badge) => {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 315
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.textAlign = 'center'
    ctx.font = '72px sans-serif'
    ctx.fillText(badge.icon, canvas.width / 2, 150)
    ctx.font = '28px sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`${username} earned ${badge.name}!`, canvas.width / 2, 250)
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `badges/${badge.id}/share.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="glass rounded-2xl p-6">
      <h3 className="text-xl font-semibold mb-4">Badges</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {badges.map((badge) => {
          const unlocked = earned.includes(badge.id)
          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center text-center p-4 border border-white/10 rounded-xl bg-black/20 transition-transform duration-300 ${unlocked ? 'opacity-100 hover:scale-105' : 'opacity-40'}`}
            >
              <div className="text-4xl">{badge.icon}</div>
              <div className="mt-2 font-medium">{badge.name}</div>
              {unlocked ? (
                <button
                  onClick={() => shareBadge(badge)}
                  className="mt-2 px-2 py-1 text-xs rounded bg-blue-light text-black hover:bg-blue"
                >
                  Share Badge
                </button>
              ) : (
                <div className="mt-2 text-xs text-white/60">Locked</div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
