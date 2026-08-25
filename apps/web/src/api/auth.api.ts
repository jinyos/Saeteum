import { API_BASE_URL } from '@/common/constants';
import { ApiError } from '@/api/client';
import { PROVIDERS, type Provider } from '@saeteum/shared';

const PROVIDER_LABEL: Record<Provider, string> = {
  google: '구글로 시작하기',
  kakao: '카카오로 시작하기',
  naver: '네이버로 시작하기',
};

export function getProviderLoginLinks() {
  return PROVIDERS.map((provider) => ({
    provider,
    label: PROVIDER_LABEL[provider],
    href: `${API_BASE_URL}/auth/${provider}/login`,
  }));
}

export async function exchangeCode(
  code: string,
): Promise<{ accessToken: string }> {
  const res = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { code?: string; message?: string };
    } | null;

    throw new ApiError(
      res.status,
      body?.error?.code ?? 'UNKNOWN_ERROR',
      body?.error?.message ?? `Request failed with status ${res.status}`,
    );
  }

  const body = (await res.json()) as { data: { accessToken: string } };
  return body.data;
}
