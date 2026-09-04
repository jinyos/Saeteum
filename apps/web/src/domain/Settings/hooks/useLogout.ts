'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logout } from '@/api/auth.api';
import { setAccessToken } from '@/lib/auth/tokenStore';

export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setAccessToken(null);
      router.push('/');
    },
    onError: () => {
      toast.error('로그아웃에 실패했어요. 다시 시도해주세요.');
    },
  });
}
