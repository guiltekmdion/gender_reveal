/**
 * Avatar bébé - SVG simple et mignon
 * Représente un bébé avec personnalisation des cheveux et yeux
 */

'use client';

type Gender = 'girl' | 'boy';

interface BabyAvatarProps {
  gender?: Gender;
  hairColor?: string;
  eyeColor?: string;
  skinTone?: string;
  size?: number;
}

export default function BabyAvatar({
  gender,
  hairColor = '#8b6f47',
  eyeColor = '#5b4636',
  skinTone = '#ffdfc4',
  size = 200
}: BabyAvatarProps) {
  // Couleur des vêtements selon le genre
  const clothingColor = gender === 'girl' ? '#ffb6c1' : gender === 'boy' ? '#87ceeb' : '#c8b6ff';
  const clothingColor2 = gender === 'girl' ? '#ff69b4' : gender === 'boy' ? '#4169e1' : '#9b59b6';
  
  // Accessoire selon le genre (noeud pour fille, rien pour garçon)
  const showBow = gender === 'girl';
  
  return (
    <div 
      data-testid="baby-avatar"
      style={{ 
        width: size, 
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fond cercle doux */}
        <circle cx="100" cy="100" r="95" fill="#fef3e2" />
        
        {/* Corps/Vêtement - Body/Onesie */}
        <ellipse cx="100" cy="175" rx="45" ry="30" fill={clothingColor} />
        <ellipse cx="100" cy="165" rx="40" ry="20" fill={clothingColor} />
        
        {/* Col du vêtement */}
        <path 
          d="M 70 150 Q 100 160 130 150" 
          stroke={clothingColor2} 
          strokeWidth="3" 
          fill="none"
        />
        
        {/* Tête - forme de bébé (plus ronde) */}
        <ellipse cx="100" cy="95" rx="55" ry="50" fill={skinTone} />
        
        {/* Oreilles */}
        <ellipse cx="48" cy="95" rx="8" ry="10" fill={skinTone} />
        <ellipse cx="152" cy="95" rx="8" ry="10" fill={skinTone} />
        <ellipse cx="48" cy="95" rx="5" ry="6" fill="#ffcbaa" />
        <ellipse cx="152" cy="95" rx="5" ry="6" fill="#ffcbaa" />
        
        {/* Cheveux - style bébé */}
        <ellipse cx="100" cy="55" rx="50" ry="25" fill={hairColor} />
        <ellipse cx="60" cy="65" rx="15" ry="20" fill={hairColor} />
        <ellipse cx="140" cy="65" rx="15" ry="20" fill={hairColor} />
        
        {/* Mèches de cheveux sur le front */}
        <path 
          d={`M 70 70 Q 80 55 90 70 Q 100 55 110 70 Q 120 55 130 70`}
          fill={hairColor}
        />
        
        {/* Petites mèches supplémentaires */}
        <ellipse cx="75" cy="58" rx="8" ry="12" fill={hairColor} />
        <ellipse cx="100" cy="52" rx="10" ry="15" fill={hairColor} />
        <ellipse cx="125" cy="58" rx="8" ry="12" fill={hairColor} />
        
        {/* Noeud pour fille */}
        {showBow && (
          <g transform="translate(140, 50)">
            <ellipse cx="-8" cy="0" rx="10" ry="6" fill="#ff69b4" />
            <ellipse cx="8" cy="0" rx="10" ry="6" fill="#ff69b4" />
            <circle cx="0" cy="0" r="5" fill="#ff1493" />
          </g>
        )}
        
        {/* Yeux */}
        <g>
          {/* Œil gauche */}
          <ellipse cx="75" cy="95" rx="12" ry="14" fill="white" />
          <ellipse cx="77" cy="97" rx="7" ry="8" fill={eyeColor} />
          <circle cx="79" cy="94" r="3" fill="white" opacity="0.8" />
          <ellipse cx="77" cy="98" rx="3" ry="4" fill="#1a1a1a" />
          
          {/* Œil droit */}
          <ellipse cx="125" cy="95" rx="12" ry="14" fill="white" />
          <ellipse cx="123" cy="97" rx="7" ry="8" fill={eyeColor} />
          <circle cx="125" cy="94" r="3" fill="white" opacity="0.8" />
          <ellipse cx="123" cy="98" rx="3" ry="4" fill="#1a1a1a" />
        </g>
        
        {/* Sourcils doux */}
        <path d="M 65 82 Q 75 78 85 82" stroke={hairColor} strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M 115 82 Q 125 78 135 82" stroke={hairColor} strokeWidth="2" fill="none" opacity="0.5" />
        
        {/* Nez mignon */}
        <ellipse cx="100" cy="110" rx="4" ry="3" fill="#f0b090" opacity="0.6" />
        
        {/* Bouche souriante */}
        <path 
          d="M 85 125 Q 100 138 115 125" 
          stroke="#e07070" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round"
        />
        
        {/* Joues roses */}
        <ellipse cx="60" cy="115" rx="10" ry="6" fill="#ffb6c1" opacity="0.5" />
        <ellipse cx="140" cy="115" rx="10" ry="6" fill="#ffb6c1" opacity="0.5" />
        
        {/* Petites mains */}
        <ellipse cx="55" cy="160" rx="10" ry="8" fill={skinTone} />
        <ellipse cx="145" cy="160" rx="10" ry="8" fill={skinTone} />
      </svg>
    </div>
  );
}
