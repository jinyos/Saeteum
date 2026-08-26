'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { getTodayMission } from '@/api/missions.api';
import { queryKeys } from '@/lib/queryKeys';

export function useTodayMission() {
  return useSuspenseQuery({
    queryKey: queryKeys.missions.today(),
    queryFn: getTodayMission,
  });
}
