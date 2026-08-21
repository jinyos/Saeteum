export function PaperAirplane({ className }: { className?: string }) {
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
      <path d="M10 6L10 20L43 24Z" />
      <path d="M10 20L7 29L43 24Z" />
      <path d="M18 27.45L21 34L43 24Z" />
    </svg>
  );
}
