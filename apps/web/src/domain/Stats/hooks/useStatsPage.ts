'use client';

import { useSuspenseQueries } from '@tanstack/react-query';
import { getMe } from '@/api/me.api';
import { getStats } from '@/api/stats.api';
import { queryKeys } from '@/lib/queryKeys';

export function useStatsPage() {
  const [{ data: me }, { data: stats }] = useSuspenseQueries({
    queries: [
      { queryKey: queryKeys.me.detail(), queryFn: getMe },
      { queryKey: queryKeys.stats.summary(), queryFn: getStats },
    ],
  });

  return { me, stats };
}
