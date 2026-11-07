export function KorridorIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 260" role="img" aria-hidden="true" className={className} fill="none">
      <defs>
        <linearGradient id="kor-langit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0ea5e9" stopOpacity="0.35" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="kor-sungai" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="kor-bukit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10b981" stopOpacity="0.45" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect width="480" height="260" rx="20" fill="url(#kor-langit)" />
      <circle cx="390" cy="62" r="26" fill="#fbbf24" fillOpacity="0.35" />

      <path
        d="M0 180 C 60 150, 110 150, 160 170 S 260 200, 320 170 S 420 140, 480 160 L480 260 L0 260Z"
        fill="url(#kor-bukit)"
      />
      <path
        d="M0 210 C 70 190, 130 205, 200 195 S 340 180, 480 205 L480 260 L0 260Z"
        fill="#10b981"
        fillOpacity="0.18"
      />

      <path
        d="M20 118 C 90 92, 130 150, 200 126 S 310 88, 380 118 S 440 150, 470 128"
        stroke="url(#kor-sungai)"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M20 118 C 90 92, 130 150, 200 126 S 310 88, 380 118 S 440 150, 470 128"
        stroke="#e0f2fe"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeDasharray="6 10"
        strokeLinecap="round"
      />

      {[
        { x: 52, y: 110, c: "#10b981" },
        { x: 150, y: 138, c: "#f59e0b" },
        { x: 250, y: 118, c: "#10b981" },
        { x: 340, y: 110, c: "#ef4444" },
        { x: 430, y: 130, c: "#10b981" },
      ].map((node) => (
        <g key={`${node.x}-${node.y}`}>
          <circle cx={node.x} cy={node.y} r="13" fill={node.c} fillOpacity="0.25" />
          <circle cx={node.x} cy={node.y} r="6" fill={node.c} stroke="#fff" strokeWidth="2" />
        </g>
      ))}

      <g fill="#e0f2fe" fillOpacity="0.8">
        <rect x="44" y="34" width="46" height="14" rx="7" />
        <rect x="72" y="26" width="26" height="14" rx="7" />
      </g>
    </svg>
  );
}
