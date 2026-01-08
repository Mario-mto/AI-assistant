/**
 * Retourne la date actuelle au format ISO (YYYY-MM-DD)
 *
 * @returns string - Date au format ISO (ex: "2024-01-15")
 */
export function getCurrentDate(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * Formate une date ISO en format lisible français
 *
 * @param isoDate - Date au format ISO (YYYY-MM-DD)
 * @returns string - Date formatée (ex: "15 janvier 2024")
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Formate une date ISO en format court français
 *
 * @param isoDate - Date au format ISO (YYYY-MM-DD)
 * @returns string - Date formatée (ex: "15/01/2024")
 */
export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate)
  return new Intl.DateTimeFormat('fr-FR').format(date)
}

/**
 * Vérifie si une date est aujourd'hui
 *
 * @param isoDate - Date au format ISO (YYYY-MM-DD)
 * @returns boolean
 */
export function isToday(isoDate: string): boolean {
  return isoDate === getCurrentDate()
}
