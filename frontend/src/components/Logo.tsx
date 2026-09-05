interface LogoProps {
  size?: number;
  opacity?: number;
}

export function Logo({ size = 32, opacity = 1 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <rect width="32" height="32" rx="9" fill="#faf5e9" />
      <rect x="5" y="5" width="8" height="8" rx="2" fill="#b25a34" />
      <rect x="15" y="5" width="8" height="8" rx="2" fill="#7c2438" />
      <rect x="5" y="15" width="8" height="8" rx="2" fill="#6b7a45" />
      <path
        d="M16 20.5L20 24.5L27.5 14"
        stroke="#7c2438"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
