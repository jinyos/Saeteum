/**
 * 검증 포인트:
 * 1. 성공하면 deleteMe -> logout 순으로 호출하고, accessToken을 지운 뒤 메인으로 이동한다.
 * 2. deleteMe가 실패하면 실패 토스트를 띄운다.
 * 3. deleteMe는 성공했는데 logout만 실패해도, 계정은 이미 삭제된 것이므로 성공으로 처리한다.
 */
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logout } from '@/api/auth.api';
import { deleteMe } from '@/api/me.api';
import { setAccessToken } from '@/lib/auth/tokenStore';
import { useDeleteAccount } from './useDeleteAccount';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));
jest.mock('@/api/auth.api', () => ({ logout: jest.fn() }));
jest.mock('@/api/me.api', () => ({ deleteMe: jest.fn() }));
jest.mock('@/lib/auth/tokenStore', () => ({ setAccessToken: jest.fn() }));

const mockedUseRouter = jest.mocked(useRouter);
const mockedDeleteMe = jest.mocked(deleteMe);
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

describe('useDeleteAccount', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);
  });

  // 1
  it('delete the account, log out, clear the access token, and navigate home on success', async () => {
    mockedDeleteMe.mockResolvedValue(undefined);
    mockedLogout.mockResolvedValue(undefined);
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteAccount(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedDeleteMe).toHaveBeenCalled();
    expect(mockedLogout).toHaveBeenCalled();
    expect(mockedSetAccessToken).toHaveBeenCalledWith(null);
    expect(push).toHaveBeenCalledWith('/');
  });

  // 2
  it('show a failure toast when deleteMe fails', async () => {
    mockedDeleteMe.mockRejectedValue(new Error('network error'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteAccount(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '탈퇴에 실패했어요. 다시 시도해주세요.',
    );
  });

  // 3
  it('still succeed when deleteMe succeeds but logout fails', async () => {
    mockedDeleteMe.mockResolvedValue(undefined);
    mockedLogout.mockRejectedValue(new Error('network error'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteAccount(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedSetAccessToken).toHaveBeenCalledWith(null);
    expect(push).toHaveBeenCalledWith('/');
    expect(mockedToastError).not.toHaveBeenCalled();
  });
});
