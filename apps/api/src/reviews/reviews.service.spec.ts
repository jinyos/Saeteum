/**
 * 검증 포인트:
 * createPhotoUploadUrl
 *   1. storage 서비스에 업로드 URL 발급을 위임한다.
 * create
 *   2. 4개 항목이 모두 비어있으면 AppException(REVIEW_EMPTY_INPUT)을 던진다.
 *   3. 태그가 4개 이상이면 AppException(REVIEW_TOO_MANY_TAGS)을 던진다.
 *   4. missionDrawId가 없거나 소유자가 아니면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 *   5. 뽑은 날의 KST 자정이 지났으면 AppException(REVIEW_CLOSED)을 던진다.
 *   6. 이미 후기가 존재하면 AppException(REVIEW_ALREADY_EXISTS)을 던진다.
 *   7. insert 시 DB unique 제약 위반(동시 요청 레이스)이 발생하면 AppException(REVIEW_ALREADY_EXISTS)으로 변환한다.
 *   8. 정상 입력이면 저장하고 reviewId를 반환한다.
 * getDetail
 *   9. missionDrawId가 없거나 소유자가 아니면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 *   10. 후기가 없으면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 *   11. 후기가 있고 자정 전이면 editable: true를 포함해 반환한다.
 *   12. 후기가 있고 자정이 지났으면 editable: false를 포함해 반환한다.
 *   13. 사진이 있으면 storage에서 signed URL을 발급받아 photoUrl로 반환한다.
 * delete
 *   14. 대상이 없거나 소유자가 아니면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 *   15. 자정이 지났으면 AppException(REVIEW_CLOSED)을 던진다.
 *   16. 사진이 없으면 storage 삭제를 호출하지 않는다.
 *   17. 사진이 있으면 storage에서 해당 객체를 삭제한다.
 */
import postgres from 'postgres';
import { AppException } from '@/common/exceptions/app.exception';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from './repositories/reviews.repository';
import { StorageService } from '@/storage/storage.service';
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

  const storageService = {
    createUploadUrl: jest.fn(),
    createReadUrl: jest.fn(),
    deleteObject: jest.fn(),
  } as unknown as jest.Mocked<StorageService>;

  const service = new ReviewsService(reviewsRepository, storageService);

  return { service, reviewsRepository, storageService };
}

describe('ReviewsService: createPhotoUploadUrl', () => {
  // 1
  it('delegate upload URL creation to the storage service', async () => {
    const { service, storageService } = buildService();
    
    storageService.createUploadUrl.mockResolvedValue({
      uploadUrl: 'https://storage.example/upload',
      photoPath: 'user-1/photo.jpg',
    });

    const result = await service.createPhotoUploadUrl('user-1');

    expect(storageService.createUploadUrl).toHaveBeenCalledWith('user-1');
    expect(result.photoPath).toBe('user-1/photo.jpg');
  });
});

describe('ReviewsService: create', () => {
  let service: ReviewsService;
  let reviewsRepository: jest.Mocked<ReviewsRepository>;

  beforeEach(() => {
    ({ service, reviewsRepository } = buildService());
  });

  // 2
  it('throw AppException(REVIEW_EMPTY_INPUT) when all fields are empty', async () => {
    await expect(
      service.create('user-1', { missionDrawId: 'um-1' }),
    ).rejects.toThrow(AppException);
    expect(reviewsRepository.findMissionDrawForReview).not.toHaveBeenCalled();
  });

  // 3
  it('throw AppException(REVIEW_TOO_MANY_TAGS) when more than 3 tags given', async () => {
    await expect(
      service.create('user-1', {
        missionDrawId: 'um-1',
        emotionTags: ['excitement', 'joy', 'pride', 'gratitude'],
      }),
    ).rejects.toThrow(AppException);
    expect(reviewsRepository.findMissionDrawForReview).not.toHaveBeenCalled();
  });

  // 4
  it('throw AppException(RESOURCE_NOT_FOUND) when user mission not owned', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue(null);

    await expect(
      service.create('user-1', { missionDrawId: 'um-1', content: '좋았다' }),
    ).rejects.toThrow(AppException);
  });

  // 5
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

  // 6
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

  // 7
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

  // 8
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
  let storageService: jest.Mocked<StorageService>;

  beforeEach(() => {
    ({ service, reviewsRepository, storageService } = buildService());
  });

  // 9
  it('throw AppException(RESOURCE_NOT_FOUND) when user mission not owned', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue(null);

    await expect(service.getDetail('user-1', 'um-1')).rejects.toThrow(
      AppException,
    );
  });

  // 10
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

  // 11
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

  // 12
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

  // 13
  it('return a signed photoUrl when a photo is attached', async () => {
    reviewsRepository.findMissionDrawForReview.mockResolvedValue({
      missionDrawId: 'um-1',
      drawnAt: TODAY,
      mission: { id: 1, category: 'nature', content: '하늘 사진 찍기' },
    });
    reviewsRepository.findByMissionDrawId.mockResolvedValue({
      id: 'review-1',
      missionDrawId: 'um-1',
      rating: null,
      photoPath: 'user-1/photo.jpg',
      content: null,
      emotionTags: null,
      createdAt: TODAY,
    });
    storageService.createReadUrl.mockResolvedValue(
      'https://storage.example/signed',
    );

    const result = await service.getDetail('user-1', 'um-1');

    expect(storageService.createReadUrl).toHaveBeenCalledWith(
      'user-1/photo.jpg',
    );
    expect(result.photoUrl).toBe('https://storage.example/signed');
  });
});

describe('ReviewsService: delete', () => {
  let service: ReviewsService;
  let reviewsRepository: jest.Mocked<ReviewsRepository>;
  let storageService: jest.Mocked<StorageService>;

  beforeEach(() => {
    ({ service, reviewsRepository, storageService } = buildService());
  });

  // 14
  it('throw AppException(RESOURCE_NOT_FOUND) when review not owned', async () => {
    reviewsRepository.findReviewWithMissionDraw.mockResolvedValue(null);

    await expect(service.delete('user-1', 'review-1')).rejects.toThrow(
      AppException,
    );
  });

  // 15
  it('throw AppException(REVIEW_CLOSED) when KST day has passed', async () => {
    reviewsRepository.findReviewWithMissionDraw.mockResolvedValue({
      drawnAt: YESTERDAY,
      photoPath: null,
    });

    await expect(service.delete('user-1', 'review-1')).rejects.toThrow(
      AppException,
    );
    expect(reviewsRepository.remove).not.toHaveBeenCalled();
  });

  // 16
  it('not delete from storage when there is no photo', async () => {
    reviewsRepository.findReviewWithMissionDraw.mockResolvedValue({
      drawnAt: TODAY,
      photoPath: null,
    });

    await service.delete('user-1', 'review-1');

    expect(reviewsRepository.remove).toHaveBeenCalledWith('review-1');
    expect(storageService.deleteObject).not.toHaveBeenCalled();
  });

  // 17
  it('delete the photo from storage when the review had one', async () => {
    reviewsRepository.findReviewWithMissionDraw.mockResolvedValue({
      drawnAt: TODAY,
      photoPath: 'user-1/photo.jpg',
    });

    await service.delete('user-1', 'review-1');

    expect(reviewsRepository.remove).toHaveBeenCalledWith('review-1');
    expect(storageService.deleteObject).toHaveBeenCalledWith(
      'user-1/photo.jpg',
    );
  });
});
