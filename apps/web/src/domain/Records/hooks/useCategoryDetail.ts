'use client';

import { useSuspenseQueries } from '@tanstack/react-query';
import type { MissionCategory } from '@saeteum/shared';
import { getMe } from '@/api/me.api';
import { getCategoryMissions } from '@/api/records.api';
import { queryKeys } from '@/lib/queryKeys';

export function useCategoryDetail(category: MissionCategory) {
  const [{ data: me }, { data: missions }] = useSuspenseQueries({
    queries: [
      { queryKey: queryKeys.me.detail(), queryFn: getMe },
      {
        queryKey: queryKeys.records.category(category),
        queryFn: () => getCategoryMissions(category),
      },
    ],
  });

  return { me, missions };
}
