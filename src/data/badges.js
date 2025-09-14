const badges = [
  {
    id: 'first-ticket',
    name: 'First Ticket',
    icon: '🎟️',
    xp: 50,
    criteria: (profile) => {
      const total = Object.values(profile.entries || {}).reduce((a, b) => a + b, 0)
      return total > 0
    }
  },
  {
    id: 'big-spender',
    name: 'Big Spender',
    icon: '💰',
    xp: 100,
    criteria: (profile) => {
      const total = (profile.deposits || []).reduce((sum, d) => sum + d.amount, 0)
      return total >= 100
    }
  },
  {
    id: 'winner',
    name: 'Winner',
    icon: '🏆',
    xp: 200,
    criteria: (profile, raffles) => raffles.some(r => r.winner === profile.username)
  }
]

export const dailyChallenges = [
  {
    id: 'enter-raffle',
    description: 'Enter any raffle',
    xp: 10,
  },
  {
    id: 'check-in',
    description: 'Visit today',
    xp: 5,
  },
]

export const weeklyChallenges = [
  {
    id: 'win-raffle',
    description: 'Win a raffle this week',
    xp: 100,
  },
  {
    id: 'deposit-funds',
    description: 'Deposit funds',
    xp: 30,
  },
]

export default badges
