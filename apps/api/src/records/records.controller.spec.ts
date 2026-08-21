/**
 * 검증 포인트:
 * 1. getCategoryDetail은 인증된 사용자의 id와 path parameter의 category를 서비스에 전달하고, 카테고리 내 미션별 뽑기 여부를 반환한다.
 * 2. getMissionDetail은 인증된 사용자의 id와 path parameter의 missionId를 서비스에 전달하고, 해당 미션의 전체 뽑기 기록을 반환한다.
 */
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

function buildController() {
  const recordsService = {
    getCategoryDetail: jest
      .fn()
      .mockResolvedValue([{ missionId: 1, drawn: false }]),
    getMissionDetail: jest.fn().mockResolvedValue({
      mission: {
        id: 7,
        category: 'nature',
        content: '창문 열고 바깥 공기 마시기',
      },
      draws: [],
    }),
  } as unknown as jest.Mocked<RecordsService>;

  const controller = new RecordsController(recordsService);

  return { controller, recordsService };
}

describe('RecordsController', () => {
  let controller: RecordsController;
  let recordsService: RecordsService;

  beforeEach(() => {
    ({ controller, recordsService } = buildController());
  });

  // 1
  it('delegate getCategoryDetail to the service', async () => {
    const result = await controller.getCategoryDetail(
      { id: 'user-1' },
      'nature',
    );

    expect(recordsService.getCategoryDetail).toHaveBeenCalledWith(
      'user-1',
      'nature',
    );
    expect(result).toEqual([{ missionId: 1, drawn: false }]);
  });

  // 2
  it('delegate getMissionDetail to the service', async () => {
    const result = await controller.getMissionDetail({ id: 'user-1' }, 7);

    expect(recordsService.getMissionDetail).toHaveBeenCalledWith('user-1', 7);
    expect(result.mission.id).toBe(7);
  });
});
