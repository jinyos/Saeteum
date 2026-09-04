'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logout } from '@/api/auth.api';
import { deleteMe } from '@/api/me.api';
import { setAccessToken } from '@/lib/auth/tokenStore';

export function useDeleteAccount() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await deleteMe();

      // 계정은 이미 삭제됐으니 로그아웃 정리(쿠키 삭제)가 실패해도 탈퇴 자체를 실패로 처리하지 않는다.
      try {
        await logout();
      } catch {
        // best-effort cleanup
      }
    },
    onSuccess: () => {
      setAccessToken(null);
      router.push('/');
    },
    onError: () => {
      toast.error('탈퇴에 실패했어요. 다시 시도해주세요.');
    },
  });
}
