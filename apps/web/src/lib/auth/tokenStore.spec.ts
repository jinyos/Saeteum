/**
 * 검증 포인트:
 * 1. 토큰을 저장하면 동일한 값을 조회할 수 있다.
 * 2. 토큰이 바뀌면 구독자에게 새 값이 전달된다.
 * 3. 구독 해제 후에는 변경 알림을 받지 않는다.
 * 4. 새 구독자가 등록되면 이전 구독자는 더 이상 알림을 받지 않는다.
 */
import {
  getAccessToken,
  setAccessToken,
  subscribeToAccessToken,
} from './tokenStore';

describe('tokenStore', () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  // 1
  it('return stored token after setting it', () => {
    setAccessToken('token-1');

    expect(getAccessToken()).toBe('token-1');
  });

  // 2
  it('notify subscriber when token changes', () => {
    const listener = jest.fn();

    subscribeToAccessToken(listener);
    setAccessToken('token-2');

    expect(listener).toHaveBeenCalledWith('token-2');
  });

  // 3
  it('not notify after unsubscribing', () => {
    const listener = jest.fn();

    const unsubscribe = subscribeToAccessToken(listener);
    unsubscribe();
    setAccessToken('token-3');

    expect(listener).not.toHaveBeenCalled();
  });

  // 4
  it('stop notifying previous subscriber when a new one is registered', () => {
    const first = jest.fn();
    const second = jest.fn();

    subscribeToAccessToken(first);
    subscribeToAccessToken(second);
    setAccessToken('token-4');

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('token-4');
  });
});
