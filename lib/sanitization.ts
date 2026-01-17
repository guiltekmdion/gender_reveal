/**
 * Utilitaires de sanitization pour prévenir les attaques XSS
 * Échappe le HTML et limite la longueur des messages
 */

/**
 * Échappe les caractères HTML pour prévenir XSS
 * @param text - Texte à échapper
 * @returns Texte échappé
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Clamp un message à une longueur maximale avec ellipsis
 * @param text - Texte à clamp
 * @param maxLength - Longueur maximale (défaut: 200)
 * @returns Texte clampé
 */
export function clampMessage(text: string | null | undefined, maxLength: number = 200): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Sanitize un message : échappe HTML et clamp la longueur
 * @param text - Message à sanitizer
 * @param maxLength - Longueur maximale (défaut: 200)
 * @returns Message sanitizé
 */
export function sanitizeMessage(text: string | null | undefined, maxLength: number = 200): string {
  const clamped = clampMessage(text, maxLength);
  return escapeHtml(clamped);
}

/**
 * Nettoie un message pour l'affichage : supprime les retours ligne multiples
 * et limite la longueur
 * @param text - Message à nettoyer
 * @param maxLength - Longueur maximale (défaut: 200)
 * @returns Message nettoyé
 */
export function cleanMessage(text: string | null | undefined, maxLength: number = 200): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remplacer les retours ligne multiples par un seul espace
  let cleaned = text.replace(/\n+/g, ' ').replace(/\r+/g, ' ');
  
  // Supprimer les espaces multiples
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Clamp
  return clampMessage(cleaned, maxLength);
}

/**
 * Masque un email pour la privacy (ex: m***@domaine.fr)
 * @param email - Email à masquer
 * @returns Email masqué ou null si invalide
 */
export function maskEmail(email: string | null | undefined): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  
  if (atIndex <= 0 || atIndex >= trimmed.length - 1) {
    return null; // Email invalide
  }

  const localPart = trimmed.substring(0, atIndex);
  const domain = trimmed.substring(atIndex + 1);

  // Masquer le local part : garder le premier caractère, remplacer le reste par ***
  const maskedLocal = localPart.length > 1 
    ? localPart.charAt(0) + '***'
    : '***';

  return `${maskedLocal}@${domain}`;
}

/**
 * Valide et sanitize une URL pour les QR codes
 * @param url - URL à valider
 * @param allowedDomains - Domaines autorisés (optionnel)
 * @returns URL validée ou null si invalide
 */
export function validateUrl(url: string | null | undefined, allowedDomains?: string[]): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  
  // Vérifier que c'est une URL valide
  try {
    const urlObj = new URL(trimmed);
    
    // Vérifier le protocole (https uniquement pour la sécurité)
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      return null;
    }
    
    // Vérifier les domaines autorisés si fournis
    if (allowedDomains && allowedDomains.length > 0) {
      const hostname = urlObj.hostname.toLowerCase();
      const isAllowed = allowedDomains.some(domain => 
        hostname === domain.toLowerCase() || hostname.endsWith('.' + domain.toLowerCase())
      );
      
      if (!isAllowed) {
        return null;
      }
    }
    
    return trimmed;
  } catch {
    return null;
  }
}
