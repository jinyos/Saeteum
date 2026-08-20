/**
 * 검증 포인트:
 * login
 *   1. provider를 조회하고 서명된 state를 포함한 authorization URL을 반환한다.
 * callback
 *   2. 유효하지 않은 state면 callback을 거부한다.
 *   3. 기존 사용자가 있으면 해당 사용자의 토큰을 발급한다.
 *   4. 기존 사용자가 없으면 사용자를 생성한다.
 * exchangeCode
 *   5. 유효한 exchange code면 access token과 refresh token을 반환한다.
 *   6. 유효하지 않은 exchange code면 AppException을 발생시킨다.
 * refresh
 *   7. 유효한 refresh token이면 새 토큰을 발급하고 기존 토큰을 rotation한다.
 *   8. 존재하지 않는 refresh token이면 AppException을 발생시킨다.
 *   9. 만료된 refresh token이면 AppException을 발생시킨다.
 *   10. refresh token rotation에 실패하면 AppException을 발생시킨다.
 * logout
 *   11. refresh token을 hash하여 해당 사용자의 refresh token을 삭제한다.
 */
import { AppException } from '@/common/exceptions/app.exception';
import { AuthService } from './auth.service';
import { OAuthProvider } from './providers/oauth-provider.interface';
import { OAuthProviderRegistry } from './providers/oauth-provider.registry';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { UsersRepository } from './repositories/users.repository';
import { ExchangeCodeService } from './tokens/exchange-code.service';
import { StateService } from './tokens/state.service';
import { TokenService } from './tokens/token.service';

