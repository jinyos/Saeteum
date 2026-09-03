/**
 * 검증 포인트:
 * 1. 성공하면 accessToken을 지우고 메인으로 이동한다.
 * 2. 실패하면 실패 토스트를 띄운다.
 */
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logout } from '@/api/auth.api';
import { setAccessToken } from '@/lib/auth/tokenStore';
import { useLogout } from './useLogout';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));
jest.mock('@/api/auth.api', () => ({ logout: jest.fn() }));
jest.mock('@/lib/auth/tokenStore', () => ({ setAccessToken: jest.fn() }));

const mockedUseRouter = jest.mocked(useRouter);
const mockedLogout = jest.mocked(logout);
const mockedSetAccessToken = jest.mocked(setAccessToken);
const mockedToastError = jest.mocked(toast.error);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

describe('useLogout', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);
  });

  // 1
  it('clear the access token and navigate home on success', async () => {
    mockedLogout.mockResolvedValue(undefined);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedSetAccessToken).toHaveBeenCalledWith(null);
    expect(push).toHaveBeenCalledWith('/');
  });

  // 2
  it('show a failure toast on error', async () => {
    mockedLogout.mockRejectedValue(new Error('network error'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '로그아웃에 실패했어요. 다시 시도해주세요.',
    );
  });
});
