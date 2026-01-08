import { useState, useEffect } from 'react'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isEnabled, setIsEnabled] = useState(() => {
    return localStorage.getItem('notifications-enabled') === 'true'
  })

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Ce navigateur ne supporte pas les notifications')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Erreur permission notifications:', error)
      return false
    }
  }

  const enableNotifications = async () => {
    const granted = permission === 'granted' || (await requestPermission())

    if (granted) {
      setIsEnabled(true)
      localStorage.setItem('notifications-enabled', 'true')
      // Programmer un rappel quotidien
      scheduleDailyReminder()
      return true
    }
    return false
  }

  const disableNotifications = () => {
    setIsEnabled(false)
    localStorage.setItem('notifications-enabled', 'false')
    // Annuler les rappels programmés
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.getNotifications().then((notifications) => {
          notifications.forEach((notification) => notification.close())
        })
      })
    }
  }

  const scheduleDailyReminder = () => {
    // Créer un rappel quotidien à 18h
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(18, 0, 0, 0)

    // Si 18h est déjà passé aujourd'hui, programmer pour demain
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const delay = scheduledTime.getTime() - now.getTime()

    setTimeout(() => {
      sendNotification(
        'Rappel Workout Tracker',
        "C'est l'heure de ta séance d'entraînement ! 💪",
        '/icon-192.png'
      )
      // Re-programmer pour le lendemain
      scheduleDailyReminder()
    }, delay)
  }

  const sendNotification = (title: string, body: string, icon?: string) => {
    if (permission === 'granted' && isEnabled) {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Utiliser le service worker si disponible
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: icon || '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'workout-reminder',
            requireInteraction: false,
          })
        })
      } else {
        // Fallback vers Notification API basique
        new Notification(title, {
          body,
          icon: icon || '/icon-192.png',
        })
      }
    }
  }

  const sendWorkoutReminder = () => {
    sendNotification(
      'Rappel Workout Tracker',
      'Tu n\'as pas fait de séance aujourd\'hui ! 💪',
      '/icon-192.png'
    )
  }

  return {
    permission,
    isEnabled,
    enableNotifications,
    disableNotifications,
    sendNotification,
    sendWorkoutReminder,
  }
}
