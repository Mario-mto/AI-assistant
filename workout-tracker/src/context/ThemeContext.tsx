import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Nettoyer toute classe dark/light existante au démarrage
    document.documentElement.classList.remove('dark', 'light')

    // Récupérer le thème depuis localStorage
    const saved = localStorage.getItem('theme') as Theme | null
    console.log('Initializing theme from localStorage:', saved)

    if (saved === 'light' || saved === 'dark') {
      return saved
    }

    // Sinon, utiliser la préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    console.log('No saved theme, using system preference. Prefers dark:', prefersDark)
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    // Appliquer le thème au document
    const root = document.documentElement

    // Tailwind fonctionne uniquement avec la classe 'dark'
    // Pas de classe = light mode, classe 'dark' = dark mode
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme)

    console.log('Theme changed to:', theme, '- classList:', root.classList.toString())
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
