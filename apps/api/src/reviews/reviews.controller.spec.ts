/**
 * 검증 포인트:
 * 1. create는 인증된 사용자의 id와 요청 body를 서비스에 전달하고, 서비스에서 반환한 후기 생성 결과를 그대로 반환한다.
 * 2. getDetail 인증된 사용자의 id와 path parameter의 missionDrawId를 서비스에 전달하고, 서비스에서 반환한 후기 상세 조회 결과를 그대로 반환한다.
 * 3. delete는 인증된 사용자의 id와 path parameter의 reviewId를 서비스에 전달하고, 서비스의 후기 삭제 결과를 그대로 반환한다.
 */
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

function buildController() {
  const reviewsService = {
    create: jest.fn().mockResolvedValue({ reviewId: 'review-1' }),
    getDetail: jest.fn().mockResolvedValue({
      reviewId: 'review-1',
      mission: { content: '하늘 사진 찍기' },
      rating: 4,
      photoPath: null,
      content: '좋았다',
      emotionTags: null,
      editable: true,
    }),
    delete: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<ReviewsService>;

  const controller = new ReviewsController(reviewsService);

  return { controller, reviewsService };
}

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: ReviewsService;

  beforeEach(() => {
    ({ controller, reviewsService } = buildController());
  });

  // 1
  it('delegate create to the service', async () => {
    const dto = { missionDrawId: 'um-1', content: '좋았다' };

    const result = await controller.create({ id: 'user-1' }, dto);

    expect(reviewsService.create).toHaveBeenCalledWith('user-1', dto);
    expect(result.reviewId).toBe('review-1');
  });

  // 2
  it('delegate getDetail to the service', async () => {
    const result = await controller.getDetail({ id: 'user-1' }, 'um-1');

    expect(reviewsService.getDetail).toHaveBeenCalledWith('user-1', 'um-1');
    expect(result.reviewId).toBe('review-1');
  });

  // 3
  it('delegate delete to the service', async () => {
    await controller.delete({ id: 'user-1' }, 'review-1');

    expect(reviewsService.delete).toHaveBeenCalledWith('user-1', 'review-1');
  });
});
