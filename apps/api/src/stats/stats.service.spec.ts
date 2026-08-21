/**
 * 검증 포인트:
 * getSummary
 *   1. 뽑기/후기 기록이 없으면 모든 값이 0 또는 null인 요약을 반환한다.
 *   2. 후기 작성률은 총 후기 수를 총 뽑기 수로 나눈 값을 소수 둘째 자리로 반올림한다.
 *   3. 카테고리별 분포는 8개 카테고리 전체를 포함하고, 뽑은 적 없는 카테고리는 count 0이다.
 *   4. 감정 태그 분포는 모든 태그를 포함하고, 사용된 적 없는 태그는 count 0이다.
 *   5. 별점 평균은 rating이 있는 후기만으로 계산하고 소수 첫째 자리로 반올림한다.
 *   6. rating을 입력한 후기가 하나도 없으면 별점 평균은 null이다.
 */
import { missionCategoryEnum } from '@/db/schema';
import { EMOTION_TAGS } from '@saeteum/shared';
import { StatsService } from './stats.service';
import { StatsRepository } from './repositories/stats.repository';

function buildService() {
  const statsRepository = {
    countDraws: jest.fn(),
    getDrawCountsByCategory: jest.fn(),
    getReviewStatsRows: jest.fn(),
  } as unknown as jest.Mocked<StatsRepository>;

  const service = new StatsService(statsRepository);

  return { service, statsRepository };
}

describe('StatsService: getSummary', () => {
  let service: StatsService;
  let statsRepository: jest.Mocked<StatsRepository>;

  beforeEach(() => {
    ({ service, statsRepository } = buildService());
  });

  // 1
  it('return an all-zero/null summary when there are no draws or reviews', async () => {
    statsRepository.countDraws.mockResolvedValue(0);
    statsRepository.getDrawCountsByCategory.mockResolvedValue([]);
    statsRepository.getReviewStatsRows.mockResolvedValue([]);

    const result = await service.getSummary('user-1');

    expect(result.totalDraws).toBe(0);
    expect(result.totalReviews).toBe(0);
    expect(result.reviewRate).toBe(0);
    expect(result.averageRating).toBeNull();
    expect(result.categoryDistribution).toEqual(
      missionCategoryEnum.enumValues.map((category) => ({
        category,
        count: 0,
      })),
    );
    expect(result.emotionTagFrequency).toEqual(
      EMOTION_TAGS.map((tag) => ({ tag, count: 0 })),
    );
  });

  // 2
  it('calculate reviewRate as totalReviews / totalDraws rounded to 2 decimals', async () => {
    statsRepository.countDraws.mockResolvedValue(3);
    statsRepository.getDrawCountsByCategory.mockResolvedValue([]);
    statsRepository.getReviewStatsRows.mockResolvedValue([
      { rating: null, emotionTags: null },
      { rating: null, emotionTags: null },
    ]);

    const result = await service.getSummary('user-1');

    expect(result.totalReviews).toBe(2);
    expect(result.reviewRate).toBeCloseTo(0.67, 2);
  });

  // 3
  it('fill categories never drawn with count 0, keeping drawn counts', async () => {
    statsRepository.countDraws.mockResolvedValue(5);
    statsRepository.getDrawCountsByCategory.mockResolvedValue([
      { category: 'nature', count: 3 },
      { category: 'movement', count: 2 },
    ]);
    statsRepository.getReviewStatsRows.mockResolvedValue([]);

    const result = await service.getSummary('user-1');

    expect(
      result.categoryDistribution.find((item) => item.category === 'nature'),
    ).toEqual({ category: 'nature', count: 3 });
    expect(
      result.categoryDistribution.find(
        (item) => item.category === 'exploration',
      ),
    ).toEqual({ category: 'exploration', count: 0 });
    expect(result.categoryDistribution).toHaveLength(
      missionCategoryEnum.enumValues.length,
    );
  });

  // 4
  it('count tags across all reviews and fill unused tags with count 0', async () => {
    statsRepository.countDraws.mockResolvedValue(2);
    statsRepository.getDrawCountsByCategory.mockResolvedValue([]);
    statsRepository.getReviewStatsRows.mockResolvedValue([
      { rating: null, emotionTags: ['excitement', 'joy'] },
      { rating: null, emotionTags: ['excitement'] },
    ]);

    const result = await service.getSummary('user-1');

    expect(
      result.emotionTagFrequency.find((item) => item.tag === 'excitement'),
    ).toEqual({ tag: 'excitement', count: 2 });
    expect(
      result.emotionTagFrequency.find((item) => item.tag === 'joy'),
    ).toEqual({
      tag: 'joy',
      count: 1,
    });
    expect(
      result.emotionTagFrequency.find((item) => item.tag === 'pride'),
    ).toEqual({
      tag: 'pride',
      count: 0,
    });
    expect(result.emotionTagFrequency).toHaveLength(EMOTION_TAGS.length);
  });

  // 5
  it('average only reviews with a rating, rounded to 1 decimal', async () => {
    statsRepository.countDraws.mockResolvedValue(3);
    statsRepository.getDrawCountsByCategory.mockResolvedValue([]);
    statsRepository.getReviewStatsRows.mockResolvedValue([
      { rating: 5, emotionTags: null },
      { rating: 4, emotionTags: null },
      { rating: null, emotionTags: null },
    ]);

    const result = await service.getSummary('user-1');

    expect(result.averageRating).toBe(4.5);
  });

  // 6
  it('return null averageRating when no review has a rating', async () => {
    statsRepository.countDraws.mockResolvedValue(2);
    statsRepository.getDrawCountsByCategory.mockResolvedValue([]);
    statsRepository.getReviewStatsRows.mockResolvedValue([
      { rating: null, emotionTags: ['joy'] },
      { rating: null, emotionTags: null },
    ]);

    const result = await service.getSummary('user-1');

    expect(result.averageRating).toBeNull();
  });
});
