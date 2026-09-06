/**
 * 검증 포인트:
 * 1. 뽑기 성공하면 missions.today, stats.summary 쿼리를 무효화한다.
 * 2. 뽑기 실패하면 실패 토스트를 띄운다.
 */
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { drawMission } from '@/api/missions.api';
import { queryKeys } from '@/lib/queryKeys';
import { useDrawMission } from './useDrawMission';

jest.mock('@/api/missions.api', () => ({ drawMission: jest.fn() }));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

const mockedDrawMission = jest.mocked(drawMission);
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

describe('useDrawMission', () => {
  beforeEach(() => {
    mockedDrawMission.mockReset();
    mockedToastError.mockReset();
  });

  // 1
  it('invalidate the today mission and stats queries on success', async () => {
    mockedDrawMission.mockResolvedValue({
      missionDrawId: 'draw-1',
      mission: { content: '새로운 음악 장르 들어보기' },
      drawnAt: '2026-08-26T00:00:00+09:00',
    });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDrawMission(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.missions.today(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.stats.summary(),
    });
  });

  // 2
  it('show a failure toast on error', async () => {
    mockedDrawMission.mockRejectedValue(new Error('draw failed'));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDrawMission(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedToastError).toHaveBeenCalledWith(
      '미션 뽑기에 실패했어요. 다시 시도해주세요.',
    );
  });
});
