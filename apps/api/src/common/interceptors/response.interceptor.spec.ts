/**
 * 검증 포인트:
 * 1. 일반적인 컨트롤러 반환값을 { data: 반환값 }으로 감싼다.
 * 2. undefined 반환값을 { data: null }로 감싼다.
 * 3. @Redirect() 라우트는 반환값을 감싸지 않고 그대로 전달한다.
 */
import { CallHandler, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

function buildContext(): ExecutionContext {
  return { getHandler: () => ({}) } as unknown as ExecutionContext;
}

function buildCallHandler(value: unknown): CallHandler {
  return { handle: () => of(value) };
}

function buildInterceptor(isRedirect: boolean) {
  const reflector = {
    get: jest.fn().mockReturnValue(isRedirect),
  } as unknown as Reflector;

  return new ResponseInterceptor(reflector);
}

describe('ResponseInterceptor', () => {
  // 1
  it('wrap handler return value in { data }', (done) => {
    const interceptor = buildInterceptor(false);

    interceptor
      .intercept(buildContext(), buildCallHandler({ id: '1' }))
      .subscribe((result) => {
        expect(result).toEqual({ data: { id: '1' } });
        done();
      });
  });

  // 2
  it('wrap undefined return value as { data: null }', (done) => {
    const interceptor = buildInterceptor(false);

    interceptor
      .intercept(buildContext(), buildCallHandler(undefined))
      .subscribe((result) => {
        expect(result).toEqual({ data: null });
        done();
      });
  });

  // 3
  it('pass through redirect handler response without wrapping', (done) => {
    const interceptor = buildInterceptor(true);
    const redirectResult = {
      url: 'https://example.com',
      statusCode: HttpStatus.FOUND,
    };

    interceptor
      .intercept(buildContext(), buildCallHandler(redirectResult))
      .subscribe((result) => {
        expect(result).toBe(redirectResult);
        done();
      });
  });
});
