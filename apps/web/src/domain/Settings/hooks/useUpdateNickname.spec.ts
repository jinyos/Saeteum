/**
 * 검증 포인트:
 * 1. 성공하면 me 쿼리 캐시를 갱신하고 저장 완료 토스트를 띄운다.
 * 2. VALIDATION_ERROR면 닉네임 길이 안내 토스트를 띄운다.
 * 3. 그 외 에러면 기본 실패 토스트를 띄운다.
 */
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { ApiError } from '@/api/client';
import { updateNickname } from '@/api/me.api';
import { queryKeys } from '@/lib/queryKeys';
import { useUpdateNickname } from './useUpdateNickname';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock('@/api/me.api', () => ({ updateNickname: jest.fn() }));

const mockedUpdateNickname = jest.mocked(updateNickname);
const mockedToastSuccess = jest.mocked(toast.success);
const mockedToastError = jest.mocked(toast.error);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

describe('useUpdateNickname', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1
  it('update the me query cache and show a success toast on success', async () => {
    const me = {
      id: 'user-1',
      nickname: '새 닉네임',
      provider: 'google' as const,
      createdAt: '2026-08-19T00:00:00+09:00',
    };
    mockedUpdateNickname.mockResolvedValue(me);
    const { wrapper, queryClient } = createWrapper();
    const setDataSpy = jest.spyOn(queryClient, 'setQueryData');

    const { result } = renderHook(() => useUpdateNickname(), { wrapper });
    result.current.mutate('새 닉네임');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setDataSpy).toHaveBeenCalledWith(queryKeys.me.detail(), me);
    expect(mockedToastSuccess).toHaveBeenCalledWith('닉네임을 저장했어요.');
  });

  // 2
  it('show a length-guidance toast on VALIDATION_ERROR', async () => {
    mockedUpdateNickname.mockRejectedValue(
      new ApiError(400, 'VALIDATION_ERROR', 'invalid'),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateNickname(), { wrapper });
    result.current.mutate('');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '닉네임은 1자 이상 20자 이하로 입력해주세요.',
    );
  });

  // 3
  it('show the default failure toast on a non-VALIDATION_ERROR error', async () => {
    mockedUpdateNickname.mockRejectedValue(new Error('network error'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateNickname(), { wrapper });
    result.current.mutate('새 닉네임');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '닉네임 저장에 실패했어요. 다시 시도해주세요.',
    );
  });
});
