'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { isApiError } from '@/api/client';
import { deleteReview } from '@/api/reviews.api';
import { queryKeys } from '@/lib/queryKeys';

interface DeleteReviewInput {
  reviewId: string;
  missionDrawId: string;
}

export function useDeleteReview() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId }: DeleteReviewInput) => deleteReview(reviewId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.missions.today(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.stats.summary(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.reviews.detail(variables.missionDrawId),
      });
      router.push('/');
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'REVIEW_CLOSED') {
        toast.error('자정이 지나 이 후기는 삭제할 수 없어요.');
        return;
      }
      toast.error('후기 삭제에 실패했어요. 다시 시도해주세요.');
    },
  });
}
