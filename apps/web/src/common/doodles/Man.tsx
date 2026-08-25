import { DoodleIcon } from './DoodleIcon';

export function Man({ className }: { className?: string }) {
  return (
    <DoodleIcon className={className}>
      <path d="M24,4 Q28,4 29,9 Q30,14 24,14 Q18,14 19,9 Q20,4 24,4 Z" />
      <path d="M24,14 Q23,21 24,28" />
      <path d="M24,18 Q18,16 14,10" />
      <path d="M24,18 Q32,19 38,20" />
      <path d="M24,28 Q20,34 17,42" />
      <path d="M24,28 Q28,34 31,42" />
    </DoodleIcon>
  );
}
