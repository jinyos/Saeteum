/**
 * 검증 포인트:
 * 1. Naver 인가 URL을 생성하고 state를 포함한다.
 * 2. authorization code로 access token을 교환한 뒤 프로필을 조회하고 OAuthProfile로 정규화한다.
 * 3. 프로필에 nickname과 name이 모두 없으면 기본 닉네임을 사용한다.
 * 4. access token 교환에 실패하면 AppException을 발생시킨다.
 * 5. 프로필 조회에 실패하면 AppException을 발생시킨다.
 */
import { authConfig } from '@/auth/config/auth.config';
import { NaverProvider } from './naver.provider';
import { AppException } from '@/common/exceptions/app.exception';

describe('NaverProvider', () => {
  let provider: NaverProvider;

  beforeEach(() => {
    provider = new NaverProvider();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1
  it('build Naver authorization URL with state', () => {
    const state = 'test-state';
    const url = new URL(provider.buildAuthorizeUrl(state));

    expect(url.origin).toBe('https://nid.naver.com');
    expect(url.pathname).toBe('/oauth2.0/authorize');

    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe(
      authConfig.providers.naver.clientId,
    );
    expect(url.searchParams.get('redirect_uri')).toBe(
      authConfig.providers.naver.redirectUri,
    );
    expect(url.searchParams.get('state')).toBe(state);
  });

  // 2
  it('exchange authorization code and normalizes Naver profile', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'naver-access' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            response: { id: 'naver-user-1', name: '실명', nickname: '닉네임' },
          }),
          { status: 200 },
        ),
      );

    const profile = await provider.fetchProfile('auth-code');

    expect(profile).toEqual({ providerId: 'naver-user-1', name: '닉네임' });
  });

  // 3
  it('use default nickname when nickname and name are unavailable', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'naver-access' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            response: {
              id: 'naver-user-2',
            },
          }),
          { status: 200 },
        ),
      );

    const profile = await provider.fetchProfile('auth-code');

    expect(profile).toEqual({
      providerId: 'naver-user-2',
      name: '네이버 사용자',
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
        new Response(JSON.stringify({ access_token: 'naver-access' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(new Response('error', { status: 401 }));

    await expect(provider.fetchProfile('auth-code')).rejects.toThrow(
      AppException,
    );
  });
});
