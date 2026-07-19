import React from 'react';

/**
 * Hand-drawn actors for the cartoon canvas.
 *
 * The scene used to render every character as a system emoji, which meant the art
 * changed on every OS - a judge on Windows saw entirely different characters than
 * a judge on a Mac - and clashed with the drawn SVG companions in the talk bar.
 * Story-carrying characters are drawn here instead. Incidental props (flowers,
 * butterflies, food) stay as emoji, which is fine: they carry no character.
 *
 * House style, matched to CompanionAvatars: thick dark outlines, flat fills,
 * rounded joins, one highlight per eye.
 */

const OUTLINE = "#3B2412";
const STROKE = 3.2;

export type ActorMood = 'happy' | 'sad' | 'muddy' | 'sparkling';

interface ActorProps {
  size?: number;
  mood?: ActorMood;
  className?: string;
}

/** Buddy-style dog, drawn facing right. */
export const DogActor: React.FC<ActorProps> = ({ size = 120, mood = 'happy', className = "" }) => {
  const muddy = mood === 'muddy';
  const sad = mood === 'sad' || muddy;
  const coat = "#D9A066";
  const coatDark = "#C08A52";
  const belly = "#F0CFA0";
  const pawColor = muddy ? "#6B4423" : coat;

  return (
    <svg viewBox="0 0 150 115" className={className} style={{ width: size, height: size * (115 / 150) }}>
      <g strokeLinejoin="round" strokeLinecap="round" stroke={OUTLINE} strokeWidth={STROKE}>
        {/* Tail - lifts when happy, tucks when sad */}
        <path
          d={sad ? "M28 66 C16 72, 10 80, 12 88" : "M28 60 C14 52, 10 38, 18 28"}
          fill="none"
          strokeWidth={7}
        />

        {/* Back legs */}
        <rect x="34" y="74" width="13" height="27" rx="6" fill={coatDark} />
        <rect x="52" y="76" width="13" height="25" rx="6" fill={coat} />
        {/* Back paws */}
        <rect x="32" y="93" width="17" height="10" rx="5" fill={pawColor} />
        <rect x="50" y="93" width="17" height="10" rx="5" fill={pawColor} />

        {/* Body */}
        <ellipse cx="63" cy="62" rx="36" ry="24" fill={coat} />
        <ellipse cx="66" cy="70" rx="24" ry="14" fill={belly} strokeWidth={2.2} />

        {/* Front legs */}
        <rect x="80" y="74" width="13" height="27" rx="6" fill={coat} />
        <rect x="94" y="76" width="13" height="25" rx="6" fill={coatDark} />
        {/* Front paws */}
        <rect x="78" y="93" width="17" height="10" rx="5" fill={pawColor} />
        <rect x="92" y="93" width="17" height="10" rx="5" fill={pawColor} />

        {/* Head */}
        <circle cx="105" cy="40" r="25" fill={coat} />
        {/* Floppy ear */}
        <path d="M92 22 C80 18, 72 28, 76 42 C79 52, 90 52, 93 44 Z" fill={coatDark} />
        {/* Snout */}
        <ellipse cx="127" cy="47" rx="15" ry="11" fill={belly} />
        <ellipse cx="138" cy="43" rx="5" ry="4" fill={OUTLINE} strokeWidth={0} />
        {/* Mouth */}
        <path
          d={sad ? "M128 56 C124 53, 120 53, 117 56" : "M126 55 C122 60, 116 60, 113 55"}
          fill="none"
          strokeWidth={2.4}
        />

        {/* Eye */}
        <circle cx="110" cy="33" r="5.4" fill="#FFFFFF" strokeWidth={2.2} />
        <circle cx={sad ? 110 : 111} cy={sad ? 35 : 33} r="2.9" fill={OUTLINE} strokeWidth={0} />
        <circle cx={sad ? 111.4 : 112.4} cy={sad ? 33.6 : 31.6} r="1.1" fill="#FFFFFF" strokeWidth={0} />
        {sad && <path d="M104 25 C108 22, 114 23, 116 26" fill="none" strokeWidth={2.2} />}

        {/* Collar */}
        <path d="M88 52 C94 62, 104 64, 112 60" fill="none" stroke="#E4572E" strokeWidth={6} />
      </g>

      {/* Mud splatters sit above the outlines so they read as ON the dog */}
      {muddy && (
        <g fill="#6B4423" opacity="0.9">
          <ellipse cx="58" cy="70" rx="9" ry="5" />
          <ellipse cx="76" cy="64" rx="6" ry="3.6" />
          <ellipse cx="44" cy="62" rx="5" ry="3" />
        </g>
      )}

      {/* Clean-and-proud sparkles */}
      {mood === 'sparkling' && (
        <g fill="#FDE047" stroke="#F59E0B" strokeWidth={1.4} strokeLinejoin="round">
          <path d="M40 26 l3.5 7.5 7.5 3.5 -7.5 3.5 -3.5 7.5 -3.5 -7.5 -7.5 -3.5 7.5 -3.5 Z" />
          <path d="M126 14 l2.6 5.6 5.6 2.6 -5.6 2.6 -2.6 5.6 -2.6 -5.6 -5.6 -2.6 5.6 -2.6 Z" />
        </g>
      )}
    </svg>
  );
};

