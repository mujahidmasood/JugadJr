import React from 'react';

export type CompanionType = 'buddy' | 'luna' | 'whiskers' | 'cleo';

export interface CompanionConfig {
  id: CompanionType;
  name: string;
  emoji: string;
  sound: string;
  prefix: string;
  pitch: number;
  rate: number;
  description: string;
}

export const COMPANIONS: CompanionConfig[] = [
  {
    id: 'buddy',
    name: 'Buddy the Friendly Dog',
    emoji: '🐕',
    sound: 'Woof! 🐕',
    prefix: 'Woof! ',
    pitch: 1.15,
    rate: 0.90,
    description: 'A warm, energetic, and highly encouraging companion who loves starting new dog-paws-ventures!'
  },
  {
    id: 'luna',
    name: 'Luna the Smart Owl',
    emoji: '🦉',
    sound: 'Hoot-hoot! 🦉',
    prefix: 'Hoot-hoot! ',
    pitch: 0.95,
    rate: 0.85,
    description: 'A wise, thoughtful guide who loves reading books and sharing analytical and simple business tips!'
  },
  {
    id: 'whiskers',
    name: 'Whiskers the Squirrel',
    emoji: '🐿️',
    sound: 'Squeak! 🐿️',
    prefix: 'Squeak! ',
    pitch: 1.45,
    rate: 1.05,
    description: 'A super fast, energetic squirrel who moves like lightning and loves saving coins like acorns!'
  },
  {
    id: 'cleo',
    name: 'Cleo the Wise Cat',
    emoji: '🐱',
    sound: 'Meow! 🐱',
    prefix: 'Meow! ',
    pitch: 1.25,
    rate: 0.80,
    description: 'A calm, elegant, and super-smart cat who teaches kids how to design beautiful creations!'
  }
];

