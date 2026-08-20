/**
 * 검증 포인트:
 * 1. 발급한 code로 저장된 payload를 조회할 수 있다.
 * 2. 소비된 code는 재사용할 수 없다.
 * 3. 존재하지 않는 code는 소비할 수 없다.
 * 4. 만료된 code는 소비할 수 없다.
 */
import { AUTH_EXPIRATION } from '@/common/constants';
import { ExchangeCodeService } from './exchange-code.service';

describe('ExchangeCodeService', () => {
  let service: ExchangeCodeService;
  const payload = { accessToken: 'access', refreshToken: 'refresh' };

  beforeEach(() => {
    service = new ExchangeCodeService();
  });

  // 1
  it('return stored payload when consuming issued code', () => {
    const code = service.issue(payload);

    expect(service.consume(code)).toEqual(payload);
  });

  // 2
  it('not allow consumed code to be reused', () => {
    const code = service.issue(payload);

    service.consume(code);

    expect(service.consume(code)).toBeNull();
  });

  // 3
  it('not allow non-existent code to be consumed', () => {
    expect(service.consume('unknown-code')).toBeNull();
  });

  // 4
  it('not allow expired code to be consumed', () => {
    const now = Date.now();

    jest.spyOn(Date, 'now').mockReturnValue(now);

    const code = service.issue(payload);

    jest
      .spyOn(Date, 'now')
      .mockReturnValue(now + AUTH_EXPIRATION.CODE_TTL_MS + 1);

    expect(service.consume(code)).toBeNull();

    jest.restoreAllMocks();
  });
});
