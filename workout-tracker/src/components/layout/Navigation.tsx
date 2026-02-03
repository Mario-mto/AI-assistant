import { NavLink, useLocation } from 'react-router-dom'
import type { ReactElement } from 'react'

const navItems = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/session', label: 'Muscu', icon: 'muscle' },
  { to: '/calendar', label: 'Plan', icon: 'calendar' },
  { to: '/cardio', label: 'Cardio', icon: 'run' },
  { to: '/history', label: 'Stats', icon: 'chart' },
  { to: '/config', label: 'Config', icon: 'settings' },
]

// Custom SVG icons for a cleaner look
const icons: Record<string, ReactElement> = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  muscle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M6.5 6.5c1.5 0 3 .5 3 2s-1.5 2-3 2-3-.5-3-2 1.5-2 3-2z" />
      <path d="M17.5 6.5c1.5 0 3 .5 3 2s-1.5 2-3 2-3-.5-3-2 1.5-2 3-2z" />
      <path d="M6.5 10.5v4c0 1.5 1 3 3 3h5c2 0 3-1.5 3-3v-4" />
      <path d="M9.5 8.5h5" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  run: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="5" r="2" />
      <path d="M4 17l3-3 2 2 4-4 3 3" />
      <path d="M15 21l-3-6-3 3-4-4" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
}

export default function Navigation() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe">
      <div className="glass rounded-2xl shadow-glass-dark mx-auto max-w-md mb-1">
        <div className="flex justify-around items-center h-[4.5rem] px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex-1 flex justify-center"
              >
                <div
                  className={`
                    nav-pill ${isActive ? 'active' : ''}
                    ${isActive ? 'text-energy-600 dark:text-energy-400' : 'text-gray-400 dark:text-gray-500'}
                    hover:text-energy-500 dark:hover:text-energy-400
                  `}
                >
                  <div
                    className={`
                      transition-transform duration-300
                      ${isActive ? 'scale-110' : 'scale-100'}
                    `}
                  >
                    {icons[item.icon]}
                  </div>
                  <span
                    className={`
                      text-[10px] font-semibold mt-1 uppercase tracking-wider
                      transition-all duration-300
                      ${isActive ? 'opacity-100' : 'opacity-70'}
                    `}
                  >
                    {item.label}
                  </span>
                </div>
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
