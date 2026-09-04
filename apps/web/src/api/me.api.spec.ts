/**
 * 검증 포인트:
 * getMe
 *   1. GET /me로 authorizedFetch를 호출하고 결과를 그대로 반환한다.
 * updateNickname
 *   2. PATCH /me로 nickname을 담아 authorizedFetch를 호출하고 결과를 그대로 반환한다.
 * deleteMe
 *   3. DELETE /me로 authorizedFetch를 호출한다.
 */
import { authorizedFetch } from '@/lib/auth/authorizedFetch';
import { deleteMe, getMe, updateNickname } from './me.api';

jest.mock('@/lib/auth/authorizedFetch', () => ({
  authorizedFetch: jest.fn(),
}));

const mockedAuthorizedFetch = jest.mocked(authorizedFetch);

const me = {
  id: 'user-1',
  nickname: '새틈이',
  provider: 'google' as const,
  createdAt: '2026-08-19T00:00:00+09:00',
};

describe('getMe', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 1
  it('call authorizedFetch with GET /me and return its result', async () => {
    mockedAuthorizedFetch.mockResolvedValue(me);

    await expect(getMe()).resolves.toEqual(me);
    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/me');
  });
});

describe('updateNickname', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 2
  it('call authorizedFetch with PATCH /me and return its result', async () => {
    mockedAuthorizedFetch.mockResolvedValue(me);

    await expect(updateNickname('새틈이')).resolves.toEqual(me);
    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/me', {
      method: 'PATCH',
      body: JSON.stringify({ nickname: '새틈이' }),
    });
  });
});

describe('deleteMe', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 3
  it('call authorizedFetch with DELETE /me', async () => {
    mockedAuthorizedFetch.mockResolvedValue(undefined);

    await deleteMe();

    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/me', {
      method: 'DELETE',
    });
  });
});
