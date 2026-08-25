import { DoodleIcon } from './DoodleIcon';

export function Woman({ className }: { className?: string }) {
  return (
    <DoodleIcon className={className}>
      <path d="M24,4 Q28,4 29,9 Q30,14 24,14 Q18,14 19,9 Q20,4 24,4 Z" />
      <path d="M24,14 Q23,21 24,28" />
      <path d="M24,18 Q16,19 10,20" />
      <path d="M24,18 Q29,17 32,12" />
      <path d="M24,28 Q19,35 16,42 L32,42 Q29,35 24,28 Z" />
    </DoodleIcon>
  );
}
