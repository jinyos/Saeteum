/**
 * 검증 포인트:
 * 1. 예외 응답이 { error: { code, message } } 형태로 생성된다.
 * 2. 각 error code가 정의된 HTTP status로 정확히 매핑된다.
 */
import { AppException, ERROR_STATUS } from './app.exception';

describe('AppException', () => {
  // 1
  it('set response body as { error: { code, message } }', () => {
    const exception = new AppException('UNAUTHORIZED', 'Login required.');

    expect(exception.getResponse()).toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Login required.' },
    });
  });

  // 2
  it.each(Object.entries(ERROR_STATUS))(
    'map %s to documented status',
    (code, status) => {
      expect(
        new AppException(code as keyof typeof ERROR_STATUS, 'x').getStatus(),
      ).toBe(status);
    },
  );
});
