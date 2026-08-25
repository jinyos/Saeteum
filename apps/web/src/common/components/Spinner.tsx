type SpinnerProps = {
  className?: string;
};

export function Spinner({ className }: SpinnerProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-[spin_2s_linear_infinite] filter-[url(#hand-rough)] ${className}`}
    >
      <path
        pathLength="100"
        strokeDasharray="65 35"
        d="M24,11 Q31,11 34.5,17 Q38,23 35,29.5 Q32,36 24,36.5 Q16,37 12.5,30.5 Q9,24 12.5,17.5 Q16,11 24,11 Z"
      />
    </svg>
  );
}
