'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Provider } from '@saeteum/shared';
import { getProviderLoginLinks } from '@/api/auth.api';
import { Button } from '@/common/components/Button';

const PROVIDER_ICON: Record<Provider, string> = {
  google: '/icons/google.svg',
  kakao: '/icons/kakao.svg',
  naver: '/icons/naver.svg',
};

export function LoginButton() {
  const [showProviders, setShowProviders] = useState(false);

  if (!showProviders) {
    return (
      <Button
        color="red"
        width="w-[140px]"
        height="h-11"
        onClick={() => setShowProviders(true)}
      >
        시작하기
      </Button>
    );
  }

  return (
    <div className="flex justify-center gap-4">
      {getProviderLoginLinks().map(({ provider, label, href }) => (
        <a
          key={provider}
          href={href}
          className="rounded-full border-2 border-ink-primary filter-[url(#hand-rough)] hover:filter-[url(#hand-rough-hover)]"
        >
          <Image
            src={PROVIDER_ICON[provider]}
            alt={label}
            width={40}
            height={40}
          />
        </a>
      ))}
    </div>
  );
}
