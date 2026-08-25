type DoodleIconProps = {
  className?: string;
  children: React.ReactNode;
};

export function DoodleIcon({ className, children }: DoodleIconProps) {
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
      {children}
    </svg>
  );
}
