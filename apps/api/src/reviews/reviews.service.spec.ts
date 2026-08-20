/**
 * 검증 포인트:
 * create
 *   1. 4개 항목이 모두 비어있으면 AppException(REVIEW_EMPTY_INPUT)을 던진다.
 *   2. 태그가 4개 이상이면 AppException(REVIEW_TOO_MANY_TAGS)을 던진다.
 *   3. missionDrawId가 없거나 소유자가 아니면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 *   4. 뽑은 날의 KST 자정이 지났으면 AppException(REVIEW_CLOSED)을 던진다.
 *   5. 이미 후기가 존재하면 AppException(REVIEW_ALREADY_EXISTS)을 던진다.
 *   6. insert 시 DB unique 제약 위반(동시 요청 레이스)이 발생하면 AppException(REVIEW_ALREADY_EXISTS)으로 변환한다.
 *   7. 정상 입력이면 저장하고 reviewId를 반환한다.
 * getDetail
 *   8. missionDrawId가 없거나 소유자가 아니면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 *   9. 후기가 없으면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 *   10. 후기가 있고 자정 전이면 editable: true를 포함해 반환한다.
 *   11. 후기가 있고 자정이 지났으면 editable: false를 포함해 반환한다.
 * delete
 *   12. 대상이 없거나 소유자가 아니면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 *   13. 자정이 지났으면 AppException(REVIEW_CLOSED)을 던진다.
 *   14. 정상이면 삭제를 수행한다.
 */
import postgres from 'postgres';
import { AppException } from '@/common/exceptions/app.exception';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from './repositories/reviews.repository';
import { MS_PER_DAY } from '@saeteum/shared';

const TODAY = new Date();
const YESTERDAY = new Date(Date.now() - 24 * MS_PER_DAY);

function buildService() {
  const reviewsRepository = {
    findMissionDrawForReview: jest.fn(),
    findByMissionDrawId: jest.fn(),
    create: jest.fn(),
    findReviewWithMissionDraw: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<ReviewsRepository>;

  const service = new ReviewsService(reviewsRepository);

  return { service, reviewsRepository };
}

describe('ReviewsService: create', () => {
  let service: ReviewsService;
  let reviewsRepository: jest.Mocked<ReviewsRepository>;

  beforeEach(() => {
    ({ service, reviewsRepository } = buildService());
  });

  // 1
  it('throw AppException(REVIEW_EMPTY_INPUT) when all fields are empty', async () => {
    await expect(
      service.create('user-1', { missionDrawId: 'um-1' }),
    ).rejects.toThrow(AppException);
    expect(reviewsRepository.findMissionDrawForReview).not.toHaveBeenCalled();
  });

  // 2
  it('throw AppException(REVIEW_TOO_MANY_TAGS) when more than 3 tags given', async () => {
    await expect(
      service.create('user-1', {
        missionDrawId: 'um-1',
        emotionTags: ['excitement', 'joy', 'pride', 'gratitude'],
      }),
    ).rejects.toThrow(AppException);
    expect(reviewsRepository.findMissionDrawForReview).not.toHaveBeenCalled();
  });

  // 3
  it('throw AppException(RESOURCE_NOT_FOUND) when user mission not owned', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue(null);

    await expect(
      service.create('user-1', { missionDrawId: 'um-1', content: '좋았다' }),
    ).rejects.toThrow(AppException);
  });

  // 4
  it('throw AppException(REVIEW_CLOSED) when KST day has passed', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue({
      missionDrawId: 'um-1',
      drawnAt: YESTERDAY,
      mission: { id: 1, category: 'nature', content: '하늘 사진 찍기' },
    });

    await expect(
      service.create('user-1', { missionDrawId: 'um-1', content: '좋았다' }),
    ).rejects.toThrow(AppException);
    expect(reviewsRepository.create).not.toHaveBeenCalled();
  });

  // 5
  it('throw AppException(REVIEW_ALREADY_EXISTS) when a review already exists', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue({
      missionDrawId: 'um-1',
      drawnAt: TODAY,
      mission: { id: 1, category: 'nature', content: '하늘 사진 찍기' },
    });
    reviewsRepository.findByMissionDrawId.mockResolvedValue({
      id: 'review-1',
      missionDrawId: 'um-1',
      rating: null,
      photoPath: null,
      content: '이미 있음',
      emotionTags: null,
      createdAt: TODAY,
    });

    await expect(
      service.create('user-1', { missionDrawId: 'um-1', content: '좋았다' }),
    ).rejects.toThrow(AppException);
    expect(reviewsRepository.create).not.toHaveBeenCalled();
  });

  // 6
  it('convert unique violation on create into AppException(REVIEW_ALREADY_EXISTS)', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue({
      missionDrawId: 'um-1',
      drawnAt: TODAY,
      mission: { id: 1, category: 'nature', content: '하늘 사진 찍기' },
    });
    reviewsRepository.findByMissionDrawId.mockResolvedValue(null);
    reviewsRepository.create.mockRejectedValue(
      Object.assign(new postgres.PostgresError(''), {
        message: 'duplicate key value violates unique constraint',
        code: '23505',
      }),
    );

    await expect(
      service.create('user-1', { missionDrawId: 'um-1', content: '좋았다' }),
    ).rejects.toThrow(AppException);
  });

  // 7
  it('save and return the review on valid input', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue({
      missionDrawId: 'um-1',
      drawnAt: TODAY,
      mission: { id: 1, category: 'nature', content: '하늘 사진 찍기' },
    });
    reviewsRepository.findByMissionDrawId.mockResolvedValue(null);
    reviewsRepository.create.mockResolvedValue({
      id: 'review-1',
      missionDrawId: 'um-1',
      rating: null,
      photoPath: null,
      content: '좋았다',
      emotionTags: null,
      createdAt: TODAY,
    });

    const result = await service.create('user-1', {
      missionDrawId: 'um-1',
      content: '좋았다',
    });

    expect(reviewsRepository.create).toHaveBeenCalledWith({
      missionDrawId: 'um-1',
      rating: undefined,
      photoPath: undefined,
      content: '좋았다',
      emotionTags: undefined,
    });
    expect(result.reviewId).toBe('review-1');
  });
});

