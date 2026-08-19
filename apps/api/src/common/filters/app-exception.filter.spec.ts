/**
 * 검증 포인트:
 * 1. AppException은 기존의 status와 { error: { code, message } } 응답을 그대로 전달한다.
 * 2. 매핑된 Nest HttpException은 프로젝트 표준 error code와 일반 메시지로 변환한다.
 * 3. 매핑되지 않은 HttpException은 INTERNAL_ERROR와 500으로 응답한다.
 * 4. 예상하지 못한 에러는 INTERNAL_ERROR와 500으로 응답하며 원본 에러 메시지를 노출하지 않는다.
 */
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AppExceptionFilter, STATUS_TO_ERROR } from './app-exception.filter';
import { AppException } from '@/common/exceptions/app.exception';

function buildHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });

  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('AppExceptionFilter', () => {
  let filter: AppExceptionFilter;

  beforeEach(() => {
    filter = new AppExceptionFilter();
  });

  // 1
  it('respond with AppException status and body as-is', () => {
    const { host, status, json } = buildHost();
    const exception = new AppException('UNAUTHORIZED', 'Login required.');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Login required.',
      },
    });
  });

  // 2
  it.each(Object.entries(STATUS_TO_ERROR))(
    'map %s to standard error response',
    (statusCode, error) => {
      const { host, status, json } = buildHost();

      filter.catch(new HttpException('x', Number(statusCode)), host);

      expect(status).toHaveBeenCalledWith(Number(statusCode));
      expect(json).toHaveBeenCalledWith({
        error,
      });
    },
  );

  // 3
  it('map unmapped HttpException status to INTERNAL_ERROR', () => {
    const { host, status, json } = buildHost();
    const exception = new HttpException(
      'Not allowed.',
      HttpStatus.METHOD_NOT_ALLOWED,
    );

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error.',
      },
    });
  });

  // 4
  it('map unknown non-HttpException error to INTERNAL_ERROR without leaking message', () => {
    const { host, status, json } = buildHost();

    filter.catch(new Error('db connection refused'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error.',
      },
    });
  });
});
