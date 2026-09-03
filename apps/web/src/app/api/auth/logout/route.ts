import { apiFetch, isApiError } from '@/api/client';
import { HTTP_STATUS } from '@/common/constants';
import {
  clearRefreshTokenCookie,
  clearSessionCookie,
  getRefreshTokenCookie,
} from '@/lib/auth/refreshTokenCookie';
import { NextRequest, NextResponse } from 'next/server';

function extractAccessToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  return header?.replace(/^Bearer\s+/i, '') ?? null;
}

export async function POST(request: NextRequest) {
  const refreshToken = await getRefreshTokenCookie();

  if (!refreshToken) {
    await clearRefreshTokenCookie();
    await clearSessionCookie();

    return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  }

  try {
    await apiFetch<void>(
      '/auth/logout',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
      extractAccessToken(request),
    );
  } catch (error) {
    if (!isApiError(error)) {
      throw error;
    }
  }

  await clearRefreshTokenCookie();
  await clearSessionCookie();

  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
}