describe('ReviewsService: getDetail', () => {
  let service: ReviewsService;
  let reviewsRepository: jest.Mocked<ReviewsRepository>;

  beforeEach(() => {
    ({ service, reviewsRepository } = buildService());
  });

  // 8
  it('throw AppException(RESOURCE_NOT_FOUND) when user mission not owned', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue(null);

    await expect(service.getDetail('user-1', 'um-1')).rejects.toThrow(
      AppException,
    );
  });

  // 9
  it('throw AppException(RESOURCE_NOT_FOUND) when no review exists', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue({
      missionDrawId: 'um-1',
      drawnAt: TODAY,
      mission: { id: 1, category: 'nature', content: '하늘 사진 찍기' },
    });
    reviewsRepository.findByMissionDrawId.mockResolvedValue(null);

    await expect(service.getDetail('user-1', 'um-1')).rejects.toThrow(
      AppException,
    );
  });

  // 10
  it('return editable:true when still within KST day', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue({
      missionDrawId: 'um-1',
      drawnAt: TODAY,
      mission: { id: 1, category: 'nature', content: '하늘 사진 찍기' },
    });
    reviewsRepository.findByMissionDrawId.mockResolvedValue({
      id: 'review-1',
      missionDrawId: 'um-1',
      rating: 4,
      photoPath: null,
      content: '좋았다',
      emotionTags: null,
      createdAt: TODAY,
    });

    const result = await service.getDetail('user-1', 'um-1');

    expect(result.reviewId).toBe('review-1');
    expect(result.mission).toEqual({ content: '하늘 사진 찍기' });
    expect(result.editable).toBe(true);
  });

  // 11
  it('return editable:false after KST midnight has passed', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue({
      missionDrawId: 'um-1',
      drawnAt: YESTERDAY,
      mission: { id: 1, category: 'nature', content: '하늘 사진 찍기' },
    });
    reviewsRepository.findByMissionDrawId.mockResolvedValue({
      id: 'review-1',
      missionDrawId: 'um-1',
      rating: 4,
      photoPath: null,
      content: '좋았다',
      emotionTags: null,
      createdAt: YESTERDAY,
    });

    const result = await service.getDetail('user-1', 'um-1');

    expect(result.editable).toBe(false);
  });
});

describe('ReviewsService: delete', () => {
  let service: ReviewsService;
  let reviewsRepository: jest.Mocked<ReviewsRepository>;

  beforeEach(() => {
    ({ service, reviewsRepository } = buildService());
  });

  // 12
  it('throw AppException(RESOURCE_NOT_FOUND) when review not owned', async () => {
    reviewsRepository.findReviewWithMissionDraw.mockResolvedValue(null);

    await expect(service.delete('user-1', 'review-1')).rejects.toThrow(
      AppException,
    );
  });

  // 13
  it('throw AppException(REVIEW_CLOSED) when KST day has passed', async () => {
    reviewsRepository.findReviewWithMissionDraw.mockResolvedValue({
      drawnAt: YESTERDAY,
    });

    await expect(service.delete('user-1', 'review-1')).rejects.toThrow(
      AppException,
    );
    expect(reviewsRepository.remove).not.toHaveBeenCalled();
  });

  // 14
  it('remove the review when owned and still within KST day', async () => {
    reviewsRepository.findReviewWithMissionDraw.mockResolvedValue({
      drawnAt: TODAY,
    });

    await service.delete('user-1', 'review-1');

    expect(reviewsRepository.remove).toHaveBeenCalledWith('review-1');
  });
});
