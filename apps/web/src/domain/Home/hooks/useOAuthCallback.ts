'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCode } from '@/api/auth.api';
import { setAccessToken } from '@/lib/auth/tokenStore';

export function useOAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [isExchanging, setIsExchanging] = useState(!!code);
  const processedCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!code) {
      return;
    }
    if (processedCodeRef.current === code) {
      return;
    }
    processedCodeRef.current = code;

    exchangeCode(code)
      .then(({ accessToken }) => {
        setAccessToken(accessToken);
      })
      .catch((error) => {
        console.error('OAuth code exchange failed:', error);
        toast.error('로그인에 실패했어요. 다시 시도해주세요.');
      })
      .finally(() => {
        setIsExchanging(false);
        router.replace('/');
      });
    // code는 최초 진입 시 한 번만 처리하면 되므로 code만 의존성으로 둔다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return { isExchanging };
}
