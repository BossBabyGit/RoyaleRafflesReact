import { Link } from 'react-router-dom'
import { useRaffles } from '../context/RaffleContext'
import { useAuth } from '../context/AuthContext'
import Slideshow from '../components/Slideshow'

export default function Home() {
  const { raffles, topRaffles, purchase } = useRaffles()
  const { user } = useAuth()

  // lightweight stats for the hero
  const totalSold = raffles.reduce((s, r) => s + r.sold, 0)
  const totalRaffles = raffles.length
  const winners = raffles.filter(r => r.ended && r.winner).length

  return (
    <div className="py-8">
      {/* HERO */}
      <section
        className="relative rounded-3xl glass p-8 md:p-12 lg:p-16 overflow-hidden shadow-glow
                   min-h-[80vh] flex items-center"
      >
        {/* subtle color glows */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue/30 via-transparent to-claret/30 opacity-70"></div>
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-light/40 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-claret/40 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-grid bg-grid-size opacity-20 pointer-events-none"></div>

        <div className="relative grid lg:grid-cols-2 gap-10 w-full">
          {/* LEFT: Text + CTA */}
          <div className="max-w-3xl">
            <span className="text-sm uppercase tracking-widest text-blue-light">Play • Win • Repeat</span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mt-2">
              Win epic prizes with <span className="text-blue-light">Royale</span>
              <span className="text-claret">Raffles</span>
            </h1>
            <p className="text-white/70 mt-4 max-w-2xl">
              Enter raffles using your on-site balance, discover trending prizes, and track your wins —
              all in one playful, modern experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/raffles" className="px-6 py-3 rounded-2xl bg-blue hover:bg-blue-light">
                Browse Raffles
              </Link>
              {!user && (
                <Link to="/auth" className="px-6 py-3 rounded-2xl bg-claret hover:bg-claret-light">
                  Login / Register
                </Link>
              )}
            </div>

            {/* Stats chips */}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm">
                🎟️ <span className="text-white/80">Tickets sold:</span> <b>{totalSold}</b>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm">
                🗂️ <span className="text-white/80">Active raffles:</span> <b>{totalRaffles}</b>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm">
                🏆 <span className="text-white/80">Winners:</span> <b>{winners}</b>
              </div>
            </div>
          </div>

          {/* RIGHT: Feature card (clean, optional) */}
          <div className="hidden lg:block">
            <div className="glass rounded-3xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold">How it works</h3>
              <ol className="mt-3 space-y-2 text-white/80 text-sm list-decimal list-inside">
                <li>Top up your on-site balance.</li>
                <li>Pick a raffle & choose your tickets.</li>
                <li>Watch the countdown — winners are drawn fairly.</li>
              </ol>
              <div className="mt-4 text-xs text-white/60">
                Max per user: <b>50%</b> of total tickets per raffle.
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-black/20 border border-white/10">
                  <div className="text-2xl">🔒</div>
                  <div className="text-xs text-white/70 mt-1">Secure Top-Ups</div>
                </div>
                <div className="p-3 rounded-xl bg-black/20 border border-white/10">
                  <div className="text-2xl">⚖️</div>
                  <div className="text-xs text-white/70 mt-1">Fair Draws</div>
                </div>
                <div className="p-3 rounded-xl bg-black/20 border border-white/10">
                  <div className="text-2xl">⚡</div>
                  <div className="text-xs text-white/70 mt-1">Instant Entry</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOP RAFFLES */}
      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold">This Week&apos;s Top Raffles</h2>
        <Slideshow items={topRaffles} onPurchase={purchase} />
      </section>

      {/* TRUST BAR (visible on mobile too) */}
      <section className="mt-8 grid sm:grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-3 text-center text-sm">
          🔒 <span className="text-white/80">Secure Top-Ups</span>
        </div>
        <div className="glass rounded-2xl p-3 text-center text-sm">
          ⚖️ <span className="text-white/80">Fair, random winners</span>
        </div>
        <div className="glass rounded-2xl p-3 text-center text-sm">
          ⚡ <span className="text-white/80">Instant ticket purchase</span>
        </div>
      </section>
    </div>
  )
}