function buildService() {
  const provider: OAuthProvider = {
    name: 'google',
    buildAuthorizeUrl: jest.fn().mockReturnValue('https://google.example/auth'),
    fetchProfile: jest
      .fn()
      .mockResolvedValue({ providerId: 'google-1', name: '홍길동' }),
  };

  const registry = {
    get: jest.fn().mockReturnValue(provider),
  } as unknown as jest.Mocked<OAuthProviderRegistry>;

  const stateService = {
    sign: jest.fn().mockReturnValue('signed-state'),
    verify: jest.fn().mockReturnValue({ next: '/me' }),
  } as unknown as jest.Mocked<StateService>;

  const exchangeCodeService = {
    issue: jest.fn().mockReturnValue('exchange-code'),
    consume: jest.fn(),
  } as unknown as jest.Mocked<ExchangeCodeService>;

  const tokenService = {
    issueAccessToken: jest.fn().mockReturnValue('access-toke'),
    issueRefreshToken: jest.fn().mockReturnValue('refresh-toke'),
    hashRefreshToken: jest.fn().mockReturnValue('hashed-refresh'),
    refreshTokenExpiresAt: jest.fn().mockReturnValue(new Date('2099-01-01')),
    verifyAccessToken: jest.fn(),
  } as unknown as jest.Mocked<TokenService>;

  const usersRepository = {
    findByProvider: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<UsersRepository>;

  const refreshTokensRepository = {
    create: jest.fn(),
    findByTokenHash: jest.fn(),
    rotate: jest.fn(),
    deleteByUserAndHash: jest.fn(),
  } as unknown as jest.Mocked<RefreshTokensRepository>;

  const service = new AuthService(
    registry,
    stateService,
    exchangeCodeService,
    tokenService,
    usersRepository,
    refreshTokensRepository,
  );

  return {
    service,
    provider,
    registry,
    stateService,
    exchangeCodeService,
    tokenService,
    usersRepository,
    refreshTokensRepository,
  };
}

describe('AuthService: login', () => {
  // 1
  it('build authorization URL with signed state', () => {
    const { service, registry, stateService } = buildService();
    const url = service.buildLoginRedirectUrl('google', '/me');

    expect(stateService.sign).toHaveBeenCalledWith('/me');
    expect(registry.get).toHaveBeenCalledWith('google');
    expect(url).toBe('https://google.example/auth');
  });
});

describe('AuthService: callback', () => {
  // 2
  it('throw AppException when state is invalid', async () => {
    const { service, stateService } = buildService();

    stateService.verify.mockReturnValue(null);

    await expect(
      service.handleCallback('google', 'invalid-state', 'auth-code'),
    ).rejects.toThrow(AppException);
  });

  // 3
  it('issue tokens for existing user', async () => {
    const {
      service,
      usersRepository,
      tokenService,
      refreshTokensRepository,
      exchangeCodeService,
    } = buildService();

    const existingUser = {
      id: 'user-1',
      provider: 'google' as const,
      providerId: 'google-1',
      nickname: '홍길동',
      createdAt: new Date('2099-01-01'),
    };

    usersRepository.findByProvider.mockResolvedValue(existingUser);

    const url = await service.handleCallback(
      'google',
      'signed-state',
      'auth-code',
    );

    expect(usersRepository.findByProvider).toHaveBeenCalledWith(
      'google',
      'google-1',
    );

    expect(usersRepository.create).not.toHaveBeenCalled();

    expect(tokenService.issueAccessToken).toHaveBeenCalledWith('user-1');
    expect(tokenService.issueRefreshToken).toHaveBeenCalled();

    expect(refreshTokensRepository.create).toHaveBeenCalled();

    expect(exchangeCodeService.issue).toHaveBeenCalledWith({
      accessToken: 'access-toke',
      refreshToken: 'refresh-toke',
    });

    expect(url).toBe('http://localhost:3000/me?code=exchange-code');
  });

  // 4
  it('creates user when no existing user is found', async () => {
    const { service, usersRepository } = buildService();

    usersRepository.findByProvider.mockResolvedValue(null);

    usersRepository.create.mockResolvedValue({
      id: 'user-1',
      provider: 'google',
      providerId: 'google-1',
      nickname: '홍길동',
      createdAt: new Date('2099-01-01'),
    });

    await service.handleCallback('google', 'signed-state', 'auth-code');

    expect(usersRepository.create).toHaveBeenCalledWith({
      provider: 'google',
      providerId: 'google-1',
      nickname: '홍길동',
    });
  });
});

describe('AuthService: exchangeCode', () => {
  // 5
  it('return tokens for valid exchange code', () => {
    const { service, exchangeCodeService } = buildService();

    exchangeCodeService.consume.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = service.exchangeCode('exchange-code');

    expect(exchangeCodeService.consume).toHaveBeenCalledWith('exchange-code');
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  // 6
  it('throw AppException for invalid exchange code', () => {
    const { service, exchangeCodeService } = buildService();

    exchangeCodeService.consume.mockReturnValue(null);

    expect(() => service.exchangeCode('invalid-code')).toThrow(AppException);
  });
});

describe('AuthService: refresh', () => {
  // 7
  it('issue new tokens and rotate refresh token', async () => {
    const { service, tokenService, refreshTokensRepository } = buildService();

    const currentTokenHash = 'current-token-hash';
    const newTokenHash = 'new-token-hash';
    const expiresAt = new Date('2099-01-01');

    tokenService.hashRefreshToken
      .mockReturnValueOnce(currentTokenHash)
      .mockReturnValueOnce(newTokenHash);

    tokenService.issueAccessToken.mockReturnValue('new-access-token');
    tokenService.issueRefreshToken.mockReturnValue('new-refresh-token');
    tokenService.refreshTokenExpiresAt.mockReturnValue(expiresAt);

    refreshTokensRepository.findByTokenHash.mockResolvedValue({
      id: 'refresh-token',
      userId: 'user-1',
      tokenHash: currentTokenHash,
      createdAt: new Date('2026-01-01'),
      expiresAt,
    });

    refreshTokensRepository.rotate.mockResolvedValue(true);

    const result = await service.refresh('current-refresh-token');

    expect(tokenService.hashRefreshToken).toHaveBeenNthCalledWith(
      1,
      'current-refresh-token',
    );
    expect(refreshTokensRepository.findByTokenHash).toHaveBeenCalledWith(
      currentTokenHash,
    );

    expect(tokenService.issueAccessToken).toHaveBeenCalledWith('user-1');
    expect(tokenService.issueRefreshToken).toHaveBeenCalled();

    expect(refreshTokensRepository.rotate).toHaveBeenCalledWith(
      'refresh-token',
      currentTokenHash,
      {
        tokenHash: newTokenHash,
        expiresAt,
      },
    );

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  // 8
  it('throw AppException for non-existent refresh token', async () => {
    const { service, refreshTokensRepository } = buildService();

    refreshTokensRepository.findByTokenHash.mockResolvedValue(null);

    await expect(service.refresh('invalid-refresh-token')).rejects.toThrow(
      AppException,
    );
  });

  // 9
  it('throw AppException for expired refresh token', async () => {
    const { service, refreshTokensRepository } = buildService();

    refreshTokensRepository.findByTokenHash.mockResolvedValue({
      id: 'refresh-token',
      userId: 'user-1',
      tokenHash: 'hashed-refresh',
      createdAt: new Date('2026-01-01'),
      expiresAt: new Date('2000-01-01'),
    });

    await expect(service.refresh('expired-refresh-token')).rejects.toThrow(
      AppException,
    );
  });

  // 10
  it('throw AppException when refresh token rotation fails', async () => {
    const { service, refreshTokensRepository } = buildService();

    refreshTokensRepository.findByTokenHash.mockResolvedValue({
      id: 'refresh-token',
      userId: 'user-1',
      tokenHash: 'hashed-refresh',
      createdAt: new Date('2026-01-01'),
      expiresAt: new Date('2099-01-01'),
    });

    refreshTokensRepository.rotate.mockResolvedValue(false);

    await expect(service.refresh('refresh-token')).rejects.toThrow(
      AppException,
    );
  });
});

describe('AuthService: logout', () => {
  // 11
  it('delete user refresh token', async () => {
    const { service, tokenService, refreshTokensRepository } = buildService();

    tokenService.hashRefreshToken.mockReturnValue('hashed-refresh');

    await service.logout('user-1', 'refresh-token');

    expect(tokenService.hashRefreshToken).toHaveBeenCalledWith('refresh-token');
    expect(refreshTokensRepository.deleteByUserAndHash).toHaveBeenCalledWith(
      'user-1',
      'hashed-refresh',
    );
  });
});
