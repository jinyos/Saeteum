/**
 * 검증 포인트:
 * getMe
 *   1. 사용자가 존재하면 id/nickname/provider/createdAt만 담은 프로필을 반환한다.
 *   2. 사용자가 존재하지 않으면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 * updateNickname
 *   3. 닉네임을 갱신하고 갱신된 프로필을 반환한다.
 *   4. 사용자가 존재하지 않으면 AppException(RESOURCE_NOT_FOUND)을 던진다.
 * deleteMe
 *   5. 사용자 id로 삭제를 위임한다.
 */
import { AppException } from '@/common/exceptions/app.exception';
import { UsersRepository } from '@/auth/repositories/users.repository';
import { MeService } from './me.service';

const user = {
  id: 'user-1',
  nickname: '새틈이',
  provider: 'google' as const,
  providerId: 'google-123',
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
};

function buildService() {
  const usersRepository = {
    findById: jest.fn(),
    updateNickname: jest.fn(),
    deleteById: jest.fn(),
  } as unknown as jest.Mocked<UsersRepository>;

  const service = new MeService(usersRepository);

  return { service, usersRepository };
}

describe('MeService: getMe', () => {
  let service: MeService;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    ({ service, usersRepository } = buildService());
  });

  // 1
  it('return a profile containing only id/nickname/provider/createdAt', async () => {
    usersRepository.findById.mockResolvedValue(user);

    const result = await service.getMe('user-1');

    expect(result).toEqual({
      id: 'user-1',
      nickname: '새틈이',
      provider: 'google',
      createdAt: user.createdAt,
    });
  });

  // 2
  it('throw AppException(RESOURCE_NOT_FOUND) when the user does not exist', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(service.getMe('missing')).rejects.toThrow(AppException);
  });
});

describe('MeService: updateNickname', () => {
  let service: MeService;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    ({ service, usersRepository } = buildService());
  });

  // 3
  it('update the nickname and return the updated profile', async () => {
    usersRepository.updateNickname.mockResolvedValue({
      ...user,
      nickname: '바뀐닉네임',
    });

    const result = await service.updateNickname('user-1', '바뀐닉네임');

    expect(usersRepository.updateNickname).toHaveBeenCalledWith(
      'user-1',
      '바뀐닉네임',
    );
    expect(result.nickname).toBe('바뀐닉네임');
  });

  // 4
  it('throw AppException(RESOURCE_NOT_FOUND) when the user does not exist', async () => {
    usersRepository.updateNickname.mockResolvedValue(null);

    await expect(
      service.updateNickname('missing', '바뀐닉네임'),
    ).rejects.toThrow(AppException);
  });
});

describe('MeService: deleteMe', () => {
  let service: MeService;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    ({ service, usersRepository } = buildService());
  });

  // 5
  it('delegate deletion to the repository using the user id', async () => {
    await service.deleteMe('user-1');

    expect(usersRepository.deleteById).toHaveBeenCalledWith('user-1');
  });
});
