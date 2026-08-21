/**
 * 검증 포인트:
 * 1. getSummary는 인증된 사용자의 id로 서비스를 호출하고, 통계 요약을 그대로 반환한다.
 */
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

function buildController() {
  const statsService = {
    getSummary: jest.fn().mockResolvedValue({
      totalDraws: 3,
      totalReviews: 2,
      reviewRate: 0.67,
      categoryDistribution: [],
      emotionTagFrequency: [],
      averageRating: 4.5,
    }),
  } as unknown as jest.Mocked<StatsService>;

  const controller = new StatsController(statsService);

  return { controller, statsService };
}

describe('StatsController', () => {
  let controller: StatsController;
  let statsService: StatsService;

  beforeEach(() => {
    ({ controller, statsService } = buildController());
  });

  // 1
  it('delegate getSummary to the service using the authenticated user id', async () => {
    const result = await controller.getSummary({ id: 'user-1' });

    expect(statsService.getSummary).toHaveBeenCalledWith('user-1');
    expect(result.totalDraws).toBe(3);
    expect(result.averageRating).toBe(4.5);
  });
});
