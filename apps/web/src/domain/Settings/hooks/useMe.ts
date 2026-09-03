'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { getMe } from '@/api/me.api';
import { queryKeys } from '@/lib/queryKeys';

export function useMe() {
  return useSuspenseQuery({
    queryKey: queryKeys.me.detail(),
    queryFn: getMe,
  });
}
