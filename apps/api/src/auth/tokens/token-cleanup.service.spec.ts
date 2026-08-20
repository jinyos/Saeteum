/**
 * 검증 포인트:
 * 1. 만료된 refresh token 삭제를 repository에 위임한다.
 * 2. 삭제된 항목이 없으면 로그를 남기지 않는다.
 */
import { Logger } from '@nestjs/common';
import { RefreshTokensRepository } from '@/auth/repositories/refresh-tokens.repository';
import { TokenCleanupService } from './token-cleanup.service';

function buildService() {
  const refreshTokensRepository = {
    deleteExpired: jest.fn(),
  } as unknown as jest.Mocked<RefreshTokensRepository>;

  const service = new TokenCleanupService(refreshTokensRepository);

  return { service, refreshTokensRepository };
}

describe('TokenCleanupService', () => {
  let service: TokenCleanupService;
  let refreshTokensRepository: jest.Mocked<RefreshTokensRepository>;

  beforeEach(() => {
    ({ service, refreshTokensRepository } = buildService());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1
  it('delegate expired refresh token deletion to the repository', async () => {
    refreshTokensRepository.deleteExpired.mockResolvedValue(2);
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    await service.cleanupExpiredTokens();

    expect(refreshTokensRepository.deleteExpired).toHaveBeenCalledWith(
      expect.any(Date),
    );
    expect(logSpy).toHaveBeenCalled();
  });

  // 2
  it('not log when nothing was deleted', async () => {
    refreshTokensRepository.deleteExpired.mockResolvedValue(0);
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    await service.cleanupExpiredTokens();

    expect(logSpy).not.toHaveBeenCalled();
  });
});
