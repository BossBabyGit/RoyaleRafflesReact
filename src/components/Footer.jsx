import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 text-white/60 text-sm grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <img src={logo} alt="Royal Raffles logo" className="h-10 w-auto" />
          <p className="text-white">UK prize competitions • 18+ only</p>
          <p className="text-xs">© {new Date().getFullYear()} RoyaleRaffles. All rights reserved.</p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/raffles" className="hover:text-white">Raffles</Link>
            </li>
            <li>
              <a href="#" className="hover:text-white">Contact</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-white">Terms & Conditions</a>
            </li>
            <li>
              <a href="#" className="hover:text-white">Privacy Policy</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-xs text-white/40">
        Built with React, Vite & Tailwind
      </div>
    </footer>
  )
}
