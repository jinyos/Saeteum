/**
 * 검증 포인트:
 * 1. 주어진 시각의 KST 기준 날짜를 YYYY-MM-DD로 반환한다.
 * 2. KST 자정을 넘긴 시각은 다음 날짜로 반환한다.
 * 3. KST 자정 직전 시각은 같은 날짜로 반환한다.
 */
import { getKstDayKey } from './kst-day';

describe('getKstDayKey', () => {
  // 1
  it('return KST date for a given UTC time', () => {
    expect(getKstDayKey(new Date('2026-01-01T10:00:00Z'))).toBe('2026-01-01');
  });

  // 2
  it('roll over to next day past KST midnight', () => {
    expect(getKstDayKey(new Date('2026-01-01T15:00:00Z'))).toBe('2026-01-02');
  });

  // 3
  it('stay on same day right before KST midnight', () => {
    expect(getKstDayKey(new Date('2026-01-01T14:59:59Z'))).toBe('2026-01-01');
  });
});
