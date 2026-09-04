'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isApiError } from '@/api/client';
import { updateNickname } from '@/api/me.api';
import { queryKeys } from '@/lib/queryKeys';

export function useUpdateNickname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nickname: string) => updateNickname(nickname),
    onSuccess: (me) => {
      queryClient.setQueryData(queryKeys.me.detail(), me);
      toast.success('닉네임을 저장했어요.');
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'VALIDATION_ERROR') {
        toast.error('닉네임은 1자 이상 20자 이하로 입력해주세요.');
        return;
      }
      toast.error('닉네임 저장에 실패했어요. 다시 시도해주세요.');
    },
  });
}
