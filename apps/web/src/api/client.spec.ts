/**
 * 검증 포인트:
 * 1. 성공 응답이면 data 필드를 반환한다.
 * 2. 204 응답이면 undefined를 반환한다.
 * 3. accessToken이 있으면 Authorization 헤더를 붙인다.
 * 4. body가 있고 Content-Type이 없으면 application/json을 붙인다.
 * 5. Content-Type이 이미 지정돼 있으면 덮어쓰지 않는다.
 * 6. 실패 응답이면 서버가 내려준 code/message로 ApiError를 던진다.
 * 7. 실패 응답 body가 JSON이 아니면 UNKNOWN_ERROR로 처리한다.
 * 8. isApiError는 ApiError 인스턴스에서만 true를 반환한다.
 */
import { apiFetch, isApiError, ApiError } from './client';
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

describe('apiFetch', () => {
  const fetchSpy = jest.spyOn(global, 'fetch');

  beforeEach(() => {
    fetchSpy.mockReset();
  });

  // 1
  it('return data field on success response', async () => {
    fetchSpy.mockResolvedValue(mockFetchResponse({ data: { id: 1 } }));

    await expect(apiFetch('/missions')).resolves.toEqual({ id: 1 });
  });

  // 2
  it('return undefined on 204 response', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: HTTP_STATUS.NO_CONTENT,
      json: async () => {
        throw new Error('no body');
      },
    } as unknown as Response);

    await expect(apiFetch('/missions/1')).resolves.toBeUndefined();
  });

  // 3
  it('attach Authorization header when access token is given', async () => {
    fetchSpy.mockResolvedValue(mockFetchResponse({ data: null }));

    await apiFetch('/me', {}, 'token-1');

    const init = fetchSpy.mock.calls[0][1] as RequestInit & {
      headers: Headers;
    };
    expect(init.headers.get('Authorization')).toBe('Bearer token-1');
  });

  // 4
  it('attach application/json Content-Type when body is given without one', async () => {
    fetchSpy.mockResolvedValue(mockFetchResponse({ data: null }));

    await apiFetch('/missions', { method: 'POST', body: JSON.stringify({}) });

    const init = fetchSpy.mock.calls[0][1] as RequestInit & {
      headers: Headers;
    };
    expect(init.headers.get('Content-Type')).toBe('application/json');
  });

  // 5
  it('not override an already-specified Content-Type', async () => {
    fetchSpy.mockResolvedValue(mockFetchResponse({ data: null }));

    await apiFetch('/missions', {
      method: 'POST',
      body: 'raw text',
      headers: { 'Content-Type': 'text/plain' },
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit & {
      headers: Headers;
    };
    expect(init.headers.get('Content-Type')).toBe('text/plain');
  });

  // 6
  it('throw ApiError with server-provided code and message on failure', async () => {
    fetchSpy.mockResolvedValue(
      mockFetchResponse(
        { error: { code: 'VALIDATION_ERROR', message: 'invalid' } },
        { ok: false, status: HTTP_STATUS.BAD_REQUEST },
      ),
    );

    await expect(apiFetch('/missions')).rejects.toEqual(
      expect.objectContaining({
        status: HTTP_STATUS.BAD_REQUEST,
        code: 'VALIDATION_ERROR',
        message: 'invalid',
      }),
    );
  });

  // 7
  it('fall back to UNKNOWN_ERROR when error body is not JSON', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      json: async () => {
        throw new Error('invalid json');
      },
    } as unknown as Response);

    await expect(apiFetch('/missions')).rejects.toEqual(
      expect.objectContaining({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        code: 'UNKNOWN_ERROR',
      }),
    );
  });

  // 8
  it('return true for ApiError instance only', () => {
    expect(isApiError(new ApiError(HTTP_STATUS.BAD_REQUEST, 'x', 'x'))).toBe(
      true,
    );
    expect(isApiError(new Error('x'))).toBe(false);
  });
});
