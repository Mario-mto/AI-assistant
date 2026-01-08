import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      {/* Zone de contenu principale */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 max-w-4xl">
        <Outlet />
      </main>

      {/* Navigation fixe en bas */}
      <Navigation />
    </div>
  )
}
