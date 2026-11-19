import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// Register service worker for offline PWA support with auto update check
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Periodically check for updates
      setInterval(() => {
        try { reg.update(); } catch (e) {}
      }, 60 * 60 * 1000); // Check hourly
    }).catch(err => {
      console.log('SW registration notice: ', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <AppProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
)
