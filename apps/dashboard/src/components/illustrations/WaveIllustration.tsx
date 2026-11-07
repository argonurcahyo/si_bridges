export function WaveIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 96" aria-hidden="true" className={className} fill="none">
      <circle cx="80" cy="40" r="30" fill="#0ea5e9" fillOpacity="0.15" />
      <path
        d="M52 46 Q 80 24 108 46 T 164 46"
        stroke="#22d3ee"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M-4 64 Q 26 46 56 64 T 116 64 T 176 64"
        stroke="#0ea5e9"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M80 12 C 92 26, 98 34, 98 42 A 18 18 0 0 1 62 42 C 62 34, 68 26, 80 12Z"
        fill="#38bdf8"
      />
    </svg>
  );
}
