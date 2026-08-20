/**
 * 검증 포인트:
 * 1. 유효한 Bearer access token이면 인증에 성공하고 request.user를 설정한다.
 * 2. Authorization 헤더가 없으면 AppException을 발생시킨다.
 * 3. Authorization 헤더가 Bearer 형식이 아니면 AppException을 발생시킨다.
 * 4. 유효하지 않은 access token이면 AppException을 발생시킨다.
 */
import { ExecutionContext } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenService } from '@/auth/tokens/token.service';

type Request = {
  headers: {
    authorization?: string;
  };
  user?: {
    id: string;
  };
};

function contextWithHeader(authorization?: string): {
  context: ExecutionContext;
  request: Request;
} {
  const request: Request = {
    headers: { authorization },
  };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;

  return { context, request };
}

describe('JwtAuthGuard', () => {
  let tokenService: jest.Mocked<TokenService>;
  let guard: JwtAuthGuard;

  beforeEach(() => {
    tokenService = {
      verifyAccessToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    guard = new JwtAuthGuard(tokenService);
  });

  // 1
  it('authenticate with valid Bearer token and set request.user', () => {
    tokenService.verifyAccessToken.mockReturnValue({
      sub: 'user-1',
    });

    const { context, request } = contextWithHeader('Bearer valid-token');

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'user-1' });
  });

  // 2
  it('throw AppException when Authorization header is missing', () => {
    const { context } = contextWithHeader();

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });

  // 3
  it('throw AppException when Authorization header is not Bearer', () => {
    const { context } = contextWithHeader('Basic abc123');

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });

  // 4
  it('throw AppException when access token is invalid', () => {
    tokenService.verifyAccessToken.mockReturnValue(null);

    const { context } = contextWithHeader('Bearer invalid-token');

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });
});
