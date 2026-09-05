/**
 * 검증 포인트:
 * 1. 사진이 없으면 사진 업로드 없이 바로 createReview를 호출한다.
 * 2. 사진이 있으면 업로드 티켓 발급 -> 업로드 -> 그 photoPath로 createReview를 호출한다.
 * 3. 성공하면 missions.today, stats.summary 쿼리를 무효화하고 후기 보기 화면으로 이동한다.
 * 4. REVIEW_CLOSED 에러면 자정 경과 안내 토스트를 띄운다.
 * 5. REVIEW_ALREADY_EXISTS 에러면 이미 작성했다는 토스트를 띄운다.
 * 6. REVIEW_TOO_MANY_TAGS 에러면 태그 개수 제한 안내 토스트를 띄운다.
 * 7. REVIEW_EMPTY_INPUT 에러면 최소 입력 안내 토스트를 띄운다.
 * 8. ApiError가 아닌 에러면 기본 실패 토스트를 띄운다.
 */
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ApiError } from '@/api/client';
import {
  createReview,
  getReviewPhotoUploadTicket,
  uploadReviewPhoto,
} from '@/api/reviews.api';
import { queryKeys } from '@/lib/queryKeys';
import { useCreateReview } from './useCreateReview';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));
jest.mock('@/api/reviews.api', () => ({
  createReview: jest.fn(),
  getReviewPhotoUploadTicket: jest.fn(),
  uploadReviewPhoto: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedCreateReview = jest.mocked(createReview);
const mockedGetTicket = jest.mocked(getReviewPhotoUploadTicket);
const mockedUploadPhoto = jest.mocked(uploadReviewPhoto);
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

describe('useCreateReview', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);
  });

  // 1
  it('call createReview directly without uploading when there is no photo', async () => {
    mockedCreateReview.mockResolvedValue({ reviewId: 'review-1' });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateReview(), { wrapper });
    result.current.mutate({ missionDrawId: 'draw-1', rating: 5 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedGetTicket).not.toHaveBeenCalled();
    expect(mockedUploadPhoto).not.toHaveBeenCalled();
    expect(mockedCreateReview).toHaveBeenCalledWith({
      missionDrawId: 'draw-1',
      rating: 5,
      photoPath: undefined,
    });
  });

  // 2
  it('upload the photo first and use its photoPath when there is a photo', async () => {
    const photoFile = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    mockedGetTicket.mockResolvedValue({
      uploadUrl: 'https://x/upload',
      photoPath: 'u1/a.jpg',
    });
    mockedUploadPhoto.mockResolvedValue(undefined);
    mockedCreateReview.mockResolvedValue({ reviewId: 'review-1' });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateReview(), { wrapper });
    result.current.mutate({ missionDrawId: 'draw-1', photoFile });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUploadPhoto).toHaveBeenCalledWith(
      'https://x/upload',
      photoFile,
    );
    expect(mockedCreateReview).toHaveBeenCalledWith({
      missionDrawId: 'draw-1',
      photoPath: 'u1/a.jpg',
    });
  });

  // 3
  it('invalidate today mission and stats, drop the stale review cache, and navigate to the review on success', async () => {
    mockedCreateReview.mockResolvedValue({ reviewId: 'review-1' });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const removeSpy = jest.spyOn(queryClient, 'removeQueries');

    const { result } = renderHook(() => useCreateReview(), { wrapper });
    result.current.mutate({ missionDrawId: 'draw-1', rating: 5 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.missions.today(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.stats.summary(),
    });
    expect(removeSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.reviews.detail('draw-1'),
    });
    expect(push).toHaveBeenCalledWith('/reviews/draw-1');
  });

  // 4
  it('show a REVIEW_CLOSED-specific toast on that error code', async () => {
    mockedCreateReview.mockRejectedValue(
      new ApiError(409, 'REVIEW_CLOSED', 'closed'),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateReview(), { wrapper });
    result.current.mutate({ missionDrawId: 'draw-1', rating: 5 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '자정이 지나 오늘은 후기를 작성할 수 없어요.',
    );
  });

  // 5
  it('show a REVIEW_ALREADY_EXISTS-specific toast on that error code', async () => {
    mockedCreateReview.mockRejectedValue(
      new ApiError(409, 'REVIEW_ALREADY_EXISTS', 'exists'),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateReview(), { wrapper });
    result.current.mutate({ missionDrawId: 'draw-1', rating: 5 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '이미 오늘의 후기를 작성했어요.',
    );
  });

  // 6
  it('show a REVIEW_TOO_MANY_TAGS-specific toast on that error code', async () => {
    mockedCreateReview.mockRejectedValue(
      new ApiError(400, 'REVIEW_TOO_MANY_TAGS', 'too many tags'),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateReview(), { wrapper });
    result.current.mutate({ missionDrawId: 'draw-1', rating: 5 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '감정 태그는 3개까지만 선택할 수 있어요.',
    );
  });

  // 7
  it('show a REVIEW_EMPTY_INPUT-specific toast on that error code', async () => {
    mockedCreateReview.mockRejectedValue(
      new ApiError(400, 'REVIEW_EMPTY_INPUT', 'empty input'),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateReview(), { wrapper });
    result.current.mutate({ missionDrawId: 'draw-1', rating: 5 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '최소 1개 항목은 입력해야 해요.',
    );
  });

  // 8
  it('show the default failure toast for a non-ApiError', async () => {
    mockedCreateReview.mockRejectedValue(new Error('network error'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateReview(), { wrapper });
    result.current.mutate({ missionDrawId: 'draw-1', rating: 5 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '후기 저장에 실패했어요. 다시 시도해주세요.',
    );
  });
});
