/**
 * 검증 포인트:
 * refreshAccessToken
 *   1. refresh에 성공하면 새 accessToken을 반환한다.
 *   2. 응답이 실패(ok=false)면 null을 반환한다.
 *   3. 응답에 accessToken이 없으면 null을 반환한다.
 *   4. fetch 자체가 실패하면 null을 반환한다.
 *   5. 동시에 여러 번 호출해도 실제 요청은 한 번만 나간다.
 * authorizedFetch
 *   6. 요청이 성공하면 결과를 그대로 반환한다.
 *   7. 401이 아닌 에러는 refresh 시도 없이 그대로 던진다.
 *   8. 401이면 refresh 후 새 토큰으로 한 번 재시도한다.
 *   9. refresh에 실패하면 토큰을 비우고 원래 에러를 던진다.
 *   10. 재시도도 401이면 토큰을 비우고 재시도 에러를 던진다.
 *   11. 재시도가 401이 아닌 에러로 실패하면 새 토큰은 유지한 채 에러를 던진다.
 */
import { apiFetch, ApiError } from '@/api/client';
import { HTTP_STATUS } from '@/common/constants';
import { authorizedFetch, refreshAccessToken } from './authorizedFetch';
import { getAccessToken, setAccessToken } from './tokenStore';

jest.mock('@/api/client', () => ({
  ...jest.requireActual('@/api/client'),
  apiFetch: jest.fn(),
}));

const mockedApiFetch = jest.mocked(apiFetch);

function unauthorizedError(message = 'expired') {
  return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', message);
}

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

const fetchSpy = jest.spyOn(global, 'fetch');

describe('refreshAccessToken', () => {
  beforeEach(() => {
    fetchSpy.mockReset();
  });

  // 1
  it('return new access token when refresh succeeds', async () => {
    fetchSpy.mockResolvedValue(
      mockFetchResponse({ data: { accessToken: 'new-token' } }),
    );

    await expect(refreshAccessToken()).resolves.toBe('new-token');
    expect(fetchSpy).toHaveBeenCalledWith('/api/auth/refresh', {
      method: 'POST',
    });
  });

  // 2
  it('return null when response is not ok', async () => {
    fetchSpy.mockResolvedValue(mockFetchResponse({}, { ok: false }));

    await expect(refreshAccessToken()).resolves.toBeNull();
  });

  // 3
  it('return null when accessToken is missing from response', async () => {
    fetchSpy.mockResolvedValue(mockFetchResponse({ data: {} }));

    await expect(refreshAccessToken()).resolves.toBeNull();
  });

  // 4
  it('return null when fetch throws', async () => {
    fetchSpy.mockRejectedValue(new Error('network error'));

    await expect(refreshAccessToken()).resolves.toBeNull();
  });

  // 5
  it('dedupe concurrent calls into a single request', async () => {
    fetchSpy.mockResolvedValue(
      mockFetchResponse({ data: { accessToken: 'shared-token' } }),
    );

    const [first, second] = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
    ]);

    expect(first).toBe('shared-token');
    expect(second).toBe('shared-token');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

describe('authorizedFetch', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
    fetchSpy.mockReset();
    setAccessToken(null);
  });

  // 6
  it('return apiFetch result on success', async () => {
    mockedApiFetch.mockResolvedValue({ id: 1 });

    await expect(authorizedFetch('/me')).resolves.toEqual({ id: 1 });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // 7
  it('rethrow non-401 error without attempting refresh', async () => {
    const error = new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR',
      'invalid',
    );
    mockedApiFetch.mockRejectedValue(error);

    await expect(authorizedFetch('/me')).rejects.toBe(error);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // 8
  it('retry with refreshed token on 401', async () => {
    const unauthorized = unauthorizedError();
    mockedApiFetch
      .mockRejectedValueOnce(unauthorized)
      .mockResolvedValueOnce({ id: 1 });
    fetchSpy.mockResolvedValue(
      mockFetchResponse({ data: { accessToken: 'new-token' } }),
    );

    await expect(authorizedFetch('/me')).resolves.toEqual({ id: 1 });
    expect(getAccessToken()).toBe('new-token');
    expect(mockedApiFetch).toHaveBeenLastCalledWith('/me', {}, 'new-token');
  });

  // 9
  it('clear token and throw original error when refresh fails', async () => {
    setAccessToken('old-token');
    const unauthorized = unauthorizedError();
    mockedApiFetch.mockRejectedValue(unauthorized);
    fetchSpy.mockResolvedValue(mockFetchResponse({}, { ok: false }));

    await expect(authorizedFetch('/me')).rejects.toBe(unauthorized);
    expect(getAccessToken()).toBeNull();
  });

  // 10
  it('clear token when retried request also fails with 401', async () => {
    const unauthorized = unauthorizedError();
    const retryUnauthorized = unauthorizedError('still expired');
    mockedApiFetch
      .mockRejectedValueOnce(unauthorized)
      .mockRejectedValueOnce(retryUnauthorized);
    fetchSpy.mockResolvedValue(
      mockFetchResponse({ data: { accessToken: 'new-token' } }),
    );

    await expect(authorizedFetch('/me')).rejects.toBe(retryUnauthorized);
    expect(getAccessToken()).toBeNull();
  });

  // 11
  it('keep refreshed token when retry fails with a non-401 error', async () => {
    const retryError = new ApiError(
      HTTP_STATUS.BAD_GATEWAY,
      'BAD_GATEWAY',
      'upstream error',
    );
    mockedApiFetch
      .mockRejectedValueOnce(unauthorizedError())
      .mockRejectedValueOnce(retryError);
    fetchSpy.mockResolvedValue(
      mockFetchResponse({ data: { accessToken: 'new-token' } }),
    );

    await expect(authorizedFetch('/me')).rejects.toBe(retryError);
    expect(getAccessToken()).toBe('new-token');
  });
});
