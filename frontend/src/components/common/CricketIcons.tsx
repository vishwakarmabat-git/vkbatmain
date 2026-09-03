import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Authentic Red Leather Cricket Ball with White Curved Double-Stitched Seam
 */
export const CricketBallIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <defs>
      <radialGradient id="ballShine" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FF4D5E" />
        <stop offset="45%" stopColor="#C9182B" />
        <stop offset="85%" stopColor="#800E19" />
        <stop offset="100%" stopColor="#4A060C" />
      </radialGradient>
      <filter id="ballShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#C9182B" floodOpacity="0.4" />
      </filter>
    </defs>
    {/* Ball sphere */}
    <circle cx="12" cy="12" r="10" fill="url(#ballShine)" />
    
    {/* Central leather seam ridge */}
    <path
      d="M12 2 C 7 7, 7 17, 12 22"
      stroke="#FAFAFA"
      strokeWidth="1.2"
      strokeDasharray="1.2 1"
      strokeLinecap="round"
      opacity="0.95"
    />
    <path
      d="M12 2 C 17 7, 17 17, 12 22"
      stroke="#FAFAFA"
      strokeWidth="1.2"
      strokeDasharray="1.2 1"
      strokeLinecap="round"
      opacity="0.95"
    />

    {/* Cross stitch detailing */}
    <line x1="8.5" y1="6" x2="15.5" y2="6" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" strokeDasharray="1 1.5" />
    <line x1="7.2" y1="12" x2="16.8" y2="12" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" strokeDasharray="1 1.5" />
    <line x1="8.5" y1="18" x2="15.5" y2="18" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" strokeDasharray="1 1.5" />

    {/* Specular gloss highlight */}
    <ellipse cx="8" cy="7" rx="3" ry="1.8" transform="rotate(-30 8 7)" fill="#FFFFFF" opacity="0.35" />
  </svg>
);

/**
 * 3 Wickets / Stumps with 2 Bails resting on top and crease pitch line
 */
export const CricketStumpsIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Bails */}
    <rect x="4" y="3" width="7" height="1.8" rx="0.6" fill="#F5C542" stroke="#B8860B" strokeWidth="0.4" />
    <rect x="13" y="3" width="7" height="1.8" rx="0.6" fill="#F5C542" stroke="#B8860B" strokeWidth="0.4" />

    {/* Stumps (Off, Middle, Leg) */}
    <rect x="5.5" y="4.5" width="2" height="15.5" rx="0.8" fill="#E5A832" stroke="#AA7C11" strokeWidth="0.4" />
    <rect x="11" y="4.5" width="2" height="15.5" rx="0.8" fill="#F5C542" stroke="#AA7C11" strokeWidth="0.4" />
    <rect x="16.5" y="4.5" width="2" height="15.5" rx="0.8" fill="#E5A832" stroke="#AA7C11" strokeWidth="0.4" />

    {/* Pitch Ground / Crease line */}
    <line x1="2" y1="20.5" x2="22" y2="20.5" stroke="#E2E8F0" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * Handcrafted Cricket Bat with Cane Handle and Chevron Grip
 */
export const CricketBatIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <defs>
      <linearGradient id="batBladeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE08A" />
        <stop offset="60%" stopColor="#D49B24" />
        <stop offset="100%" stopColor="#9E6908" />
      </linearGradient>
    </defs>
    {/* Blade */}
    <path
      d="M15.5 8.5 L9.5 2.5 C9 2 8.2 2 7.7 2.5 L6.5 3.7 C6 4.2 6 5 6.5 5.5 L12.5 11.5 L16.5 21 C16.8 21.6 17.5 22 18.2 21.8 L20 21.2 C20.8 20.9 21.2 20 20.8 19.3 L15.5 8.5 Z"
      fill="url(#batBladeGrad)"
      stroke="#7A4E03"
      strokeWidth="0.6"
    />
    {/* Handle with chevron grip */}
    <path
      d="M5 4 L2.5 1.5 C2.1 1.1 1.5 1.1 1.1 1.5 C0.7 1.9 0.7 2.5 1.1 2.9 L3.6 5.4 Z"
      fill="#181822"
      stroke="#D4AF37"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Crossed Cricket Bats Heraldry (Honor & Heritage)
 */
export const CrossedBatsIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Bat 1 (top-left to bottom-right) */}
    <path
      d="M3 3 L7 7 M7 7 L19 19 C19.6 19.6 20.5 19.6 21 19 L21.5 18.5 C22 18 22 17.1 21.5 16.5 L9.5 4.5 M3 3 L2 2"
      stroke="#F5C542"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Bat 2 (top-right to bottom-left) */}
    <path
      d="M21 3 L17 7 M17 7 L5 19 C4.4 19.6 3.5 19.6 3 19 L2.5 18.5 C2 18 2 17.1 2.5 16.5 L14.5 4.5 M21 3 L22 2"
      stroke="#F5C542"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Center Red Cricket Ball */}
    <circle cx="12" cy="12" r="3.2" fill="#C9182B" stroke="#FFFFFF" strokeWidth="0.8" />
  </svg>
);

/**
 * Sweet Spot Power Ripple Indicator
 */
export const SweetSpotIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="9" stroke="#F5C542" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
    <circle cx="12" cy="12" r="6" stroke="#00FF87" strokeWidth="1.4" opacity="0.8" />
    <circle cx="12" cy="12" r="3" fill="#00FF87" />
    <circle cx="12" cy="12" r="1.2" fill="#FFFFFF" />
  </svg>
);
