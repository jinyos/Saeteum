/**
 * 검증 포인트:
 * 1. Google 인가 URL을 생성하고 state를 포함한다.
 * 2. authorization code로 access token을 교환한 뒤 프로필을 조회하고 OAuthProfile로 정규화한다.
 * 3. 프로필에 name이 없으면 기본 닉네임을 사용한다.
 * 4. access token 교환에 실패하면 AppException을 발생시킨다.
 * 5. 프로필 조회에 실패하면 AppException을 발생시킨다.
 */
import { authConfig } from '@/auth/config/auth.config';
import { GoogleProvider } from './google.provider';
import { AppException } from '@/common/exceptions/app.exception';

describe('GoogleProvider', () => {
  let provider: GoogleProvider;

  beforeEach(() => {
    provider = new GoogleProvider();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1
  it('build Google authorization URL with state', () => {
    const state = 'test-state';
    const url = new URL(provider.buildAuthorizeUrl(state));

    expect(url.origin).toBe('https://accounts.google.com');
    expect(url.pathname).toBe('/o/oauth2/v2/auth');

    expect(url.searchParams.get('client_id')).toBe(
      authConfig.providers.google.clientId,
    );
    expect(url.searchParams.get('redirect_uri')).toBe(
      authConfig.providers.google.redirectUri,
    );
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('scope')).toBe('openid profile');
    expect(url.searchParams.get('state')).toBe(state);
  });

  // 2
  it('exchange authorization code and normalizes Google profile', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'google-access' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sub: 'google-user-1', name: '홍길동' }), {
          status: 200,
        }),
      );

    const profile = await provider.fetchProfile('auth-code');

    expect(profile).toEqual({ providerId: 'google-user-1', name: '홍길동' });
  });

  // 3
  it('use default nickname when Google profile has no name', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'google-access' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sub: 'google-user-2' }), {
          status: 200,
        }),
      );

    const profile = await provider.fetchProfile('auth-code');

    expect(profile).toEqual({
      providerId: 'google-user-2',
      name: '구글 사용자',
    });
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
        new Response(JSON.stringify({ access_token: 'google-access' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(new Response('error', { status: 401 }));

    await expect(provider.fetchProfile('auth-code')).rejects.toThrow(
      AppException,
    );
  });
});
