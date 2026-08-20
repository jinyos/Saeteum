/**
 * 검증 포인트:
 * 1. login은 provider와 next를 AuthService에 전달하고 redirect URL을 반환한다.
 * 2. callback은 provider, state, code를 AuthService에 전달하고 redirect URL을 반환한다.
 * 3. exchangeToken은 code를 AuthService에 전달하고 token 데이터를 반환한다.
 * 4. refresh는 refreshToken을 AuthService에 전달하고 새 token 데이터를 반환한다.
 * 5. logout은 인증된 userId와 refreshToken을 AuthService에 전달한다.
 */
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

function buildController() {
  const authService = {
    buildLoginRedirectUrl: jest
      .fn()
      .mockReturnValue('https://google.example/auth'),
    handleCallback: jest.fn().mockResolvedValue('/me?code=exchange-code'),
    exchangeCode: jest.fn().mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }),
    refresh: jest.fn().mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }),
    logout: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<AuthService>;

  const controller = new AuthController(authService);

  return { controller, authService };
}

describe('AuthController', () => {
  // 1
  it('build login redirect URL', () => {
    const { controller, authService } = buildController();

    const result = controller.login('google', '/me');

    expect(authService.buildLoginRedirectUrl).toHaveBeenCalledWith(
      'google',
      '/me',
    );
    expect(result).toEqual({
      url: 'https://google.example/auth',
    });
  });

  // 2
  it('build callback redirect URL', async () => {
    const { controller, authService } = buildController();

    const result = await controller.callback(
      'google',
      'signed-state',
      'auth-code',
    );

    expect(authService.handleCallback).toHaveBeenCalledWith(
      'google',
      'signed-state',
      'auth-code',
    );
    expect(result).toEqual({
      url: '/me?code=exchange-code',
    });
  });

  // 3
  it('exchange code for tokens', () => {
    const { controller, authService } = buildController();

    const result = controller.exchangeToken({
      code: 'exchange-code',
    });

    expect(authService.exchangeCode).toHaveBeenCalledWith('exchange-code');
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  // 4
  it('refreshe tokens', async () => {
    const { controller, authService } = buildController();

    const result = await controller.refresh({
      refreshToken: 'refresh-token',
    });

    expect(authService.refresh).toHaveBeenCalledWith('refresh-token');
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  // 5
  it('logout current user', async () => {
    const { controller, authService } = buildController();

    await controller.logout(
      { id: 'user-1' },
      { refreshToken: 'refresh-token' },
    );

    expect(authService.logout).toHaveBeenCalledWith('user-1', 'refresh-token');
  });
});
