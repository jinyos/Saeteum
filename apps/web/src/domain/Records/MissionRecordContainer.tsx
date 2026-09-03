'use client';

import type { FallbackProps } from 'react-error-boundary';
import { isApiError } from '@/api/client';
import { Button } from '@/common/components/Button';
import { MissionCard } from '@/common/components/MissionCard';
import { ErrorFallback, QueryBoundary } from '@/common/components/QueryBoundary';
import { MissionRecordEntry } from './components/MissionRecordEntry';
import { MissionRecordSkeleton } from './components/MissionRecordSkeleton';
import { useMissionRecord } from './hooks/useMissionRecord';

function MissionRecordErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  if (isApiError(error) && error.code === 'RESOURCE_NOT_FOUND') {
    return (
      <div className="flex flex-col items-center gap-10 py-10 text-center">
        <p className="text-ink-secondary">존재하지 않는 기록이에요.</p>
        <Button href="/mypage/records">목록으로 돌아가기</Button>
      </div>
    );
  }

  return <ErrorFallback resetErrorBoundary={resetErrorBoundary} />;
}

interface MissionRecordBodyProps {
  missionId: number;
}

function MissionRecordBody({ missionId }: MissionRecordBodyProps) {
  const { data } = useMissionRecord(missionId);

  return (
    <div className="flex flex-col gap-6">
      <MissionCard content={data.mission.content} label={null} padding="p-6" />

      <div className="flex flex-col gap-4">
        {data.draws.map((draw) => (
          <MissionRecordEntry key={draw.missionDrawId} draw={draw} />
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          href={`/mypage/records/${data.mission.category}`}
          variant="highlight"
          highlightWidth="w-14"
          highlightHeight="h-[85%]"
        >
          나가기
        </Button>
      </div>
    </div>
  );
}

interface MissionRecordContainerProps {
  missionId: number;
}

export default function MissionRecordContainer({
  missionId,
}: MissionRecordContainerProps) {
  return (
    <div className="mx-auto w-[85%] py-6">
      <QueryBoundary
        pendingFallback={<MissionRecordSkeleton />}
        errorFallback={MissionRecordErrorFallback}
      >
        <MissionRecordBody missionId={missionId} />
      </QueryBoundary>
    </div>
  );
}