// Luna the Smart Owl SVG Avatar
export const LunaAvatar: React.FC<{ size?: number; className?: string; isTalking?: boolean }> = ({ size = 120, className = "", isTalking = false }) => {
  return (
    <div className={`relative inline-block select-none ${className} ${isTalking ? 'animate-bounce' : ''}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
        {/* Background Aura */}
        <circle cx="60" cy="60" r="54" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="4" />
        
        {/* Head and Body */}
        <ellipse cx="60" cy="65" rx="36" ry="40" fill="#6366F1" stroke="#312E81" strokeWidth="3" />
        <ellipse cx="60" cy="74" rx="22" ry="24" fill="#EEF2FF" stroke="#312E81" strokeWidth="2" />
        
        {/* Feather Tufts (Ears) */}
        <polygon points="30,35 44,45 34,50" fill="#4F46E5" stroke="#312E81" strokeWidth="2.5" />
        <polygon points="90,35 76,45 86,50" fill="#4F46E5" stroke="#312E81" strokeWidth="2.5" />
        
        {/* Big Owl Eyes */}
        <circle cx="44" cy="52" r="16" fill="#FBBF24" stroke="#312E81" strokeWidth="2" />
        <circle cx="44" cy="52" r="10" fill="#FFFFFF" />
        <circle cx="44" cy="52" r="5" fill="#111827" />
        <circle cx="46" cy="50" r="1.5" fill="#FFFFFF" />

        <circle cx="76" cy="52" r="16" fill="#FBBF24" stroke="#312E81" strokeWidth="2" />
        <circle cx="76" cy="52" r="10" fill="#FFFFFF" />
        <circle cx="76" cy="52" r="5" fill="#111827" />
        <circle cx="78" cy="50" r="1.5" fill="#FFFFFF" />

        {/* Wise Spectacles */}
        <circle cx="44" cy="52" r="17.5" fill="none" stroke="#D97706" strokeWidth="2.5" />
        <circle cx="76" cy="52" r="17.5" fill="none" stroke="#D97706" strokeWidth="2.5" />
        <line x1="60.5" y1="52" x2="59.5" y2="52" stroke="#D97706" strokeWidth="3" />

        {/* Beak */}
        <polygon points="56,58 64,58 60,70" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />

        {/* Belly feathers pattern */}
        <path d="M 52 75 Q 60 80 68 75" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 48 83 Q 60 88 72 83" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Happy Cute Wing flaps */}
        {isTalking ? (
          <g>
            <path d="M 24 60 Q 10 50 18 80" stroke="#312E81" strokeWidth="3" fill="none" />
            <path d="M 96 60 Q 110 50 102 80" stroke="#312E81" strokeWidth="3" fill="none" />
          </g>
        ) : (
          <g>
            <path d="M 24 60 Q 15 70 20 85" stroke="#312E81" strokeWidth="3" fill="none" />
            <path d="M 96 60 Q 105 70 100 85" stroke="#312E81" strokeWidth="3" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Whiskers the Squirrel SVG Avatar
export const WhiskersAvatar: React.FC<{ size?: number; className?: string; isTalking?: boolean }> = ({ size = 120, className = "", isTalking = false }) => {
  return (
    <div className={`relative inline-block select-none ${className} ${isTalking ? 'animate-bounce' : ''}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
        {/* Background Aura */}
        <circle cx="60" cy="60" r="54" fill="#FCE7F3" stroke="#DB2777" strokeWidth="4" />
        
        {/* Fluffy Squirrel Tail */}
        <path d="M 28 85 Q 4 60 16 35 Q 32 15 44 35 Q 40 70 28 85" fill="#EA580C" stroke="#7C2D12" strokeWidth="3" />
        <path d="M 24 75 Q 12 55 22 40" fill="none" stroke="#F97316" strokeWidth="2.5" />

        {/* Head/Face */}
        <circle cx="68" cy="60" r="32" fill="#F97316" stroke="#7C2D12" strokeWidth="3" />

        {/* Ears */}
        <polygon points="52,34 50,15 62,26" fill="#EA580C" stroke="#7C2D12" strokeWidth="2.5" />
        <polygon points="84,34 88,15 76,26" fill="#EA580C" stroke="#7C2D12" strokeWidth="2.5" />
        
        {/* Cute big squirrel cheeks */}
        <circle cx="50" cy="70" r="10" fill="#FDBA74" stroke="#7C2D12" strokeWidth="2" />
        <circle cx="86" cy="70" r="10" fill="#FDBA74" stroke="#7C2D12" strokeWidth="2" />
        
        {/* Eyes */}
        <circle cx="56" cy="52" r="6" fill="#111827" stroke="#7C2D12" strokeWidth="1.5" />
        <circle cx="57.5" cy="50.5" r="1.5" fill="#FFFFFF" />

        <circle cx="80" cy="52" r="6" fill="#111827" stroke="#7C2D12" strokeWidth="1.5" />
        <circle cx="81.5" cy="50.5" r="1.5" fill="#FFFFFF" />

        {/* Nose */}
        <circle cx="68" cy="62" r="3.5" fill="#DB2777" />

        {/* Buck teeth */}
        <rect x="65" y="70" width="6" height="6" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="1.5" />
        <line x1="68" y1="70" x2="68" y2="76" stroke="#7C2D12" strokeWidth="1" />

        {/* Little hands holding a golden coin or acorn */}
        <circle cx="68" cy="85" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <text x="68" y="88" fill="#B45309" fontSize="8" fontWeight="black" textAnchor="middle">C</text>
        
        {/* Tiny paws */}
        <ellipse cx="56" cy="84" rx="4" ry="3" fill="#F97316" stroke="#7C2D12" strokeWidth="1.5" />
        <ellipse cx="80" cy="84" rx="4" ry="3" fill="#F97316" stroke="#7C2D12" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

// Cleo the Wise Cat SVG Avatar
export const CleoAvatar: React.FC<{ size?: number; className?: string; isTalking?: boolean }> = ({ size = 120, className = "", isTalking = false }) => {
  return (
    <div className={`relative inline-block select-none ${className} ${isTalking ? 'animate-bounce' : ''}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
        {/* Background Aura */}
        <circle cx="60" cy="60" r="54" fill="#D1FAE5" stroke="#10B981" strokeWidth="4" />
        
        {/* Pointy Cat Ears */}
        {/* Left Ear */}
        <polygon points="26,38 12,14 40,28" fill="#4B5563" stroke="#1F2937" strokeWidth="3" />
        <polygon points="24,34 16,18 34,26" fill="#FCA5A5" />
        
        {/* Right Ear */}
        <polygon points="94,38 108,14 80,28" fill="#4B5563" stroke="#1F2937" strokeWidth="3" />
        <polygon points="96,34 104,18 86,26" fill="#FCA5A5" />

        {/* Cat Head */}
        <ellipse cx="60" cy="56" rx="38" ry="32" fill="#374151" stroke="#1F2937" strokeWidth="3" />

        {/* Sparkling Emerald Eyes */}
        <ellipse cx="44" cy="50" rx="9" ry="8" fill="#10B981" stroke="#1F2937" strokeWidth="2" />
        {/* Cat Pupil */}
        <ellipse cx="44" cy="50" rx="2" ry="7" fill="#111827" />
        <circle cx="42" cy="47" r="1.5" fill="#FFFFFF" />

        <ellipse cx="76" cy="50" rx="9" ry="8" fill="#10B981" stroke="#1F2937" strokeWidth="2" />
        {/* Cat Pupil */}
        <ellipse cx="76" cy="50" rx="2" ry="7" fill="#111827" />
        <circle cx="74" cy="47" r="1.5" fill="#FFFFFF" />

        {/* Pink Nose */}
        <polygon points="57,58 63,58 60,61" fill="#F472B6" stroke="#1F2937" strokeWidth="1" />

        {/* Smiling Mouth */}
        {isTalking ? (
          <path d="M 54 65 Q 60 74 66 65" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 52 64 Q 56 67 60 64 Q 64 67 68 64" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* Cute Whiskers */}
        <line x1="28" y1="62" x2="10" y2="58" stroke="#1F2937" strokeWidth="2" />
        <line x1="26" y1="68" x2="8" y2="68" stroke="#1F2937" strokeWidth="2" />

        <line x1="92" y1="62" x2="110" y2="58" stroke="#1F2937" strokeWidth="2" />
        <line x1="94" y1="68" x2="112" y2="68" stroke="#1F2937" strokeWidth="2" />

        {/* Chic Blue Collar with Golden Bell */}
        <path d="M 38 84 Q 60 90 82 84" stroke="#3B82F6" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <circle cx="60" cy="89" r="6" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

// Generic Companion Wrapper to render based on selection
interface CompanionAvatarProps {
  id: CompanionType;
  size?: number;
  className?: string;
  isTalking?: boolean;
}

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({ id, size = 120, className = "", isTalking = false }) => {
  // We can also render the BuddyAvatar here or import it
  // Let's create BuddyAvatar as well to keep them all in one clean place!
  if (id === 'luna') {
    return <LunaAvatar size={size} className={className} isTalking={isTalking} />;
  }
  if (id === 'whiskers') {
    return <WhiskersAvatar size={size} className={className} isTalking={isTalking} />;
  }
  if (id === 'cleo') {
    return <CleoAvatar size={size} className={className} isTalking={isTalking} />;
  }
  
  // Default: Buddy the Dog (styled locally)
  return (
    <div className={`relative inline-block select-none ${className} ${isTalking ? 'animate-bounce' : ''}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
        {/* Background Aura */}
        <circle cx="60" cy="60" r="54" fill="#FEF3C7" stroke="#D97706" strokeWidth="4" />
        
        {/* Floppy Ears */}
        <path d="M 24 35 Q 8 45 14 75 Q 24 85 28 65 Z" fill="#78350F" stroke="#451A03" strokeWidth="3" />
        <path d="M 96 35 Q 112 45 106 75 Q 96 85 92 65 Z" fill="#78350F" stroke="#451A03" strokeWidth="3" />
        
        {/* Head/Face */}
        <circle cx="60" cy="58" r="36" fill="#F59E0B" stroke="#451A03" strokeWidth="3" />
        
        {/* Spot around one eye */}
        <circle cx="48" cy="52" r="14" fill="#78350F" opacity="0.3" />

        {/* Eyes */}
        <circle cx="48" cy="52" r="7" fill="#FFFFFF" stroke="#451A03" strokeWidth="2" />
        <circle cx="48" cy="52" r="4.5" fill="#1F2937" />
        <circle cx="49.5" cy="50.5" r="1.5" fill="#FFFFFF" />

        <circle cx="72" cy="52" r="7" fill="#FFFFFF" stroke="#451A03" strokeWidth="2" />
        <circle cx="72" cy="52" r="4.5" fill="#1F2937" />
        <circle cx="73.5" cy="50.5" r="1.5" fill="#FFFFFF" />

        {/* Muzzle */}
        <ellipse cx="60" cy="68" rx="14" ry="10" fill="#FEF3C7" stroke="#451A03" strokeWidth="2" />
        
        {/* Nose */}
        <polygon points="56,64 64,64 60,69" fill="#1F2937" stroke="#1F2937" strokeWidth="1" strokeLinejoin="round" />

        {/* Mouth/Happy tongue */}
        {isTalking ? (
          <g>
            <path d="M 52 71 Q 60 78 68 71" stroke="#451A03" strokeWidth="2.5" fill="none" />
            <path d="M 55 72 Q 60 84 65 72 Z" fill="#EF4444" stroke="#451A03" strokeWidth="1.5" />
          </g>
        ) : (
          <path d="M 52 71 Q 56 75 60 71 Q 64 75 68 71" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Cute collar */}
        <path d="M 40 92 Q 60 98 80 92" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="60" cy="97" r="4.5" fill="#FBBF24" stroke="#451A03" strokeWidth="1" />
      </svg>
    </div>
  );
};
