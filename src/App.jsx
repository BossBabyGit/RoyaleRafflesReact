
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Raffles from './pages/Raffles'
  import RaffleDetails from './pages/RaffleDetails'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
  import Admin from './pages/Admin'
import { useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <div className="text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/raffles" element={<Raffles />} />
            <Route path="/raffles/:id" element={<RaffleDetails />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
