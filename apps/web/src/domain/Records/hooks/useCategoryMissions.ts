'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import type { MissionCategory } from '@saeteum/shared';
import { getCategoryMissions } from '@/api/records.api';
import { queryKeys } from '@/lib/queryKeys';

export function useCategoryMissions(category: MissionCategory) {
  return useSuspenseQuery({
    queryKey: queryKeys.records.category(category),
    queryFn: () => getCategoryMissions(category),
  });
}
