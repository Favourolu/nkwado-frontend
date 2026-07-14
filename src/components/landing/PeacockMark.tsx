export function PeacockMark({ className }: { className?: string }) {
  const feathers = [
    { angle: -48, base: "#0f6e6e", tip: "#5eead4" },
    { angle: -24, base: "#065f46", tip: "#34d399" },
    { angle: 0, base: "#92400e", tip: "#fbbf24" },
    { angle: 24, base: "#5b21b6", tip: "#c4b5fd" },
    { angle: 48, base: "#1e3a8a", tip: "#60a5fa" },
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Nkwado peacock mark"
    >
      <g transform="translate(50, 62)">
        {feathers.map((f, i) => (
          <g key={i} transform={`rotate(${f.angle})`}>
            <path
              d="M0,0 C10,-14 8,-34 0,-46 C-8,-34 -10,-14 0,0 Z"
              fill={`url(#feather-gradient-${i})`}
            />
            <defs>
              <linearGradient id={`feather-gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={f.tip} />
                <stop offset="100%" stopColor={f.base} />
              </linearGradient>
            </defs>
          </g>
        ))}
        <circle cx="0" cy="2" r="9" fill="#1c1917" />
        <circle cx="2.5" cy="-1" r="1.6" fill="#fde68a" />
      </g>
    </svg>
  );
}
