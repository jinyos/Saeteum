export function Clover({ className }: { className?: string }) {
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
      <path
        d="M24 24
        C21 22 17 19 17 15
        C17 11 21 9 24 13
        C27 9 31 11 31 15
        C31 19 27 22 24 24Z"
      />
      <path
        d="M24 24
        C21 23 17 20 14 21
        C10 22 10 26 13 28
        C10 30 12 34 16 34
        C20 34 22 28 24 24Z"
      />
      <path
        d="M24 24
        C27 23 31 20 34 21
        C38 22 38 26 35 28
        C38 30 36 34 32 34
        C28 34 26 28 24 24Z"
      />
      <path d="M24 24 C24 30 23 35 21 40" />
    </svg>
  );
}
