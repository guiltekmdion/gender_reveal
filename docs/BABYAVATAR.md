# 👶 BabyAvatar - Système Paperdoll SVG

## Vue d'Ensemble

Le système BabyAvatar est une implémentation **inspirée de l'architecture DiceBear** mais entièrement personnalisée pour créer des portraits de bébé adorables et modulaires.

### Pourquoi pas DiceBear directement ?

❌ **DiceBear n'a pas de style "bébé"**  
Les styles disponibles (avataaars, bottts, pixel-art, etc.) sont conçus pour des avatars adultes ou abstraits, pas pour des bébés mignons.

✅ **Solution : Architecture inspirée, code custom**  
- Utilisation du concept de "paperdoll" (couches modulaires)
- SVG 100% personnalisés pour ressembler à un nouveau-né
- Props React pour la customisation dynamique

---

## Architecture en Couches

```
┌─────────────────────────────────────┐
│         BabyAvatar Component        │
│  (Orchestre toutes les couches)    │
└─────────────────────────────────────┘
              │
              ├──► Layer 1: BabyBase
              │    ├─ Tête (circle)
              │    ├─ Cou (ellipse)
              │    └─ Épaules/Corps (path)
              │
              ├──► Layer 2: BabyEyes
              │    ├─ Œil gauche (blanc → iris → pupille → reflet)
              │    ├─ Œil droit (blanc → iris → pupille → reflet)
              │    ├─ Sourcil gauche
              │    └─ Sourcil droit
              │
              ├──► Layer 3: BabyFace
              │    ├─ Nez (ellipse)
              │    ├─ Bouche souriante (path curved)
              │    ├─ Joue gauche (rose)
              │    └─ Joue droite (rose)
              │
              ├──► Layer 4: BabyHair
              │    ├─ Style: default (cheveux touffus)
              │    ├─ Style: short (cheveux courts)
              │    └─ Style: curly (boucles)
              │
              ├──► Layer 5: BabyAccessory
              │    ├─ Fille: Nœud rose
              │    └─ Garçon: Nœud bleu
              │
              └──► Layer 6: BabyClothing
                   └─ T-shirt avec ombre/highlight
```

---

## Types & Interfaces

```typescript
interface BabyAvatarProps {
  /** Couleur des cheveux (hex) - ex: "#d4856a" pour roux */
  hairColor?: string;
  
  /** Couleur des yeux (hex) - ex: "#7ab88f" pour vert */
  eyeColor?: string;
  
  /** Genre pour accessoires - nœud rose (fille) ou bleu (garçon) */
  gender?: 'girl' | 'boy';
  
  /** Taille du SVG - 96 pour modal, 112 pour page résultats */
  size?: number;
  
  /** Teinte de peau (hex) - défaut: "#fdd5b1" */
  skinTone?: string;
  
  /** Style de cheveux */
  hairStyle?: 'default' | 'short' | 'curly';
  
  /** Couleur du t-shirt (hex) - défaut: "#e0e7ff" */
  clothingColor?: string;
}
```

---

## Composants Détaillés

### 1. BabyBase

**Rôle** : Structure anatomique de base (tête, cou, épaules)

```tsx
function BabyBase({ skinTone = '#fdd5b1' }: { skinTone?: string }) {
  return (
    <g>
      {/* Tête principale */}
      <circle cx="50" cy="40" r="28" fill={skinTone} />
      
      {/* Cou */}
      <ellipse cx="50" cy="64" rx="12" ry="8" fill={skinTone} />
      
      {/* Épaules et début du corps */}
      <path
        d="M 30 68 Q 30 75, 20 80 L 20 90 Q 20 95, 25 95 L 75 95 Q 80 95, 80 90 L 80 80 Q 70 75, 70 68 Z"
        fill={skinTone}
      />
    </g>
  );
}
```

**Particularités** :
- Proportions bébé : tête large, cou court
- Path complexe pour les épaules arrondies
- Prop `skinTone` pour diversité

---

### 2. BabyEyes

**Rôle** : Yeux expressifs avec reflets et sourcils

