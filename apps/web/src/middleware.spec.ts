/**
 * @jest-environment node
 */

/**
 * 검증 포인트:
 * 1. has_session 쿠키가 없으면 '/'로 리다이렉트한다.
 * 2. has_session 쿠키가 있으면 요청을 그대로 통과시킨다.
 */
import type { NextRequest } from 'next/server';
import { middleware } from './middleware';

function buildRequest(hasSession: boolean): NextRequest {
  return {
    url: 'http://localhost:3000/mypage',
    cookies: {
      has: () => hasSession,
    },
  } as unknown as NextRequest;
}

describe('middleware', () => {
  // 1
  it("redirect to '/' when has_session cookie is missing", () => {
    const response = middleware(buildRequest(false));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  // 2
  it('pass the request through when has_session cookie exists', () => {
    const response = middleware(buildRequest(true));

    expect(response.headers.get('location')).toBeNull();
  });
});
