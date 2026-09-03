'use client';

import { Button } from '@/common/components/Button';
import { MissionCard } from '@/common/components/MissionCard';
import { QueryBoundary } from '@/common/components/QueryBoundary';
import { MissionRecordEntry } from './components/MissionRecordEntry';
import { MissionRecordSkeleton } from './components/MissionRecordSkeleton';
import { useMissionRecord } from './hooks/useMissionRecord';

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
      <QueryBoundary pendingFallback={<MissionRecordSkeleton />}>
        <MissionRecordBody missionId={missionId} />
      </QueryBoundary>
    </div>
  );
}
