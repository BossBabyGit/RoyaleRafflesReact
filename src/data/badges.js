const badges = [
  {
    id: 'first-ticket',
    name: 'First Ticket',
    icon: '🎟️',
    criteria: (profile) => {
      const total = Object.values(profile.entries || {}).reduce((a, b) => a + b, 0)
      return total > 0
    }
  },
  {
    id: 'big-spender',
    name: 'Big Spender',
    icon: '💰',
    criteria: (profile) => {
      const total = (profile.deposits || []).reduce((sum, d) => sum + d.amount, 0)
      return total >= 100
    }
  },
  {
    id: 'winner',
    name: 'Winner',
    icon: '🏆',
    criteria: (profile, raffles) => raffles.some(r => r.winner === profile.username)
  }
]

export default badges
