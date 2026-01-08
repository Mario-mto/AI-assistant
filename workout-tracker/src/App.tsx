import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ActiveSession from './pages/ActiveSession'
import History from './pages/History'
import Config from './pages/Config'
import Coach from './pages/Coach'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="session" element={<ActiveSession />} />
          <Route path="history" element={<History />} />
          <Route path="config" element={<Config />} />
          <Route path="coach" element={<Coach />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
