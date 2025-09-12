
import { Link } from 'react-router-dom'
import { useRaffles } from '../context/RaffleContext'
import { useAuth } from '../context/AuthContext'
import Slideshow from '../components/Slideshow'

export default function Home() {
  const { topRaffles, purchase } = useRaffles()
  const { user } = useAuth()

  return (
    <div className="py-8">
      <section className="relative rounded-3xl glass p-8 md:p-12 overflow-hidden shadow-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-blue/30 via-transparent to-claret/30 opacity-70"></div>
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-light/40 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-claret/40 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-grid bg-grid-size opacity-20 pointer-events-none"></div>
        <div className="relative">
          <span className="text-sm uppercase tracking-widest text-blue-light">Play • Win • Repeat</span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mt-2">
            Win epic prizes with <span className="text-blue-light">Royale</span><span className="text-claret">Raffles</span>
          </h1>
          <p className="text-white/70 mt-4 max-w-2xl">Enter raffles using your on‑site balance, discover trending prizes, and track your wins — all in one playful, modern experience.</p>
          <div className="mt-8 flex gap-3">
            <Link to="/raffles" className="px-6 py-3 rounded-2xl bg-blue hover:bg-blue-light">Browse Raffles</Link>
            {!user && <Link to="/auth" className="px-6 py-3 rounded-2xl bg-claret hover:bg-claret-light">Login / Register</Link>}
          </div>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold">This Week's Top Raffles</h2>
        <Slideshow items={topRaffles} onPurchase={purchase} />
      </section>
    </div>
  )
}
