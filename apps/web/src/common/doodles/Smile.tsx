export function Smile({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M24,11 Q31,11 34.5,17 Q38,23 35,29.5 Q32,36 24,36.5 Q16,37 12.5,30.5 Q9,24 12.5,17.5 Q16,11 24,11 Z" />
      <path d="M19.5,21 L21,21" />
      <path d="M27,21 L28.5,21" />
      <path d="M16.5,27 Q24,33.5 31.5,27" />
    </svg>
  );
}
