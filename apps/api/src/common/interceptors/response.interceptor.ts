import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Nest의 @Redirect()가 사용하는 metadata key.
// 공개 상수가 아니므로 Nest의 내부 metadata key에 의존한다.
const REDIRECT_METADATA_KEY = '__redirect__';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isRedirect = this.reflector.get<boolean>(
      REDIRECT_METADATA_KEY,
      context.getHandler(),
    );

    if (isRedirect) {
      return next.handle();
    }

    return next
      .handle()
      .pipe(
        map((data: unknown) => ({ data: data === undefined ? null : data })),
      );
  }
}
