export function detectSentiment(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Amour & Affection
  if (lowerMessage.match(/\b(amour|aime|adore|bisou|coeur|câlin|tendresse|chéri|mignon)\b/)) {
    return '❤️';
  }
  
  // Joie & Rires
  if (lowerMessage.match(/\b(lol|mdr|haha|hihi|drôle|rigol|mort de rire)\b/)) {
    return '😂';
  }
  
  // Célébration
  if (lowerMessage.match(/\b(bravo|félicitation|super|génial|magnifique|top|youpi|yay)\b/)) {
    return '🎉';
  }
  
  // Excitation & Hâte
  if (lowerMessage.match(/\b(hâte|tarde|impatient|excité|vivement|bientôt)\b/)) {
    return '🤩';
  }
  
  // Bébé & Famille
  if (lowerMessage.match(/\b(bébé|baby|famille|parents|papa|maman|tonton|tata)\b/)) {
    return '👶';
  }
  
  // Force & Courage
  if (lowerMessage.match(/\b(courage|force|fort|brave|warrior|champion)\b/)) {
    return '💪';
  }
  
  // Beauté
  if (lowerMessage.match(/\b(beau|belle|magnifique|splendide|sublime)\b/)) {
    return '✨';
  }
  
  // Émoji spécifique détecté
  const emojiMatch = message.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);
  if (emojiMatch && emojiMatch.length > 0) {
    return emojiMatch[0];
  }
  
  // Default
  return '💬';
}
