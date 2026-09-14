interface ConstellationIconProps {
  size?: number;
  className?: string;
}

export function ConstellationIcon({ size = 16, className = '' }: ConstellationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Astronomical constellation lines connecting celestial star nodes */}
      <polyline points="4 18 8.5 12.5 15 14.5 20 6" opacity="0.8" />
      <line x1="8.5" y1="12.5" x2="11.5" y2="4.5" opacity="0.8" />
      <line x1="11.5" y1="4.5" x2="20" y2="6" opacity="0.8" strokeDasharray="1.5 2" />

      {/* Primary alpha star */}
      <circle cx="20" cy="6" r="2.2" fill="currentColor" />
      {/* Secondary celestial stars */}
      <circle cx="11.5" cy="4.5" r="1.7" fill="currentColor" />
      <circle cx="8.5" cy="12.5" r="2" fill="currentColor" />
      <circle cx="15" cy="14.5" r="1.7" fill="currentColor" />
      <circle cx="4" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}
