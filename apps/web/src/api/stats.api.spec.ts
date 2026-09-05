/**
 * 검증 포인트:
 * getStats
 *   1. GET /stats로 authorizedFetch를 호출하고 결과를 그대로 반환한다.
 */
import { authorizedFetch } from '@/lib/auth/authorizedFetch';
import { getStats } from './stats.api';

jest.mock('@/lib/auth/authorizedFetch', () => ({
  authorizedFetch: jest.fn(),
}));

const mockedAuthorizedFetch = jest.mocked(authorizedFetch);

const stats = {
  totalDraws: 15,
  totalReviews: 12,
  reviewRate: 0.8,
  categoryDistribution: [{ category: 'nature' as const, count: 3 }],
  emotionTagFrequency: [{ tag: 'joy' as const, count: 5 }],
  averageRating: 4.2,
};

describe('getStats', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 1
  it('call authorizedFetch with GET /stats and return its result', async () => {
    mockedAuthorizedFetch.mockResolvedValue(stats);

    await expect(getStats()).resolves.toEqual(stats);
    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/stats');
  });
});
