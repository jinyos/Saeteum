/**
 * 검증 포인트:
 * getTodayStatus
 *   1. 오늘 뽑은 기록이 없으면 { drawn: false }를 반환한다.
 *   2. 오늘 뽑았고 후기가 없으면 hasReview: false를 포함해 반환한다.
 *   3. 오늘 뽑았고 후기가 있으면 hasReview: true를 포함해 반환한다.
 * draw
 *   4. 오늘 이미 뽑았으면 AppException(ALREADY_DRAWN_TODAY)을 던진다.
 *   5. 아직 안 뽑았으면 후보를 선정하고 기록을 생성한 뒤 결과를 반환한다.
 *   6. 후보 미션이 없으면 AppException(INTERNAL_ERROR)을 던진다.
 *   7. insert 시 DB unique 제약 위반(동시 요청 레이스)이 발생하면 AppException(ALREADY_DRAWN_TODAY)으로 변환한다.
 */
import postgres from 'postgres';
import { AppException } from '@/common/exceptions/app.exception';
import { MissionsService } from './missions.service';
import { MissionDrawsRepository } from './repositories/mission-draws.repository';
import { ReviewsRepository } from '@/reviews/repositories/reviews.repository';

function buildService() {
  const missionDrawsRepository = {
    findByUserAndDay: jest.fn(),
    getCandidateMission: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<MissionDrawsRepository>;

  const reviewsRepository = {
    hasReview: jest.fn(),
  } as unknown as jest.Mocked<ReviewsRepository>;

  const service = new MissionsService(missionDrawsRepository, reviewsRepository);

  return { service, missionDrawsRepository, reviewsRepository };
}

describe('MissionsService: getTodayStatus', () => {
  let service: MissionsService;
  let missionDrawsRepository: jest.Mocked<MissionDrawsRepository>;
  let reviewsRepository: jest.Mocked<ReviewsRepository>;

  beforeEach(() => {
    ({ service, missionDrawsRepository, reviewsRepository } = buildService());
  });

  // 1
  it('return { drawn: false } when nothing drawn today', async () => {
    missionDrawsRepository.findByUserAndDay.mockResolvedValue(null);

    const result = await service.getTodayStatus('user-1');

    expect(missionDrawsRepository.findByUserAndDay).toHaveBeenCalledWith(
      'user-1',
      expect.any(String),
    );
    expect(reviewsRepository.hasReview).not.toHaveBeenCalled();
    expect(result).toEqual({ drawn: false });
  });

  // 2
  it('return hasReview: false when drawn today but no review written', async () => {
    const drawnAt = new Date('2026-01-01T00:00:00Z');
    missionDrawsRepository.findByUserAndDay.mockResolvedValue({
      missionDrawId: 'draw-1',
      drawnAt,
      mission: { id: 1, content: '하늘 사진 찍기' },
    });
    reviewsRepository.hasReview.mockResolvedValue(false);

    const result = await service.getTodayStatus('user-1');

    expect(reviewsRepository.hasReview).toHaveBeenCalledWith(
      'draw-1',
    );
    expect(result).toEqual({
      drawn: true,
      missionDrawId: 'draw-1',
      mission: { content: '하늘 사진 찍기' },
      hasReview: false,
      drawnAt,
    });
  });

  // 3
  it('return hasReview: true when a review already exists', async () => {
    const drawnAt = new Date('2026-01-01T00:00:00Z');
    missionDrawsRepository.findByUserAndDay.mockResolvedValue({
      missionDrawId: 'draw-1',
      drawnAt,
      mission: { id: 1, content: '하늘 사진 찍기' },
    });
    reviewsRepository.hasReview.mockResolvedValue(true);

    const result = await service.getTodayStatus('user-1');

    expect(result.drawn).toBe(true);
    expect((result as { hasReview: boolean }).hasReview).toBe(true);
  });
});

describe('MissionsService: draw', () => {
  let service: MissionsService;
  let missionDrawsRepository: jest.Mocked<MissionDrawsRepository>;

  beforeEach(() => {
    ({ service, missionDrawsRepository } = buildService());
  });

  // 4
  it('throw AppException(ALREADY_DRAWN_TODAY) when already drawn today', async () => {
    missionDrawsRepository.findByUserAndDay.mockResolvedValue({
      missionDrawId: 'user-mission-1',
      drawnAt: new Date('2026-01-01T00:00:00Z'),
      mission: { id: 1, content: '하늘 사진 찍기' },
    });

    await expect(service.draw('user-1')).rejects.toThrow(AppException);
    expect(missionDrawsRepository.getCandidateMission).not.toHaveBeenCalled();
  });

  // 5
  it('pick a candidate and create a draw record when not drawn yet', async () => {
    missionDrawsRepository.findByUserAndDay.mockResolvedValue(null);
    missionDrawsRepository.getCandidateMission.mockResolvedValue({
      id: 1,
      content: '하늘 사진 찍기',
    });

    const drawnAt = new Date('2026-01-01T00:00:00Z');
    missionDrawsRepository.create.mockResolvedValue({
      id: 'user-mission-1',
      drawnAt,
    });

    const result = await service.draw('user-1');

    expect(missionDrawsRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      missionId: 1,
      drawnDate: expect.any(String) as string,
    });
    expect(result).toEqual({
      missionDrawId: 'user-mission-1',
      mission: { content: '하늘 사진 찍기' },
      drawnAt,
    });
  });

  // 6
  it('throw AppException(INTERNAL_ERROR) when no candidate mission exists', async () => {
    missionDrawsRepository.findByUserAndDay.mockResolvedValue(null);
    missionDrawsRepository.getCandidateMission.mockResolvedValue(null);

    await expect(service.draw('user-1')).rejects.toThrow(AppException);
    expect(missionDrawsRepository.create).not.toHaveBeenCalled();
  });

  // 7
  it('convert unique violation on create into AppException(ALREADY_DRAWN_TODAY)', async () => {
    missionDrawsRepository.findByUserAndDay.mockResolvedValue(null);
    missionDrawsRepository.getCandidateMission.mockResolvedValue({
      id: 1,
      content: '하늘 사진 찍기',
    });
    missionDrawsRepository.create.mockRejectedValue(
      Object.assign(new postgres.PostgresError(''), {
        message: 'duplicate key value violates unique constraint',
        code: '23505',
      }),
    );

    await expect(service.draw('user-1')).rejects.toThrow(AppException);
  });
});
