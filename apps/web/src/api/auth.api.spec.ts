/**
 * 검증 포인트:
 * exchangeCode
 *   1. 성공하면 accessToken을 반환한다.
 *   2. 실패하면 서버가 내려준 code/message로 ApiError를 던진다.
 *   3. 실패 응답 body가 JSON이 아니면 UNKNOWN_ERROR로 처리한다.
 * logout
 *   4. access token이 있으면 Authorization 헤더에 실어 POST /api/auth/logout을 호출한다.
 *   5. access token이 없으면 Authorization 헤더 없이 호출한다.
 */
import { exchangeCode, logout } from './auth.api';
import { HTTP_STATUS } from '@/common/constants';
import { getAccessToken } from '@/lib/auth/tokenStore';

jest.mock('@/lib/auth/tokenStore', () => ({ getAccessToken: jest.fn() }));

const mockedGetAccessToken = jest.mocked(getAccessToken);

function mockFetchResponse(
  body: unknown,
  { ok = true, status = 200 }: { ok?: boolean; status?: number } = {},
): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

global.fetch = global.fetch ?? jest.fn();

describe('exchangeCode', () => {
  const fetchSpy = jest.spyOn(global, 'fetch');

  beforeEach(() => {
    fetchSpy.mockReset();
  });

  // 1
  it('return accessToken on success', async () => {
    fetchSpy.mockResolvedValue(
      mockFetchResponse({ data: { accessToken: 'token-1' } }),
    );

    await expect(exchangeCode('auth-code')).resolves.toEqual({
      accessToken: 'token-1',
    });
  });

  // 2
  it('throw ApiError with server-provided code and message on failure', async () => {
    fetchSpy.mockResolvedValue(
      mockFetchResponse(
        { error: { code: 'INVALID_OAUTH_CODE', message: 'invalid code' } },
        { ok: false, status: HTTP_STATUS.BAD_REQUEST },
      ),
    );

    await expect(exchangeCode('auth-code')).rejects.toEqual(
      expect.objectContaining({
        status: HTTP_STATUS.BAD_REQUEST,
        code: 'INVALID_OAUTH_CODE',
        message: 'invalid code',
      }),
    );
  });

  // 3
  it('fall back to UNKNOWN_ERROR when error body is not JSON', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      json: async () => {
        throw new Error('invalid json');
      },
    } as unknown as Response);

    await expect(exchangeCode('auth-code')).rejects.toEqual(
      expect.objectContaining({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        code: 'UNKNOWN_ERROR',
      }),
    );
  });
});

describe('logout', () => {
  const fetchSpy = jest.spyOn(global, 'fetch');

  beforeEach(() => {
    fetchSpy.mockReset();
    mockedGetAccessToken.mockReset();
  });

  // 4
  it('call POST /api/auth/logout with the access token as a Bearer header', async () => {
    mockedGetAccessToken.mockReturnValue('token-1');
    fetchSpy.mockResolvedValue(mockFetchResponse(null));

    await logout();

    expect(fetchSpy).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: 'Bearer token-1' },
    });
  });

  // 5
  it('call POST /api/auth/logout without an Authorization header when there is no access token', async () => {
    mockedGetAccessToken.mockReturnValue(null);
    fetchSpy.mockResolvedValue(mockFetchResponse(null));

    await logout();

    expect(fetchSpy).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: undefined,
    });
  });
});