```tsx
function BabyEyes({ eyeColor = '#6ba3d4' }: { eyeColor?: string }) {
  return (
    <g>
      {/* Œil gauche */}
      <circle cx="42" cy="38" r="5" fill="white" />      {/* Blanc */}
      <circle cx="42" cy="38" r="3.5" fill={eyeColor} /> {/* Iris */}
      <circle cx="42" cy="38" r="2" fill="#2c3e50" />    {/* Pupille */}
      <circle cx="43" cy="37" r="1" fill="white" opacity="0.8" /> {/* Reflet */}
      
      {/* Œil droit (miroir) */}
      <circle cx="58" cy="38" r="5" fill="white" />
      <circle cx="58" cy="38" r="3.5" fill={eyeColor} />
      <circle cx="58" cy="38" r="2" fill="#2c3e50" />
      <circle cx="59" cy="37" r="1" fill="white" opacity="0.8" />
      
      {/* Sourcils */}
      <path d="M 36 32 Q 42 30, 48 32" stroke="#8b6f47" strokeWidth="1.5" fill="none" />
      <path d="M 52 32 Q 58 30, 64 32" stroke="#8b6f47" strokeWidth="1.5" fill="none" />
    </g>
  );
}
```

**Particularités** :
- 4 couches par œil (blanc → iris → pupille → reflet)
- Reflet légèrement décalé pour effet 3D
- Sourcils en path courbe

---

### 3. BabyFace

**Rôle** : Traits du visage (nez, bouche, joues)

```tsx
function BabyFace() {
  return (
    <g>
      {/* Nez mignon */}
      <ellipse cx="50" cy="45" rx="2" ry="3" fill="#f4c2a0" opacity="0.6" />
      
      {/* Bouche souriante */}
      <path
        d="M 44 50 Q 50 53, 56 50"
        stroke="#e07a5f"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Joues roses */}
      <circle cx="35" cy="48" r="5" fill="#ffb3ba" opacity="0.4" />
      <circle cx="65" cy="48" r="5" fill="#ffb3ba" opacity="0.4" />
    </g>
  );
}
```

**Particularités** :
- Nez simple et subtil
- Bouche en courbe de Bézier
- Joues semi-transparentes

---

### 4. BabyHair

**Rôle** : Cheveux avec 3 styles différents

```tsx
function BabyHair({ 
  hairColor = '#8b6f47', 
  style = 'default' 
}: { 
  hairColor?: string; 
  style?: 'default' | 'short' | 'curly';
}) {
  if (style === 'short') {
    return (
      <path
        d="M 22 35 Q 18 20, 30 15 Q 50 10, 70 15 Q 82 20, 78 35"
        fill={hairColor}
      />
    );
  }
  
  if (style === 'curly') {
    return (
      <g>
        <path d="M 22 38 Q 18 18, 32 12 Q 50 8, 68 12 Q 82 18, 78 38" fill={hairColor} />
        {/* Boucles additionnelles */}
        <circle cx="26" cy="22" r="4" fill={hairColor} />
        <circle cx="35" cy="16" r="4" fill={hairColor} />
        <circle cx="50" cy="14" r="4" fill={hairColor} />
        <circle cx="65" cy="16" r="4" fill={hairColor} />
        <circle cx="74" cy="22" r="4" fill={hairColor} />
      </g>
    );
  }
  
  // Style default
  return (
    <path
      d="M 22 40 Q 18 22, 28 14 Q 50 8, 72 14 Q 82 22, 78 40 L 78 35 Q 75 30, 70 28 L 30 28 Q 25 30, 22 35 Z"
      fill={hairColor}
    />
  );
}
```

**Styles disponibles** :
- **default** : Cheveux touffus avec volume
- **short** : Cheveux courts et lisses
- **curly** : Boucles mignonnes

---

### 5. BabyAccessory

**Rôle** : Nœud décoratif selon le genre

```tsx
function BabyAccessory({ gender }: { gender?: 'girl' | 'boy' }) {
  const bowColor = gender === 'girl' ? '#ff69b4' : '#4169e1';
  
  return (
    <g transform="translate(65, 25)">
      {/* Nœud central */}
      <ellipse cx="0" cy="0" rx="4" ry="3" fill={bowColor} />
      
      {/* Boucles gauche et droite */}
      <ellipse cx="-6" cy="0" rx="5" ry="6" fill={bowColor} opacity="0.8" />
      <ellipse cx="6" cy="0" rx="5" ry="6" fill={bowColor} opacity="0.8" />
    </g>
  );
}
```

