import React from 'react';
import { ArenaPhase } from '../game/booleanArena';

export const LogicQuestCrest: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M32 4L56 14V30C56 45.2 45.8 56.6 32 60C18.2 56.6 8 45.2 8 30V14L32 4Z"
      fill="#0f172a"
      stroke="#10b981"
      strokeWidth="2.5"
    />
    <path
      d="M32 10L50 18V30C50 41.8 42.1 50.8 32 53.8C21.9 50.8 14 41.8 14 30V18L32 10Z"
      fill="#1e293b"
      stroke="#34d399"
      strokeOpacity="0.35"
      strokeWidth="1.2"
    />
    {/* Grade IFPR estilizada em blocos lógicos */}
    <rect x="21" y="20" width="6" height="6" rx="1.5" fill="#10b981" />
    <rect x="29" y="20" width="6" height="6" rx="1.5" fill="#34d399" />
    <rect x="21" y="28" width="6" height="6" rx="1.5" fill="#34d399" />
    <rect x="29" y="28" width="6" height="6" rx="1.5" fill="#10b981" />
    <rect x="37" y="28" width="6" height="6" rx="1.5" fill="#10b981" />
    <rect x="21" y="36" width="6" height="6" rx="1.5" fill="#10b981" />
    <rect x="29" y="36" width="6" height="6" rx="1.5" fill="#34d399" />
    <circle cx="40" cy="23" r="3" fill="#f8fafc" />
  </svg>
);

export const CoffeeLifeIcon: React.FC<{ active: boolean; className?: string }> = ({
  active,
  className = 'w-7 h-7',
}) => (
  <svg
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Xícara de Café */}
    <path
      d="M5 11H19V18C19 21.3137 16.3137 24 13 24H11C7.68629 24 5 21.3137 5 18V11Z"
      fill={active ? '#10b981' : '#1e293b'}
      stroke={active ? '#a7f3d0' : '#475569'}
      strokeWidth="1.8"
    />
    <path
      d="M19 13H21.5C22.8807 13 24 14.1193 24 15.5V16.5C24 17.8807 22.8807 19 21.5 19H19"
      stroke={active ? '#a7f3d0' : '#475569'}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Vapor quando cheio */}
    {active ? (
      <>
        <path d="M9.5 7.5C9.5 6 10.5 5.5 10.5 4" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M14.5 7.5C14.5 6 15.5 5.5 15.5 4" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ) : (
      <path d="M8 15L16 20M16 15L8 20" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" />
    )}
  </svg>
);

interface BugSpriteProps {
  phase: ArenaPhase;
  hitFlash: boolean;
  defeated: boolean;
}

export const BugSprite: React.FC<BugSpriteProps> = ({ phase, hitFlash, defeated }) => {
  const primaryColor = phase === 1 ? '#10b981' : phase === 2 ? '#f59e0b' : '#ef4444';
  const secondaryColor = phase === 1 ? '#064e3b' : phase === 2 ? '#78350f' : '#7f1d1d';
  const eyeColor = hitFlash ? '#ffffff' : phase === 1 ? '#34d399' : phase === 2 ? '#fbbf24' : '#fca5a5';

  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-200 ${
        hitFlash ? 'animate-bug-shake scale-95' : 'scale-100'
      } ${defeated ? 'opacity-30 scale-90 grayscale' : 'opacity-100'}`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-24 h-24 md:w-28 md:h-28 drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
        aria-hidden="true"
      >
        {/* Pernas mecânicas do Bug */}
        <path d="M26 45L12 34M24 62H8M26 78L12 90" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M94 45L108 34M96 62H112M94 78L108 90" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />

        {/* Antenas */}
        <path d="M44 26L34 12M76 26L86 12" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="33" cy="11" r="3.5" fill={eyeColor} />
        <circle cx="87" cy="11" r="3.5" fill={eyeColor} />

        {/* Carapaça externa */}
        <rect
          x="28"
          y="26"
          width="64"
          height="68"
          rx="18"
          fill={hitFlash ? '#ffffff' : secondaryColor}
          stroke={primaryColor}
          strokeWidth="3.5"
        />

        {/* Detalhe interno de circuito */}
        <path
          d="M60 32V88M34 52H86"
          stroke={hitFlash ? '#0f172a' : primaryColor}
          strokeOpacity="0.45"
          strokeWidth="2"
        />

        {/* Visor / Olhos do Bug */}
        <rect x="37" y="40" width="46" height="18" rx="6" fill="#0f172a" stroke={primaryColor} strokeWidth="1.5" />
        {phase === 3 ? (
          <>
            <path d="M43 45L51 53M51 45L43 53" stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round" />
            <path d="M69 45L77 53M77 45L69 53" stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="48" cy="49" r="4.5" fill={eyeColor} />
            <circle cx="72" cy="49" r="4.5" fill={eyeColor} />
          </>
        )}

        {/* Símbolo lógico no tórax */}
        <text
          x="60"
          y="77"
          textAnchor="middle"
          fill={hitFlash ? '#0f172a' : '#f8fafc'}
          fontSize="15"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {phase === 1 ? '&& ||' : phase === 2 ? '!( )' : '!= null'}
        </text>
      </svg>
    </div>
  );
};