/** Generic child. Palette varies per instance so a crowd does not look cloned. */
export const KidActor: React.FC<ActorProps & { variant?: number }> = ({
  size = 110, mood = 'happy', variant = 0, className = ""
}) => {
  const sad = mood === 'sad' || mood === 'muddy';
  const shirts = ["#4F9DE0", "#E4572E", "#8B5CF6", "#10B981", "#F59E0B"];
  const hairs = ["#3B2412", "#6B4423", "#1F2937", "#8B5A2B", "#D97706"];
  const skins = ["#F3C9A0", "#D9A066", "#A9713F", "#8B5A38", "#F7DDBE"];
  const shirt = shirts[variant % shirts.length];
  const hair = hairs[variant % hairs.length];
  const skin = skins[variant % skins.length];

  return (
    <svg viewBox="0 0 90 130" className={className} style={{ width: size * (90 / 130), height: size }}>
      <g strokeLinejoin="round" strokeLinecap="round" stroke={OUTLINE} strokeWidth={STROKE}>
        {/* Legs */}
        <rect x="32" y="92" width="12" height="26" rx="5" fill="#3F5A78" />
        <rect x="47" y="92" width="12" height="26" rx="5" fill="#35506C" />
        {/* Shoes */}
        <rect x="28" y="112" width="18" height="10" rx="5" fill="#26303C" />
        <rect x="45" y="112" width="18" height="10" rx="5" fill="#26303C" />

        {/* Body */}
        <rect x="26" y="58" width="39" height="40" rx="14" fill={shirt} />
        {/* Arms */}
        <rect
          x="16" y={sad ? 64 : 60} width="11" height="30" rx="5.5"
          fill={shirt} transform={sad ? "rotate(6 21 79)" : "rotate(-14 21 75)"}
        />
        <rect
          x="64" y={sad ? 64 : 58} width="11" height="30" rx="5.5"
          fill={shirt} transform={sad ? "rotate(-6 69 79)" : "rotate(16 69 73)"}
        />
        {/* Hands */}
        <circle cx="19" cy={sad ? 95 : 92} r="6" fill={skin} />
        <circle cx="73" cy={sad ? 95 : 90} r="6" fill={skin} />

        {/* Head */}
        <circle cx="45" cy="36" r="23" fill={skin} />
        {/* Hair */}
        <path d="M22 33 C22 14, 68 14, 68 33 C64 24, 54 20, 45 22 C36 24, 26 26, 22 33 Z" fill={hair} />

        {/* Eyes */}
        <circle cx="36" cy="37" r="3.6" fill="#FFFFFF" strokeWidth={2} />
        <circle cx="54" cy="37" r="3.6" fill="#FFFFFF" strokeWidth={2} />
        <circle cx="36" cy={sad ? 38.6 : 37} r="1.9" fill={OUTLINE} strokeWidth={0} />
        <circle cx="54" cy={sad ? 38.6 : 37} r="1.9" fill={OUTLINE} strokeWidth={0} />

        {/* Mouth */}
        <path
          d={sad ? "M39 49 C42 46, 48 46, 51 49" : "M38 46 C42 52, 48 52, 52 46"}
          fill="none" strokeWidth={2.4}
        />
      </g>
    </svg>
  );
};

/** Bird, used by the thirsty-birds trouble. */
export const BirdActor: React.FC<ActorProps> = ({ size = 70, mood = 'happy', className = "" }) => {
  const sad = mood === 'sad' || mood === 'muddy';
  return (
    <svg viewBox="0 0 100 80" className={className} style={{ width: size, height: size * 0.8 }}>
      <g strokeLinejoin="round" strokeLinecap="round" stroke={OUTLINE} strokeWidth={STROKE}>
        {/* Tail */}
        <path d="M20 42 L4 32 L8 48 Z" fill="#2F80C2" />
        {/* Body */}
        <ellipse cx="48" cy="44" rx="28" ry="21" fill="#4F9DE0" />
        {/* Wing */}
        <path d="M38 36 C50 30, 66 34, 66 46 C58 52, 44 50, 38 36 Z" fill="#2F80C2" />
        {/* Head */}
        <circle cx="74" cy="28" r="16" fill="#4F9DE0" />
        {/* Beak */}
        <path d="M88 28 L100 33 L88 37 Z" fill="#F59E0B" />
        {/* Eye */}
        <circle cx="78" cy="24" r="4.2" fill="#FFFFFF" strokeWidth={2} />
        <circle cx="78.6" cy={sad ? 25.6 : 24} r="2.2" fill={OUTLINE} strokeWidth={0} />
        {/* Legs */}
        <path d="M44 64 L42 74" fill="none" strokeWidth={2.6} />
        <path d="M56 64 L58 74" fill="none" strokeWidth={2.6} />
      </g>
    </svg>
  );
};

