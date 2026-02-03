import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

// Lazy load des pages pour code splitting optimal
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ActiveSession = lazy(() => import('./pages/ActiveSession'))
const Cardio = lazy(() => import('./pages/Cardio'))
const History = lazy(() => import('./pages/History'))
const Config = lazy(() => import('./pages/Config'))
const Calendar = lazy(() => import('./pages/Calendar'))

// Fallback de loading minimal
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-energy-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="session" element={<ActiveSession />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="cardio" element={<Cardio />} />
            <Route path="history" element={<History />} />
            <Route path="config" element={<Config />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
