import { DoodleIcon } from './DoodleIcon';

export function Flower({ className }: { className?: string }) {
  return (
    <DoodleIcon className={className}>
      <path d="M24,11 Q27.8,10.6 29.9,15.9 Q35.4,16.3 35.9,20.1 Q37.4,23.4 33,26.9 Q34.8,32.8 31.9,34.9 Q29,37.5 24,34.5 Q19.4,37.1 16.7,34.1 Q13.2,32.5 14.5,27.1 Q10.1,23.4 11.6,20 Q12.5,16.5 18.4,16.3 Q20.4,10.8 24,11 Z" />
    </DoodleIcon>
  );
}
