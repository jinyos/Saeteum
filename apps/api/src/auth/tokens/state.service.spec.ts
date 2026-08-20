/**
 * 검증 포인트:
 * 1. 서명한 state를 검증하면 원래 next 값을 돌려준다.
 * 2. 서명 검증에 실패한 state는 검증에 실패한다.
 *   2-1. payload가 변조된 state
 *   2-2. signature가 변조된 state
 * 3. 형식이 잘못된 state는 검증에 실패한다.
 * 4. 만료된 state는 검증에 실패한다.
 * 5. payload가 유효하지 않으면 검증에 실패한다.
 *   5-1. 유효한 JSON이 아닌 경우
 *   5-2. payload 구조가 잘못된 경우
 */
import { AUTH_EXPIRATION } from '@/common/constants';
import { StateService } from './state.service';
import { createHmac } from 'node:crypto';
import { authConfig } from '@/auth/config/auth.config';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    service = new StateService();
  });

  // 1
  it('return original next value for a valid state', () => {
    const next = '/me';
    const state = service.sign(next);

    expect(service.verify(state)).toEqual({ next });
  });

  // 2-1
  it('return null when payload is tampered', () => {
    const state = service.sign('/me');
    const [, signature] = state.split('.');

    const tamperedPayload = Buffer.from(
      JSON.stringify({
        next: '/next',
        expiresAt: Date.now() + AUTH_EXPIRATION.STATE_TTL_MS,
      }),
    ).toString('base64url');

    const tamperedState = `${tamperedPayload}.${signature}`;

    expect(service.verify(tamperedState)).toBeNull();
  });

  // 2-2
  it('return null when signature is tampered', () => {
    const state = service.sign('/me');
    const [encodedPayload] = state.split('.');

    const tamperedState = `${encodedPayload}.tampered-signature`;

    expect(service.verify(tamperedState)).toBeNull();
  });

  // 3
  it('return null for malformed state', () => {
    expect(service.verify('')).toBeNull();
    expect(service.verify('payload.')).toBeNull();
    expect(service.verify('.signature')).toBeNull();
  });

  // 4
  it('return null when state is expired', () => {
    const now = Date.now();

    jest.spyOn(Date, 'now').mockReturnValue(now);

    const state = service.sign('/me');

    jest
      .spyOn(Date, 'now')
      .mockReturnValue(now + AUTH_EXPIRATION.STATE_TTL_MS + 1);

    expect(service.verify(state)).toBeNull();

    jest.restoreAllMocks();
  });

  // 5-1
  it('return null when payload is not valid JSON', () => {
    const encodedPayload = Buffer.from('not-json').toString('base64url');

    const signature = createHmac('sha256', authConfig.stateSecret)
      .update(encodedPayload)
      .digest('base64url');

    const state = `${encodedPayload}.${signature}`;

    expect(service.verify(state)).toBeNull();
  });

  // 5-2
  it('return null when payload structure is invalid', () => {
    const payload = {
      next: '/me',
      expiresAt: 'invalid',
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );

    const signature = createHmac('sha256', authConfig.stateSecret)
      .update(encodedPayload)
      .digest('base64url');

    const state = `${encodedPayload}.${signature}`;

    expect(service.verify(state)).toBeNull();
  });
});
