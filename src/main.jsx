
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { RaffleProvider } from './context/RaffleContext'
import { NotificationProvider } from './context/NotificationContext'
import { ChatProvider } from './context/ChatContext'
import { AuditProvider } from './context/AuditContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <AuditProvider>
          <AuthProvider>
            <NotificationProvider>
              <RaffleProvider>
                <ChatProvider>
                  <App />
                </ChatProvider>
              </RaffleProvider>
            </NotificationProvider>
          </AuthProvider>
        </AuditProvider>
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>
)
