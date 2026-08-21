export function HighlightMark({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 82 40"
      preserveAspectRatio="none"
      className={`absolute left-1/2 top-1/2 h-[55%] w-9 -translate-x-1/2 -translate-y-1/2 ${className}`}
      fill="currentColor"
    >
      <path d="M2,18 Q20,14 40,17 Q60,13 80,16 L79,34 Q60,37 40,33 Q20,37 3,33 Z" />
    </svg>
  );
}
