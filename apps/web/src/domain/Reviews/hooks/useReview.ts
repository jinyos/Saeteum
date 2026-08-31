'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { getReview } from '@/api/reviews.api';
import { queryKeys } from '@/lib/queryKeys';

export function useReview(missionDrawId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.reviews.detail(missionDrawId),
    queryFn: () => getReview(missionDrawId),
  });
}
