/**
 * 검증 포인트:
 * getCategoryDetail
 *   1. 유효하지 않은 카테고리면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 *   2. 미션 ID 고정 순서로, 각 미션의 뽑기 여부(drawn)를 반환한다.
 * getMissionDetail
 *   3. 존재하지 않는 missionId면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 *   4. 미션 정보와 뽑기 기록 목록을 반환하며, 사진이 없는 후기는 photoUrl: null을 반환한다.
 *   5. 사용자가 한 번도 뽑지 않은 미션이면 AppException(RESOURCE_NOT_FOUND)을 던진다(뽑기 전 미션 내용 비노출).
 *   6. 사진이 있는 후기는 storage에서 signed URL을 발급받아 photoUrl로 반환한다.
 */
import { AppException } from '@/common/exceptions/app.exception';
import { RecordsService } from './records.service';
import { RecordsRepository } from './repositories/records.repository';
import { StorageService } from '@/storage/storage.service';

function buildService() {
  const recordsRepository = {
    findMissionStatusByCategory: jest.fn(),
    findMissionById: jest.fn(),
    findUserDrawsByMission: jest.fn(),
  } as unknown as jest.Mocked<RecordsRepository>;

  const storageService = {
    createReadUrl: jest.fn(),
  } as unknown as jest.Mocked<StorageService>;

  const service = new RecordsService(recordsRepository, storageService);

  return { service, recordsRepository, storageService };
}

describe('RecordsService: getCategoryDetail', () => {
  let service: RecordsService;
  let recordsRepository: jest.Mocked<RecordsRepository>;

  beforeEach(() => {
    ({ service, recordsRepository } = buildService());
  });

  // 1
  it('throw AppException(RESOURCE_NOT_FOUND) for an invalid category', async () => {
    await expect(
      service.getCategoryDetail('user-1', 'not-a-category'),
    ).rejects.toThrow(AppException);
    expect(
      recordsRepository.findMissionStatusByCategory,
    ).not.toHaveBeenCalled();
  });

  // 2
  it('return missions in fixed order with drawn status', async () => {
    recordsRepository.findMissionStatusByCategory.mockResolvedValue([
      { missionId: 1, drawn: true },
      { missionId: 2, drawn: false },
      { missionId: 3, drawn: true },
    ]);

    const result = await service.getCategoryDetail('user-1', 'nature');

    expect(result).toEqual([
      { missionId: 1, drawn: true },
      { missionId: 2, drawn: false },
      { missionId: 3, drawn: true },
    ]);
  });
});

describe('RecordsService: getMissionDetail', () => {
  let service: RecordsService;
  let recordsRepository: jest.Mocked<RecordsRepository>;
  let storageService: jest.Mocked<StorageService>;

  beforeEach(() => {
    ({ service, recordsRepository, storageService } = buildService());
  });

  // 3
  it('throw AppException(RESOURCE_NOT_FOUND) for a nonexistent mission', async () => {
    recordsRepository.findMissionById.mockResolvedValue(null);

    await expect(service.getMissionDetail('user-1', 999)).rejects.toThrow(
      AppException,
    );
    expect(recordsRepository.findUserDrawsByMission).not.toHaveBeenCalled();
  });

  // 4
  it('return mission info with all draws, photoUrl null when no photo', async () => {
    recordsRepository.findMissionById.mockResolvedValue({
      id: 7,
      category: 'nature',
      content: '창문 열고 바깥 공기 마시기',
    });
    recordsRepository.findUserDrawsByMission.mockResolvedValue([
      {
        missionDrawId: 'draw-2',
        drawnAt: new Date('2026-08-15T00:00:00Z'),
        review: {
          id: 'review-2',
          rating: 5,
          photoPath: null,
          content: '좋았다',
          emotionTags: null,
          createdAt: new Date('2026-08-15T00:00:00Z'),
        },
      },
      {
        missionDrawId: 'draw-1',
        drawnAt: new Date('2026-08-01T00:00:00Z'),
        review: null,
      },
    ]);

    const result = await service.getMissionDetail('user-1', 7);

    expect(result).toEqual({
      mission: {
        id: 7,
        category: 'nature',
        content: '창문 열고 바깥 공기 마시기',
      },
      draws: [
        {
          missionDrawId: 'draw-2',
          drawnAt: new Date('2026-08-15T00:00:00Z'),
          review: {
            id: 'review-2',
            rating: 5,
            photoUrl: null,
            content: '좋았다',
            emotionTags: null,
            createdAt: new Date('2026-08-15T00:00:00Z'),
          },
        },
        {
          missionDrawId: 'draw-1',
          drawnAt: new Date('2026-08-01T00:00:00Z'),
          review: null,
        },
      ],
    });
    expect(storageService.createReadUrl).not.toHaveBeenCalled();
  });

  // 5
  it('throw AppException(RESOURCE_NOT_FOUND) for a mission never drawn', async () => {
    recordsRepository.findMissionById.mockResolvedValue({
      id: 7,
      category: 'nature',
      content: '창문 열고 바깥 공기 마시기',
    });
    recordsRepository.findUserDrawsByMission.mockResolvedValue([]);

    await expect(service.getMissionDetail('user-1', 7)).rejects.toThrow(
      AppException,
    );
  });

  // 6
  it('resolve photoUrl via storage signed URL when a photo exists', async () => {
    recordsRepository.findMissionById.mockResolvedValue({
      id: 7,
      category: 'nature',
      content: '창문 열고 바깥 공기 마시기',
    });
    recordsRepository.findUserDrawsByMission.mockResolvedValue([
      {
        missionDrawId: 'draw-1',
        drawnAt: new Date('2026-08-15T00:00:00Z'),
        review: {
          id: 'review-1',
          rating: 4,
          photoPath: 'user-1/photo.jpg',
          content: null,
          emotionTags: null,
          createdAt: new Date('2026-08-15T00:00:00Z'),
        },
      },
    ]);
    storageService.createReadUrl.mockResolvedValue('https://signed.example/photo.jpg');

    const result = await service.getMissionDetail('user-1', 7);

    expect(storageService.createReadUrl).toHaveBeenCalledWith(
      'user-1/photo.jpg',
    );
    expect(result.draws[0].review?.photoUrl).toBe(
      'https://signed.example/photo.jpg',
    );
  });
});
