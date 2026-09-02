/**
 * 검증 포인트:
 * 1. 삭제 성공하면 missions.today/reviews.detail 쿼리를 무효화하고 메인으로 이동한다.
 * 2. 삭제 실패하면 실패 토스트를 띄운다.
 * 3. REVIEW_CLOSED 에러면 자정 경과 안내 토스트를 띄운다.
 */
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ApiError } from '@/api/client';
import { deleteReview } from '@/api/reviews.api';
import { queryKeys } from '@/lib/queryKeys';
import { useDeleteReview } from './useDeleteReview';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));
jest.mock('@/api/reviews.api', () => ({ deleteReview: jest.fn() }));

const mockedUseRouter = jest.mocked(useRouter);
const mockedDeleteReview = jest.mocked(deleteReview);
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

describe('useDeleteReview', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);
  });

  // 1
  it('invalidate the today mission query, drop the stale review cache, and navigate home on success', async () => {
    mockedDeleteReview.mockResolvedValue(undefined);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const removeSpy = jest.spyOn(queryClient, 'removeQueries');

    const { result } = renderHook(() => useDeleteReview(), { wrapper });
    result.current.mutate({ reviewId: 'review-1', missionDrawId: 'draw-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.missions.today(),
    });
    expect(removeSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.reviews.detail('draw-1'),
    });
    expect(push).toHaveBeenCalledWith('/');
  });

  // 2
  it('show the default failure toast on a non-REVIEW_CLOSED error', async () => {
    mockedDeleteReview.mockRejectedValue(new Error('delete failed'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteReview(), { wrapper });
    result.current.mutate({ reviewId: 'review-1', missionDrawId: 'draw-1' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '후기 삭제에 실패했어요. 다시 시도해주세요.',
    );
  });

  // 3
  it('show a REVIEW_CLOSED-specific toast on that error code', async () => {
    mockedDeleteReview.mockRejectedValue(
      new ApiError(409, 'REVIEW_CLOSED', 'closed'),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteReview(), { wrapper });
    result.current.mutate({ reviewId: 'review-1', missionDrawId: 'draw-1' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '자정이 지나 이 후기는 삭제할 수 없어요.',
    );
  });
});
