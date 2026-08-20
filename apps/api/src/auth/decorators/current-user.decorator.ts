import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): { id: string } => {
    const request = ctx.switchToHttp().getRequest<{ user?: { id: string } }>();

    if (!request.user) {
      throw new AppException('UNAUTHORIZED', 'Authentication required.');
    }

    return request.user;
  },
);
