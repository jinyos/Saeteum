'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createReview,
  getReviewPhotoUploadTicket,
  uploadReviewPhoto,
} from '@/api/reviews.api';
import { queryKeys } from '@/lib/queryKeys';
import type { EmotionTag } from '@saeteum/shared';
import { isApiError } from '@/api/client';

interface CreateReviewFormInput {
  missionDrawId: string;
  rating?: number;
  content?: string;
  emotionTags?: EmotionTag[];
  photoFile?: File;
}

async function resolvePhotoPath(
  photoFile: File | undefined,
): Promise<string | undefined> {
  if (!photoFile) {
    return undefined;
  }

  const ticket = await getReviewPhotoUploadTicket();
  await uploadReviewPhoto(ticket.uploadUrl, photoFile);

  return ticket.photoPath;
}

export function useCreateReview() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoFile, ...rest }: CreateReviewFormInput) => {
      const photoPath = await resolvePhotoPath(photoFile);
      return createReview({ ...rest, photoPath });
    },
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.missions.today(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.reviews.detail(variables.missionDrawId),
      });
      router.push(`/reviews/${variables.missionDrawId}`);
    },
    onError: (error) => {
      if (isApiError(error)) {
        switch (error.code) {
          case 'REVIEW_CLOSED':
            toast.error('자정이 지나 오늘은 후기를 작성할 수 없어요.');
            return;
          case 'REVIEW_ALREADY_EXISTS':
            toast.error('이미 오늘의 후기를 작성했어요.');
            return;
          case 'REVIEW_TOO_MANY_TAGS':
            toast.error('감정 태그는 3개까지만 선택할 수 있어요.');
            return;
          case 'REVIEW_EMPTY_INPUT':
            toast.error('최소 1개 항목은 입력해야 해요.');
            return;
        }
      }
      toast.error('후기 저장에 실패했어요. 다시 시도해주세요.');
    },
  });
}
