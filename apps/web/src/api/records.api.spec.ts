/**
 * 검증 포인트:
 * getCategoryMissions
 *   1. GET /records/categories/:category로 authorizedFetch를 호출하고 결과를 그대로 반환한다.
 * getMissionRecord
 *   2. GET /records/missions/:missionId로 authorizedFetch를 호출하고 결과를 그대로 반환한다.
 */
import { authorizedFetch } from '@/lib/auth/authorizedFetch';
import { getCategoryMissions, getMissionRecord } from './records.api';

jest.mock('@/lib/auth/authorizedFetch', () => ({
  authorizedFetch: jest.fn(),
}));

const mockedAuthorizedFetch = jest.mocked(authorizedFetch);

describe('getCategoryMissions', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 1
  it('call authorizedFetch with GET /records/categories/:category and return its result', async () => {
    const result = [{ missionId: 1, drawn: true }];
    mockedAuthorizedFetch.mockResolvedValue(result);

    await expect(getCategoryMissions('nature')).resolves.toEqual(result);
    expect(mockedAuthorizedFetch).toHaveBeenCalledWith(
      '/records/categories/nature',
    );
  });
});

describe('getMissionRecord', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 2
  it('call authorizedFetch with GET /records/missions/:missionId and return its result', async () => {
    const result = {
      mission: { id: 1, category: 'nature', content: '하늘 사진 찍기' },
      draws: [],
    };
    mockedAuthorizedFetch.mockResolvedValue(result);

    await expect(getMissionRecord(1)).resolves.toEqual(result);
    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/records/missions/1');
  });
});
