import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WorkoutProvider } from './context/WorkoutContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { AICoachProvider } from './context/AICoachContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <WorkoutProvider>
        <AICoachProvider>
          <App />
        </AICoachProvider>
      </WorkoutProvider>
    </ThemeProvider>
  </StrictMode>,
)

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration)
      })
      .catch((error) => {
        console.log('SW registration failed:', error)
      })
  })
}
