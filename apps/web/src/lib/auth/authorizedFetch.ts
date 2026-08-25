import { apiFetch, isApiError } from '@/api/client';
import { getAccessToken, setAccessToken } from './tokenStore';
import { HTTP_STATUS } from '@/common/constants';

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });

      if (!res.ok) {
        return null;
      }

      const body = (await res.json()) as { data?: { accessToken?: string } };

      return body.data?.accessToken ?? null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function authorizedFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  try {
    return await apiFetch<T>(path, init, getAccessToken());
  } catch (error) {
    if (!isApiError(error) || error.status !== HTTP_STATUS.UNAUTHORIZED) {
      throw error;
    }

    const newToken = await refreshAccessToken();

    if (!newToken) {
      setAccessToken(null);
      throw error;
    }

    setAccessToken(newToken);

    try {
      return await apiFetch<T>(path, init, newToken);
    } catch (retryError) {
      if (
        isApiError(retryError) &&
        retryError.status === HTTP_STATUS.UNAUTHORIZED
      ) {
        setAccessToken(null);
      }

      throw retryError;
    }
  }
}
