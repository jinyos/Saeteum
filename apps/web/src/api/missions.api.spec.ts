/**
 * 검증 포인트:
 * getTodayMission
 *   1. GET /missions/today로 authorizedFetch를 호출하고 결과를 그대로 반환한다.
 *   2. authorizedFetch가 실패하면 에러를 그대로 전파한다.
 * drawMission
 *   3. POST /missions/draw로 authorizedFetch를 호출하고 결과를 그대로 반환한다.
 *   4. authorizedFetch가 실패하면 에러를 그대로 전파한다.
 */
import { authorizedFetch } from '@/lib/auth/authorizedFetch';
import { drawMission, getTodayMission } from './missions.api';

jest.mock('@/lib/auth/authorizedFetch', () => ({
  authorizedFetch: jest.fn(),
}));

const mockedAuthorizedFetch = jest.mocked(authorizedFetch);

describe('getTodayMission', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 1
  it('call authorizedFetch with GET /missions/today and return its result', async () => {
    mockedAuthorizedFetch.mockResolvedValue({ drawn: false });

    await expect(getTodayMission()).resolves.toEqual({ drawn: false });
    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/missions/today');
  });

  // 2
  it('propagate the error when authorizedFetch fails', async () => {
    const error = new Error('network error');
    mockedAuthorizedFetch.mockRejectedValue(error);

    await expect(getTodayMission()).rejects.toBe(error);
  });
});

describe('drawMission', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 3
  it('call authorizedFetch with POST /missions/draw and return its result', async () => {
    const result = {
      missionDrawId: 'draw-1',
      mission: { content: '새로운 음악 장르 들어보기' },
      drawnAt: '2026-08-26T00:00:00+09:00',
    };
    mockedAuthorizedFetch.mockResolvedValue(result);

    await expect(drawMission()).resolves.toEqual(result);
    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/missions/draw', {
      method: 'POST',
    });
  });

  // 4
  it('propagate the error when authorizedFetch fails', async () => {
    const error = new Error('network error');
    mockedAuthorizedFetch.mockRejectedValue(error);

    await expect(drawMission()).rejects.toBe(error);
  });
});
