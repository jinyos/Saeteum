import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { authConfig } from '@/auth/config/auth.config';

interface AccessTokenPayload {
  sub: string;
}

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  issueAccessToken(userId: string): string {
    return this.jwtService.sign({ sub: userId } satisfies AccessTokenPayload);
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return this.jwtService.verify<AccessTokenPayload>(token);
    } catch {
      return null;
    }
  }

  issueRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  refreshTokenExpiresAt(): Date {
    return new Date(Date.now() + authConfig.refreshTokenExpiresInMs);
  }
}
