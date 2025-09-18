import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 text-white/70 text-sm grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-white">
            <img src="/logo.png" alt="Royale Raffles" className="h-10 w-10 rounded-lg object-contain border border-white/10" />
            <div>
              <span className="text-claret">Royale</span>
              <span className="text-blue-light">Raffles</span>
            </div>
          </Link>
          <p className="text-white/80">UK prize competitions • 18+ only • Free entry available</p>
          <p className="text-xs text-white/50">© {new Date().getFullYear()} Royale Raffles. All rights reserved.</p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Explore</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/raffles" className="hover:text-white">Competitions</Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-white">How It Works</Link>
            </li>
            <li>
              <Link to="/community-vote" className="hover:text-white">Community Vote</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <p className="text-white/80">Operated by Northedge Group Ltd</p>
          <p className="text-white/60">Company No. 13245678</p>
          <p className="text-white/60">71-75 Shelton Street, Covent Garden, London, WC2H 9JQ</p>
          <p className="text-white/60">Support: support@northedgegroup.co.uk</p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/raffles" className="hover:text-white">Free Entry Route</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-xs text-white/40">
        Royale Raffles is a trading name of Northedge Group Ltd. Please gamble responsibly.
      </div>
    </footer>
  )
}
