import type { Vote, AppConfig } from './storage';
import { formatDate } from './date-utils';

interface ExtremeResult {
  value: any;
  voter: string;
}

export function getExtreme(
  votes: Vote[], 
  field: keyof Vote, 
  type: 'min' | 'max'
): ExtremeResult | null {
  const validVotes = votes.filter(v => v[field] !== undefined && v[field] !== null && v[field] !== '');
  
  if (validVotes.length === 0) return null;
  
  const sorted = [...validVotes].sort((a, b) => {
    const valA = a[field];
    const valB = b[field];
    
    if (typeof valA === 'number' && typeof valB === 'number') {
      return type === 'min' ? valA - valB : valB - valA;
    }
    
    if (typeof valA === 'string' && typeof valB === 'string') {
      return type === 'min' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    
    return 0;
  });
  
  const extreme = sorted[0];
  return {
    value: extreme[field],
    voter: extreme.name
  };
}

export function getPopularDate(votes: Vote[]): { date: string; count: number } | null {
  const dateCounts: Record<string, number> = {};
  
  votes.forEach(v => {
    if (v.birthDate) {
      dateCounts[v.birthDate] = (dateCounts[v.birthDate] || 0) + 1;
    }
  });
  
  const entries = Object.entries(dateCounts);
  if (entries.length === 0) return null;
  
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return { date: sorted[0][0], count: sorted[0][1] };
}

export function getConsensus(
  votes: Vote[], 
  field: keyof Vote
): { value: any; percentage: number } | null {
  const counts: Record<string, number> = {};
  const validVotes = votes.filter(v => v[field] !== undefined && v[field] !== null && v[field] !== '');
  
  if (validVotes.length === 0) return null;
  
  validVotes.forEach(v => {
    const value = String(v[field]);
    counts[value] = (counts[value] || 0) + 1;
  });
  
  const entries = Object.entries(counts);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const [mostCommon, count] = sorted[0];
  
  return {
    value: mostCommon,
    percentage: Math.round((count / validVotes.length) * 100)
  };
}

export function getLatestVoteMessage(votes: Vote[]): { emoji: string; text: string } | null {
  if (votes.length === 0) return null;
  
  // Les votes sont triés par timestamp DESC, donc le plus récent est à l'index 0
  const latest = votes[0];
  const teamText = latest.choice === 'girl' ? 'Team Fille 💕' : 'Team Garçon 💙';
  const emoji = latest.choice === 'girl' ? '👧' : '👦';
  
  if (latest.message && latest.message.trim().length > 0) {
    return {
      emoji: emoji,
      text: `${latest.name} vient de voter ${teamText} et dit : "${latest.message}"`
    };
  }
  
  return {
    emoji: emoji,
    text: `${latest.name} vient de voter ${teamText} !`
  };
}

export interface FunFact {
  emoji: string;
  text: string;
  isQRCode?: boolean;
}

export function generateFunFacts(votes: Vote[], config: AppConfig): Array<FunFact> {
  const facts: Array<FunFact> = [];
  
  // Cas spécial : 0 votes
  if (votes.length === 0) {
    return [
      { emoji: '🎉', text: 'Soyez les premiers à voter !' },
      { emoji: '👶', text: `${config.babyName || 'Bébé'} arrive bientôt !` },
      { emoji: '📱', text: 'Scannez le QR code pour participer' },
      { emoji: '💝', text: 'La soirée gender reveal commence !' },
      { emoji: '🎈', text: 'Partagez vos prédictions !' }
    ];
  }
  
  // Cas spécial : 1-5 votes - Afficher les derniers votes
  if (votes.length <= 5) {
    const latestVote = getLatestVoteMessage(votes);
    if (latestVote) {
      facts.push(latestVote);
    }
    
    facts.push({ 
      emoji: '🗳️', 
      text: `${votes.length} ${votes.length === 1 ? 'personne a' : 'personnes ont'} déjà voté !` 
    });
    
    // Ajouter un fact encourageant
    facts.push({
      emoji: '🚀',
      text: 'Plus on est nombreux, plus c\'est fun !'
    });
    
    return facts;
  }
  
  // Total votes
  facts.push({ 
    emoji: '🗳️', 
    text: `${votes.length} ${votes.length === 1 ? 'personne a' : 'personnes ont'} voté !` 
  });
  
  // Team distribution
  const girlVotes = votes.filter(v => v.choice === 'girl').length;
  const boyVotes = votes.filter(v => v.choice === 'boy').length;
  const girlPercent = votes.length > 0 ? Math.round((girlVotes / votes.length) * 100) : 0;
  const boyPercent = votes.length > 0 ? Math.round((boyVotes / votes.length) * 100) : 0;
  
  if (girlPercent > boyPercent) {
    facts.push({ 
      emoji: '💕', 
      text: `${girlPercent}% pensent que c'est une fille !` 
    });
  } else if (boyPercent > girlPercent) {
    facts.push({ 
      emoji: '💙', 
      text: `${boyPercent}% pensent que c'est un garçon !` 
    });
  } else {
    facts.push({ 
      emoji: '⚖️', 
      text: 'Égalité parfaite entre filles et garçons !' 
    });
  }
  
  // Popular date
  const popularDate = getPopularDate(votes);
  if (popularDate && popularDate.count > 1) {
    facts.push({ 
      emoji: '📅', 
      text: `${popularDate.count} personnes prédisent le ${formatDate(popularDate.date, undefined, config)}` 
    });
  }
  
  // Weight extremes
  const heaviest = getExtreme(votes, 'weight', 'max');
  if (heaviest && typeof heaviest.value === 'number') {
    facts.push({ 
      emoji: '🏋️', 
      text: `Record de poids : ${heaviest.value}g prédit par ${heaviest.voter} !` 
    });
  }
  
  const lightest = getExtreme(votes, 'weight', 'min');
  if (lightest && typeof lightest.value === 'number') {
    facts.push({ 
      emoji: '🪶', 
      text: `Plus léger : ${lightest.value}g prédit par ${lightest.voter}` 
    });
  }
  
  // Eye color consensus
  const eyeConsensus = getConsensus(votes, 'eyeColor');
  if (eyeConsensus && eyeConsensus.percentage >= 50) {
    facts.push({ 
      emoji: '👁️', 
      text: `${eyeConsensus.percentage}% pensent que bébé aura les yeux ${eyeConsensus.value} !` 
    });
  }
  
  // Hair color consensus
  const hairConsensus = getConsensus(votes, 'hairColor');
  if (hairConsensus && hairConsensus.percentage >= 50) {
    facts.push({ 
      emoji: '💇', 
      text: `${hairConsensus.percentage}% prédisent des cheveux ${hairConsensus.value} !` 
    });
  }
  
  // Night vs day births
  const nightBirths = votes.filter(v => {
    if (!v.birthTime) return false;
    const hour = parseInt(v.birthTime.split(':')[0]);
    return hour >= 22 || hour < 6;
  }).length;
  
  if (nightBirths > 0 && votes.length > 0) {
    const nightPercent = Math.round((nightBirths / votes.length) * 100);
    if (nightPercent >= 30) {
      facts.push({ 
        emoji: '🌙', 
        text: `${nightBirths} ${nightBirths === 1 ? 'personne pense' : 'personnes pensent'} à une naissance nocturne !` 
      });
    }
  }
  
  // Messages stats
  const withMessages = votes.filter(v => v.message && v.message.trim().length > 0).length;
  if (withMessages > votes.length * 0.5) {
    facts.push({ 
      emoji: '💬', 
      text: `${withMessages} messages d'amour laissés pour ${config.babyName || 'bébé'} !` 
    });
  }
  
  // Earliest time
  const earliest = getExtreme(votes, 'birthTime', 'min');
  if (earliest) {
    facts.push({ 
      emoji: '🌅', 
      text: `Plus matinal : ${earliest.value} prédit par ${earliest.voter}` 
    });
  }
  
  // Latest time
  const latest = getExtreme(votes, 'birthTime', 'max');
  if (latest) {
    facts.push({ 
      emoji: '🌃', 
      text: `Plus tardif : ${latest.value} prédit par ${latest.voter}` 
    });
  }
  
  // Dernier vote - Toujours inclure pour garder les choses dynamiques
  const latestVote = getLatestVoteMessage(votes);
  if (latestVote) {
    facts.push(latestVote);
  }
  
  // Si on a peu de facts, ajouter des messages d'encouragement
  if (facts.length < 5) {
    facts.push({
      emoji: '✨',
      text: 'Merci à tous pour vos prédictions !'
    });
    facts.push({
      emoji: '🎊',
      text: `Bientôt la grande révélation pour ${config.babyName || 'bébé'} !`
    });
  }
  
  return facts;
}
