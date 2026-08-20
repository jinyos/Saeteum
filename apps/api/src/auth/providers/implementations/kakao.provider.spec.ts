/**
 * 검증 포인트:
 * 1. Kakao 인가 URL을 생성하고 state를 포함한다.
 * 2. authorization code로 access token을 교환한 뒤 프로필을 조회하고 OAuthProfile로 정규화한다.
 * 3. 프로필에 nickname이 없으면 기본 닉네임을 사용한다.
 * 4. access token 교환에 실패하면 AppException을 발생시킨다.
 * 5. 프로필 조회에 실패하면 AppException을 발생시킨다.
 */
import { authConfig } from '@/auth/config/auth.config';
import { KakaoProvider } from './kakao.provider';
import { AppException } from '@/common/exceptions/app.exception';

describe('KakaoProvider', () => {
  let provider: KakaoProvider;

  beforeEach(() => {
    provider = new KakaoProvider();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1
  it('build Kakao authorization URL with state', () => {
    const state = 'test-state';
    const url = new URL(provider.buildAuthorizeUrl(state));

    expect(url.origin).toBe('https://kauth.kakao.com');
    expect(url.pathname).toBe('/oauth/authorize');

    expect(url.searchParams.get('client_id')).toBe(
      authConfig.providers.kakao.clientId,
    );
    expect(url.searchParams.get('redirect_uri')).toBe(
      authConfig.providers.kakao.redirectUri,
    );
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('scope')).toBe('profile_nickname');
    expect(url.searchParams.get('state')).toBe(state);
  });

  // 2
  it('exchange authorization code and normalizes Kakao profile', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'kakao-access' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 123,
            kakao_account: {
              profile: {
                nickname: '홍길동',
              },
            },
            properties: { nickname: 'fallback' },
          }),
          { status: 200 },
        ),
      );

    const profile = await provider.fetchProfile('auth-code');

    expect(profile).toEqual({
      providerId: '123',
      name: '홍길동',
    });
  });

  // 3
  it('use default nickname when Kakao profile has no nickname', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'kakao-access' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 456,
          }),
          { status: 200 },
        ),
      );

    const profile = await provider.fetchProfile('auth-code');

    expect(profile).toEqual({ providerId: '456', name: '카카오 사용자' });
  });

  // 4
  it('throw AppException when token exchange fails', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response('error', { status: 400 }));

    await expect(provider.fetchProfile('bad-code')).rejects.toThrow(
      AppException,
    );
  });

  // 5
  it('throw AppException when profile retrieval fails', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'kakao-access' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(new Response('error', { status: 401 }));

    await expect(provider.fetchProfile('auth-code')).rejects.toThrow(
      AppException,
    );
  });
});
