import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { AUTH_EXPIRATION } from '@/common/constants';

export interface ExchangeCodePayload {
  accessToken: string;
  refreshToken: string;
}

interface StoredExchangeCode {
  payload: ExchangeCodePayload;
  expiresAt: number;
}

@Injectable()
export class ExchangeCodeService {
  private readonly store = new Map<string, StoredExchangeCode>();

  issue(payload: ExchangeCodePayload): string {
    const code = randomBytes(32).toString('base64url');

    this.store.set(code, {
      payload,
      expiresAt: Date.now() + AUTH_EXPIRATION.CODE_TTL_MS,
    });

    return code;
  }

  consume(code: string): ExchangeCodePayload | null {
    const entry = this.store.get(code);

    if (!entry) {
      return null;
    }

    this.store.delete(code);

    if (entry.expiresAt <= Date.now()) {
      return null;
    }

    return entry.payload;
  }
}
