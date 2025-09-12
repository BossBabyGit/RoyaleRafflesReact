
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { RaffleProvider } from './context/RaffleContext'
  import { NotificationProvider } from './context/NotificationContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
            <RaffleProvider>
          <App />
        </RaffleProvider>
          </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
