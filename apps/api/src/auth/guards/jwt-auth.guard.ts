import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { TokenService } from '@/auth/tokens/token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { id: string };
    }>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppException('UNAUTHORIZED', 'Authentication required.');
    }

    const token = authorization.slice('Bearer '.length);

    if (!token) {
      throw new AppException('UNAUTHORIZED', 'Authentication required.');
    }

    const payload = this.tokenService.verifyAccessToken(token);

    if (!payload) {
      throw new AppException('UNAUTHORIZED', 'Authentication required.');
    }

    request.user = {
      id: payload.sub,
    };

    return true;
  }
}
