import { useState, useEffect } from 'react'

/**
 * Hook générique pour synchroniser un état React avec localStorage
 *
 * @param key - Clé localStorage
 * @param initialValue - Valeur par défaut si rien en localStorage
 * @returns [value, setValue] - Tuple similaire à useState
 *
 * @example
 * const [user, setUser] = useLocalStorage<User>('user', { name: 'John' })
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // État local synchronisé avec localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Fonction pour mettre à jour l'état ET localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Permet d'utiliser une fonction comme avec useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Synchronisation avec les changements externes (autres onglets)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
