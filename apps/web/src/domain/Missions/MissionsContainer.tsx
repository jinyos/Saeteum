import { Header } from '@/common/layouts/Header';
import { Spinner } from '@/common/components/Spinner';
import { QueryBoundary } from '@/common/components/QueryBoundary';
import { ButtonGroup } from './components/ButtonGroup';
import { Mission } from './components/Mission';

export default function MissionsContainer() {
  return (
    <div className="flex min-h-full flex-col">
      <Header variant="icon" />
      <div className="flex flex-1 translate-y-[clamp(-3rem,-6dvh,-1.5rem)] flex-col items-center justify-center gap-[clamp(1rem,9dvh,5rem)]">
        <QueryBoundary
          pendingFallback={<Spinner className="size-10 text-ink-tertiary" />}
        >
          <Mission />
          <ButtonGroup />
        </QueryBoundary>
      </div>
    </div>
  );
}
