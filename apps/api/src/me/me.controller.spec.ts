/**
 * 검증 포인트:
 * 1. getMe는 인증된 사용자의 id로 서비스를 호출하고, 내 정보를 그대로 반환한다.
 * 2. updateNickname은 인증된 사용자의 id와 요청 본문의 nickname으로 서비스를 호출한다.
 * 3. deleteMe는 인증된 사용자의 id로 서비스를 호출한다.
 */
import { MeController } from './me.controller';
import { MeService } from './me.service';

function buildController() {
  const meService = {
    getMe: jest.fn().mockResolvedValue({
      id: 'user-1',
      nickname: '새틈이',
      provider: 'google',
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
    }),
    updateNickname: jest.fn().mockResolvedValue({
      id: 'user-1',
      nickname: '바뀐닉네임',
      provider: 'google',
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
    }),
    deleteMe: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<MeService>;

  const controller = new MeController(meService);

  return { controller, meService };
}

describe('MeController', () => {
  let controller: MeController;
  let meService: MeService;

  beforeEach(() => {
    ({ controller, meService } = buildController());
  });

  // 1
  it('delegate getMe to the service using the authenticated user id', async () => {
    const result = await controller.getMe({ id: 'user-1' });

    expect(meService.getMe).toHaveBeenCalledWith('user-1');
    expect(result.nickname).toBe('새틈이');
  });

  // 2
  it('delegate updateNickname to the service with the user id and nickname', async () => {
    const result = await controller.updateNickname(
      { id: 'user-1' },
      { nickname: '바뀐닉네임' },
    );

    expect(meService.updateNickname).toHaveBeenCalledWith(
      'user-1',
      '바뀐닉네임',
    );
    expect(result.nickname).toBe('바뀐닉네임');
  });

  // 3
  it('delegate deleteMe to the service using the authenticated user id', async () => {
    await controller.deleteMe({ id: 'user-1' });

    expect(meService.deleteMe).toHaveBeenCalledWith('user-1');
  });
});
