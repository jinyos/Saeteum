/**
 * 검증 포인트:
 * 1. 성공하면 accessToken을 반환한다.
 * 2. 실패하면 서버가 내려준 code/message로 ApiError를 던진다.
 * 3. 실패 응답 body가 JSON이 아니면 UNKNOWN_ERROR로 처리한다.
 */
import { exchangeCode } from './auth.api';
import { HTTP_STATUS } from '@/common/constants';

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