**Particularités** :
- Rose (#ff69b4) pour les filles
- Bleu (#4169e1) pour les garçons
- Positionné en haut à droite

---

### 6. BabyClothing

**Rôle** : T-shirt avec effet d'ombre

```tsx
function BabyClothing({ color = '#e0e7ff' }: { color?: string }) {
  return (
    <g>
      {/* Corps du t-shirt */}
      <rect x="25" y="72" width="50" height="23" rx="3" fill={color} />
      
      {/* Highlight pour effet 3D */}
      <rect 
        x="25" 
        y="72" 
        width="50" 
        height="8" 
        rx="3" 
        fill="white" 
        opacity="0.2" 
      />
    </g>
  );
}
```

**Particularités** :
- Rectangle arrondi
- Highlight blanc semi-transparent

---

## Composant Principal

```tsx
export function BabyAvatar({
  hairColor,
  eyeColor,
  gender,
  size = 96,
  skinTone,
  hairStyle = 'default',
  clothingColor,
}: BabyAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="baby-avatar"
    >
      <BabyClothing color={clothingColor} />
      <BabyBase skinTone={skinTone} />
      <BabyFace />
      <BabyEyes eyeColor={eyeColor} />
      <BabyHair hairColor={hairColor} style={hairStyle} />
      {gender && <BabyAccessory gender={gender} />}
    </svg>
  );
}
```

**Ordre des couches** (z-index implicite) :
1. Clothing (arrière-plan)
2. Base (tête/corps)
3. Face (traits)
4. Eyes (par-dessus le visage)
5. Hair (couvre le haut de la tête)
6. Accessory (au-dessus de tout)

---

## Utilisation dans l'Application

### Page Principale (Modal de Prédictions)

```tsx
<BabyAvatar 
  hairColor={selectedHairHex}  // De la palette
  eyeColor={selectedEyeHex}    // De la palette
  gender={selectedChoice}       // 'girl' ou 'boy'
  size={96}                     // Taille modal
/>
```

### Page Résultats (Portrait Moyen)

```tsx
<BabyAvatar 
  hairColor={mostCommonHairHex}   // Couleur la plus votée
  eyeColor={mostCommonEyeHex}     // Couleur la plus votée
  gender={mostCommonGender}       // Genre majoritaire
  size={112}                      // Plus grand pour affichage principal
/>
```

---

## Palettes de Couleurs

### Cheveux (5 options)

```typescript
const hairOptions = [
  { value: 'Blonds', color: '#f5e6b3' },
  { value: 'Châtains', color: '#a67c52' },
  { value: 'Bruns', color: '#8b6f47' },
  { value: 'Roux', color: '#d4856a' },
  { value: 'Noirs', color: '#4a4a4a' },
];
```

### Yeux (5 options)

```typescript
const eyeOptions = [
  { value: 'Bleus', color: '#6ba3d4' },
  { value: 'Verts', color: '#7ab88f' },
  { value: 'Gris', color: '#a0aec0' },
  { value: 'Noisette', color: '#b8956a' },
  { value: 'Marrons', color: '#a67c52' },
];
```

---

## Avantages du Système

### ✅ Performance
- SVG = léger (quelques Ko)
- Pas d'images lourdes à charger
- Rendu instantané

### ✅ Flexibilité
- Props React pour customisation
- 3 styles de cheveux
- Couleurs illimitées (hex)

### ✅ Maintenabilité
- Code modulaire (1 composant = 1 couche)
- Facile d'ajouter de nouveaux styles
- TypeScript pour type safety

### ✅ Accessibilité
- SVG bien structuré
- Peut ajouter des labels ARIA
- Fonctionne sans JavaScript (SSR)

---

## Améliorations Futures Possibles

### Nouveaux Styles de Cheveux
```tsx
hairStyle?: 'default' | 'short' | 'curly' | 'bald' | 'pigtails' | 'mohawk'
```

### Accessoires Supplémentaires
```tsx
accessory?: 'bow' | 'hat' | 'headband' | 'pacifier' | 'none'
```

### Expressions Faciales
```tsx
expression?: 'happy' | 'sleeping' | 'curious' | 'crying'
```

### Vêtements Variés
```tsx
clothingType?: 'tshirt' | 'onesie' | 'dress' | 'hoodie'
```

---

## Comparaison avec DiceBear

| Aspect | DiceBear | Notre BabyAvatar |
|--------|----------|------------------|
| **Styles disponibles** | 20+ styles (adultes) | 1 style (bébé) |
| **Architecture** | Modèle paperdoll | ✅ Même principe |
| **Customisation** | Props pour chaque style | ✅ Props React |
| **Licence** | Open source (MIT) | Custom (propriétaire) |
| **Taille** | ~500KB (librairie) | ~5KB (1 composant) |
| **Dépendances** | Librairie externe | ✅ Aucune |
| **Adapté bébés** | ❌ Non | ✅ Oui |

---

## Ressources

- [DiceBear Documentation](https://www.dicebear.com/) - Inspiration architecturale
- [SVG Paths MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths) - Pour créer de nouveaux styles
- [React SVG Guide](https://react-svgr.com/) - Bonnes pratiques SVG en React

---

*Documentation technique générée le 26 décembre 2025*
