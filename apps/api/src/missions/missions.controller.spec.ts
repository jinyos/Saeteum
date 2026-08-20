/**
 * 검증 포인트:
 * 1. getToday는 인증된 사용자 id로 오늘의 뽑기 상태를 조회해 그대로 반환한다.
 * 2. draw는 인증된 사용자 id로 뽑기를 수행해 그 결과를 그대로 반환한다.
 */
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';

function buildController() {
  const missionsService = {
    getTodayStatus: jest.fn().mockResolvedValue({ drawn: false }),
    draw: jest.fn().mockResolvedValue({
      missionDrawId: 'user-mission-1',
      mission: { content: '하늘 사진 찍기' },
      drawnAt: new Date('2026-01-01T00:00:00Z'),
    }),
  } as unknown as jest.Mocked<MissionsService>;

  const controller = new MissionsController(missionsService);

  return { controller, missionsService };
}

describe('MissionsController', () => {
  let controller: MissionsController;
  let missionsService: MissionsService;

  beforeEach(() => {
    ({ controller, missionsService } = buildController());
  });

  // 1
  it("return today's status from service", async () => {
    const result = await controller.getToday({ id: 'user-1' });

    expect(missionsService.getTodayStatus).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ drawn: false });
  });

  // 2
  it('return draw result from service', async () => {
    const result = await controller.draw({ id: 'user-1' });

    expect(missionsService.draw).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({
      missionDrawId: 'user-mission-1',
      mission: { content: '하늘 사진 찍기' },
      drawnAt: new Date('2026-01-01T00:00:00Z'),
    });
  });
});