/** Teddy bear, used by the lost-teddy trouble. */
export const TeddyActor: React.FC<ActorProps> = ({ size = 80, mood = 'happy', className = "" }) => {
  const sad = mood === 'sad' || mood === 'muddy';
  const fur = "#C08A52";
  const furLight = "#E8C49A";
  return (
    <svg viewBox="0 0 90 100" className={className} style={{ width: size * 0.9, height: size }}>
      <g strokeLinejoin="round" strokeLinecap="round" stroke={OUTLINE} strokeWidth={STROKE}>
        {/* Legs */}
        <ellipse cx="30" cy="83" rx="13" ry="11" fill={fur} />
        <ellipse cx="60" cy="83" rx="13" ry="11" fill={fur} />
        {/* Arms */}
        <ellipse cx="15" cy="58" rx="11" ry="9" fill={fur} />
        <ellipse cx="75" cy="58" rx="11" ry="9" fill={fur} />
        {/* Body */}
        <ellipse cx="45" cy="63" rx="24" ry="22" fill={fur} />
        <ellipse cx="45" cy="66" rx="14" ry="13" fill={furLight} strokeWidth={2} />
        {/* Ears */}
        <circle cx="27" cy="21" r="10" fill={fur} />
        <circle cx="63" cy="21" r="10" fill={fur} />
        {/* Head */}
        <circle cx="45" cy="32" r="21" fill={fur} />
        <ellipse cx="45" cy="40" rx="11" ry="9" fill={furLight} strokeWidth={2} />
        {/* Nose */}
        <ellipse cx="45" cy="36" rx="4.5" ry="3.5" fill={OUTLINE} strokeWidth={0} />
        {/* Eyes */}
        <circle cx="36" cy="27" r="3" fill={OUTLINE} strokeWidth={0} />
        <circle cx="54" cy="27" r="3" fill={OUTLINE} strokeWidth={0} />
        {/* Mouth */}
        <path
          d={sad ? "M40 46 C43 43, 47 43, 50 46" : "M40 43 C43 47, 47 47, 50 43"}
          fill="none" strokeWidth={2.2}
        />
      </g>
    </svg>
  );
};

/**
 * Decide whether an element should be drawn rather than rendered as emoji.
 * Matches on emoji first (the model picks these freely) then on id/label, so a
 * character Gemini invents mid-game still gets drawn art.
 */
export function resolveActor(
  el: { id: string; emoji: string; label: string }
): { kind: 'dog' | 'kid' | 'bird' | 'teddy'; variant: number } | null {
  const emoji = (el.emoji || "").trim();
  const text = `${el.id} ${el.label}`.toLowerCase();

  const kidVariant = () => {
    // Stable per-element variant so a queue of customers is not identical clones.
    let hash = 0;
    for (const ch of el.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return hash % 5;
  };

  // Emoji is the reliable signal, so it decides first.
  if (/🐕|🐶|🐩|🦮/.test(emoji)) return { kind: 'dog', variant: 0 };
  if (/🧸/.test(emoji)) return { kind: 'teddy', variant: 0 };
  if (/🐦|🕊|🐤|🐥|🦜/.test(emoji)) return { kind: 'bird', variant: 0 };
  // Includes the reaction faces the simulations swap in for a character mid-scene.
  if (/🚶|🧒|👧|👦|🧍|👩|👨|👵|👴|🙋|🥵|😓|😰|😢|😭|🤒/.test(emoji)) {
    return { kind: 'kid', variant: kidVariant() };
  }

  // Fall back to the name ONLY when there is no emoji to contradict it. Matching on
  // text alone turned a football with id "kid-ball" into a child.
  if (emoji) return null;

  if (/\b(dog|puppy|pup)\b/.test(text)) return { kind: 'dog', variant: 0 };
  if (/\b(teddy|bear)\b/.test(text)) return { kind: 'teddy', variant: 0 };
  if (/\b(bird|sparrow|dove)\b/.test(text)) return { kind: 'bird', variant: 0 };
  if (/\b(kid|child|boy|girl|customer|friend|person|neighbou?r)\b/.test(text)) {
    return { kind: 'kid', variant: kidVariant() };
  }
  return null;
}

/** Pick a mood from the element's own label/bubble, so the art tracks the story. */
export function resolveMood(el: { label: string; bubbleText?: string; emoji: string }): ActorMood {
  const text = `${el.label} ${el.bubbleText || ""}`.toLowerCase();
  if (/sparkl|clean|shiny|fresh|yay/.test(text)) return 'sparkling';
  if (/mud|dirty|messy|filthy/.test(text)) return 'muddy';
  if (/sad|lost|thirsty|tired|hot|sick|cry|help|wet|soak|ruin|uh-oh|oh no/.test(text)) return 'sad';
  return 'happy';
}
