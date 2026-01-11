import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Mesh background */}
      <div className="mesh-bg" />

      {/* Main content area */}
      <main className="flex-1 container mx-auto px-4 pt-safe pb-6 mb-nav max-w-lg relative z-10">
        <Outlet />
      </main>

      {/* Fixed bottom navigation */}
      <Navigation />
    </div>
  )
}
