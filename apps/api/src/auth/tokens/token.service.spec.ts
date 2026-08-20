/**
 * 검증 포인트:
 * 1. access token을 발급하고 검증하면 원래 userId를 확인할 수 있다.
 * 2. 위조된 access token은 검증에 실패한다.
 * 3. refresh token은 매번 새로운 값을 생성한다.
 * 4. 같은 refresh token은 항상 동일한 해시로 변환된다.
 * 5. refresh token의 만료 시각은 현재 시각보다 미래다.
 */
import { Test } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      providers: [TokenService],
    }).compile();

    service = module.get(TokenService);
  });

  // 1
  it('return original userId when access token is issued and verified', () => {
    const token = service.issueAccessToken('user-1');

    expect(service.verifyAccessToken(token)).toEqual(
      expect.objectContaining({ sub: 'user-1' }),
    );
  });

  // 2
  it('reject forged access token', () => {
    const token = service.issueAccessToken('user-1');

    expect(service.verifyAccessToken(token + 'tampered')).toBeNull();
  });

  // 3
  it('generate unique refresh token', () => {
    const first = service.issueRefreshToken();
    const second = service.issueRefreshToken();

    expect(first).not.toBe(second);
  });

  // 4
  it('generate deterministic hash for refresh token', () => {
    const raw = service.issueRefreshToken();

    expect(service.hashRefreshToken(raw)).toBe(service.hashRefreshToken(raw));
  });

  // 5
  it('return future expiration time for refresh token', () => {
    expect(service.refreshTokenExpiresAt().getTime()).toBeGreaterThan(
      Date.now(),
    );
  });
});
