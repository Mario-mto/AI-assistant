import { useState, useEffect, useRef, useCallback } from 'react'

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

  // Ref pour garder la dernière valeur (évite les closures stale)
  const storedValueRef = useRef<T>(storedValue)

  // Mettre à jour la ref quand la valeur change
  useEffect(() => {
    storedValueRef.current = storedValue
  }, [storedValue])

  // Fonction pour mettre à jour l'état ET localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Utiliser la ref pour avoir la dernière valeur (pas de closure stale)
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value

      // Mettre à jour la ref immédiatement pour les appels successifs rapides
      storedValueRef.current = valueToStore

      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])

  // Synchronisation avec les changements externes (autres onglets)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue)
          storedValueRef.current = newValue
          setStoredValue(newValue)
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
