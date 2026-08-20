/**
 * 검증 포인트:
 * 1. 유효한 내부 경로는 그대로 반환한다.
 * 2. 유효하지 않은 경로는 `/`로 정규화한다.
 */
import { normalizeNextPath } from './next-path';

describe('normalizeNextPath', () => {
  // 1
  it('return valid internal path as-is', () => {
    expect(normalizeNextPath('/')).toBe('/');
    expect(normalizeNextPath('/me')).toBe('/me');
  });

  // 2
  it('return "/" for invalid paths', () => {
    expect(normalizeNextPath('')).toBe('/');
    expect(normalizeNextPath('me')).toBe('/');
    expect(normalizeNextPath('//evil.com')).toBe('/');
    expect(normalizeNextPath('/\\evil.com')).toBe('/');
    expect(normalizeNextPath('https://evil.com')).toBe('/');
  });
});
