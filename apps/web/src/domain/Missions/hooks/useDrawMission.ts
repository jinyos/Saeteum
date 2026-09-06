'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { drawMission } from '@/api/missions.api';
import { queryKeys } from '@/lib/queryKeys';

export function useDrawMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: drawMission,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.missions.today(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.stats.summary(),
      });
    },
    onError: () => {
      toast.error('미션 뽑기에 실패했어요. 다시 시도해주세요.');
    },
  });
}
