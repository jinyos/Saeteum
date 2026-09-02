/**
 * 검증 포인트:
 * createReview
 *   1. POST /reviews로 authorizedFetch를 호출하고 결과를 그대로 반환한다.
 *   2. authorizedFetch가 실패하면 에러를 그대로 전파한다.
 * getReviewPhotoUploadTicket
 *   3. POST /reviews/photos로 authorizedFetch를 호출하고 결과를 그대로 반환한다.
 * getReview
 *   4. GET /reviews/:missionDrawId로 authorizedFetch를 호출하고 결과를 그대로 반환한다.
 * deleteReview
 *   5. DELETE /reviews/:id로 authorizedFetch를 호출한다.
 * uploadReviewPhoto
 *   6. uploadUrl로 FormData(cacheControl, 파일)를 PUT하고, 실패하면 에러를 던진다.
 *   7. 응답이 실패(res.ok === false)면 에러를 던진다.
 */
import { authorizedFetch } from '@/lib/auth/authorizedFetch';
import {
  createReview,
  deleteReview,
  getReview,
  getReviewPhotoUploadTicket,
  uploadReviewPhoto,
} from './reviews.api';

jest.mock('@/lib/auth/authorizedFetch', () => ({
  authorizedFetch: jest.fn(),
}));

const mockedAuthorizedFetch = jest.mocked(authorizedFetch);

describe('createReview', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 1
  it('call authorizedFetch with POST /reviews and return its result', async () => {
    const input = { missionDrawId: 'draw-1', rating: 5 };
    mockedAuthorizedFetch.mockResolvedValue({ reviewId: 'review-1' });

    await expect(createReview(input)).resolves.toEqual({
      reviewId: 'review-1',
    });
    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/reviews', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  });

  // 2
  it('propagate the error when authorizedFetch fails', async () => {
    const error = new Error('network error');
    mockedAuthorizedFetch.mockRejectedValue(error);

    await expect(createReview({ missionDrawId: 'draw-1' })).rejects.toBe(error);
  });
});

describe('getReviewPhotoUploadTicket', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 3
  it('call authorizedFetch with POST /reviews/photos and return its result', async () => {
    const result = { uploadUrl: 'https://x/upload', photoPath: 'u1/a.jpg' };
    mockedAuthorizedFetch.mockResolvedValue(result);

    await expect(getReviewPhotoUploadTicket()).resolves.toEqual(result);
    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/reviews/photos', {
      method: 'POST',
    });
  });
});

describe('getReview', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 4
  it('call authorizedFetch with GET /reviews/:missionDrawId and return its result', async () => {
    const result = {
      reviewId: 'review-1',
      mission: { content: '새로운 음악 장르 들어보기' },
      rating: 5,
      photoUrl: null,
      content: null,
      emotionTags: [],
      editable: true,
    };
    mockedAuthorizedFetch.mockResolvedValue(result);

    await expect(getReview('draw-1')).resolves.toEqual(result);
    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/reviews/draw-1');
  });
});

describe('deleteReview', () => {
  beforeEach(() => {
    mockedAuthorizedFetch.mockReset();
  });

  // 5
  it('call authorizedFetch with DELETE /reviews/:id', async () => {
    mockedAuthorizedFetch.mockResolvedValue(undefined);

    await deleteReview('review-1');

    expect(mockedAuthorizedFetch).toHaveBeenCalledWith('/reviews/review-1', {
      method: 'DELETE',
    });
  });
});

describe('uploadReviewPhoto', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  // 6
  it('PUT a FormData body with cacheControl and the file to uploadUrl', async () => {
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);

    await uploadReviewPhoto('https://x/upload?token=abc', file);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://x/upload?token=abc',
      expect.objectContaining({
        method: 'PUT',
        headers: { 'x-upsert': 'false' },
      }),
    );
    const body = jest.mocked(global.fetch).mock.calls[0][1]?.body as FormData;
    expect(body.get('cacheControl')).toBe('3600');
    expect(body.get('')).toBe(file);
  });

  // 7
  it('throw when the upload response is not ok', async () => {
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    jest.mocked(global.fetch).mockResolvedValue({ ok: false } as Response);

    await expect(uploadReviewPhoto('https://x/upload', file)).rejects.toThrow(
      '사진 업로드에 실패했어요.',
    );
  });
});
