'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { getMissionRecord } from '@/api/records.api';
import { queryKeys } from '@/lib/queryKeys';

export function useMissionRecord(missionId: number) {
  return useSuspenseQuery({
    queryKey: queryKeys.records.mission(missionId),
    queryFn: () => getMissionRecord(missionId),
  });
}
