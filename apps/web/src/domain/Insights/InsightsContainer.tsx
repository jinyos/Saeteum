import { LockKeyhole } from 'lucide-react';
import { Button } from '@/common/components/Button';

export default function InsightsContainer() {
  return (
    <div className="mx-auto flex w-[85%] flex-1 flex-col py-6">
      <div className="flex flex-1 flex-col gap-6">
        <div className="relative flex flex-1 flex-col items-center justify-center gap-4 rounded-md border-2 border-ink-primary bg-white px-6 py-10 filter-[url(#hand-rough)]">
          <LockKeyhole
            size={40}
            strokeWidth={1.5}
            className="text-ink-tertiary"
          />
          <p className="text-center text-ink-secondary">
            AI 분석은 준비 중이에요.
          </p>
        </div>

        <div className="my-4 flex justify-center">
          <Button
            href="/"
            variant="highlight"
            highlightWidth="w-14"
            highlightHeight="h-[85%]"
          >
            나가기
          </Button>
        </div>
      </div>
    </div>
  );
}
