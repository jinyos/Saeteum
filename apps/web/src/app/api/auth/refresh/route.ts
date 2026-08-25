import { apiFetch, isApiError } from '@/api/client';
import { HTTP_STATUS } from '@/common/constants';
import {
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from '@/lib/auth/refreshTokenCookie';
import { NextResponse } from 'next/server';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export async function POST() {
  const refreshToken = await getRefreshTokenCookie();

  if (!refreshToken) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'No refresh token.' } },
      { status: HTTP_STATUS.UNAUTHORIZED },
    );
  }

  try {
    const tokens = await apiFetch<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    await setRefreshTokenCookie(tokens.refreshToken);

    return NextResponse.json({ data: { accessToken: tokens.accessToken } });
  } catch (error) {
    if (!isApiError(error)) {
      throw error;
    }

    if (error.code === 'INVALID_REFRESH_TOKEN') {
      await clearRefreshTokenCookie();
    }

    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
}
