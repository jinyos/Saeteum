/**
 * 검증 포인트:
 * 1. code가 없으면 exchangeCode를 호출하지 않는다.
 * 2. code 교환에 성공하면 토큰을 저장하고 홈으로 이동한다.
 * 3. code 교환에 실패하면 실패 토스트를 띄우고 홈으로 이동한다.
 * 4. StrictMode로 effect가 두 번 실행돼도 같은 code로는 한 번만 교환한다.
 */
import { StrictMode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCode } from '@/api/auth.api';
import { setAccessToken } from '@/lib/auth/tokenStore';
import { useOAuthCallback } from './useOAuthCallback';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));
jest.mock('@/api/auth.api', () => ({ exchangeCode: jest.fn() }));
jest.mock('@/lib/auth/tokenStore', () => ({ setAccessToken: jest.fn() }));

const mockedUseRouter = jest.mocked(useRouter);
const mockedUseSearchParams = jest.mocked(useSearchParams);
const mockedExchangeCode = jest.mocked(exchangeCode);
const mockedSetAccessToken = jest.mocked(setAccessToken);
const mockedToastError = jest.mocked(toast.error);

function mockSearchParams(code: string | null) {
  mockedUseSearchParams.mockReturnValue({
    get: (key: string) => (key === 'code' ? code : null),
  } as unknown as ReturnType<typeof useSearchParams>);
}

describe('useOAuthCallback', () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace,
    } as unknown as ReturnType<typeof useRouter>);
  });

  // 1
  it('not call exchangeCode when code is missing', () => {
    mockSearchParams(null);

    renderHook(() => useOAuthCallback());

    expect(mockedExchangeCode).not.toHaveBeenCalled();
  });

  // 2
  it('store token and redirect to home on successful exchange', async () => {
    mockSearchParams('auth-code');
    mockedExchangeCode.mockResolvedValue({ accessToken: 'token-1' });

    const { result } = renderHook(() => useOAuthCallback());

    expect(result.current.isExchanging).toBe(true);

    await waitFor(() => expect(result.current.isExchanging).toBe(false));

    expect(mockedSetAccessToken).toHaveBeenCalledWith('token-1');
    expect(replace).toHaveBeenCalledWith('/');
  });

  // 3
  it('show failure toast and redirect to home on failed exchange', async () => {
    mockSearchParams('auth-code');
    mockedExchangeCode.mockRejectedValue(new Error('exchange failed'));

    const { result } = renderHook(() => useOAuthCallback());

    await waitFor(() => expect(result.current.isExchanging).toBe(false));

    expect(mockedToastError).toHaveBeenCalled();
    expect(mockedSetAccessToken).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/');
  });

  // 4
  it('exchange same code only once even when effect runs twice under StrictMode', async () => {
    mockSearchParams('auth-code');
    mockedExchangeCode.mockResolvedValue({ accessToken: 'token-1' });

    const { result } = renderHook(() => useOAuthCallback(), {
      wrapper: StrictMode,
    });

    await waitFor(() => expect(result.current.isExchanging).toBe(false));

    expect(mockedExchangeCode).toHaveBeenCalledTimes(1);
  });
});
