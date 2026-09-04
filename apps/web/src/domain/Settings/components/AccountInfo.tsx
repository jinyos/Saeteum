import Image from 'next/image';
import { PROVIDERS, type Provider } from '@saeteum/shared';
import { formatDate } from '@/common/utils/formatDate';

const PROVIDER_LABEL: Record<Provider, string> = {
  google: '구글',
  kakao: '카카오',
  naver: '네이버',
};

const PROVIDER_ICON: Record<Provider, string> = {
  google: '/icons/google.svg',
  kakao: '/icons/kakao.svg',
  naver: '/icons/naver.svg',
};

const PROVIDER_ICON_MONO: Record<Provider, string> = {
  google: '/icons/google_mono.svg',
  kakao: '/icons/kakao_mono.svg',
  naver: '/icons/naver_mono.svg',
};

interface AccountInfoProps {
  provider: Provider;
  createdAt: string;
}

export function AccountInfo({ provider, createdAt }: AccountInfoProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-body text-sm text-ink-secondary">가입 방법</span>
        <div className="flex gap-3">
          {PROVIDERS.map((candidate) => (
            <span
              key={candidate}
              className="rounded-full border-2 border-ink-primary filter-[url(#hand-rough)]"
            >
              <Image
                src={
                  candidate === provider
                    ? PROVIDER_ICON[candidate]
                    : PROVIDER_ICON_MONO[candidate]
                }
                alt={PROVIDER_LABEL[candidate]}
                width={28}
                height={28}
              />
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-body text-sm text-ink-secondary">가입 날짜</span>
        <p className="text-ink-primary">{formatDate(createdAt)}</p>
      </div>
    </div>
  );
}
