
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Raffles from './pages/Raffles'
import RaffleDetails from './pages/RaffleDetails'
import Dashboard from './pages/Dashboard'
import ProfileSettings from './pages/ProfileSettings'
import Auth from './pages/Auth'
import Admin from './pages/Admin'
import HallOfFame from './pages/HallOfFame'
import CommunityVote from './pages/CommunityVote'
import HowItWorks from './pages/HowItWorks'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import { useAuth } from './context/AuthContext'
import ChatDock from './components/chat/ChatDock'
import { useChat } from './context/ChatContext'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  const { collapsed } = useChat()
  return (
    <div className={`text-white min-h-screen flex flex-col transition-[padding] duration-300 ${collapsed ? '' : 'sm:pr-[360px]'}`}>
      <Header />
      <main className="flex-1 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/raffles" element={<Raffles />} />
          <Route path="/raffles/:id" element={<RaffleDetails />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/community-vote" element={<CommunityVote />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><ProfileSettings /></PrivateRoute>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ChatDock />
      <Footer />
    </div>
  )
}
