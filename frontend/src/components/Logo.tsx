interface LogoProps {
  size?: number;
  opacity?: number;
}

export function Logo({ size = 32, opacity = 1 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="logo-stem" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B5FD9" />
          <stop offset="100%" stopColor="#5A3FB8" />
        </linearGradient>
        <linearGradient id="logo-bowl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5A3FB8" />
          <stop offset="100%" stopColor="#2C8C9E" />
        </linearGradient>
      </defs>
      <rect x="28" y="20" width="14" height="60" rx="3" fill="url(#logo-stem)" />
      <path
        d="M42 20 H60 A18 18 0 0 1 60 56 H42 V44 H58 A6 6 0 0 0 58 32 H42 Z"
        fill="url(#logo-bowl)"
      />
    </svg>
  );
}