import { SESSION_COOKIE } from '@/common/constants';
import { REFRESH_TOKEN_TTL_DAYS, SECONDS_PER_DAY } from '@saeteum/shared';
import { cookies } from 'next/headers';

const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_TOKEN_MAX_AGE_SECONDS = REFRESH_TOKEN_TTL_DAYS * SECONDS_PER_DAY;

export async function getRefreshTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function setRefreshTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });

  cookieStore.set(SESSION_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export async function clearRefreshTokenCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete({ name: REFRESH_TOKEN_COOKIE, path: '/api/auth' });
}
