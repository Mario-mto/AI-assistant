/**
 * Génère un ID unique pour les entités (Program, Exercise, Session)
 * Format: timestamp + random pour garantir l'unicité
 *
 * @returns string - ID unique (ex: "1704628800000-a3f9b2")
 */
export function generateId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`
}
