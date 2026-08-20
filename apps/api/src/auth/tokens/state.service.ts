import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AUTH_EXPIRATION } from '@/common/constants';
import { authConfig } from '@/auth/config/auth.config';

interface StatePayload {
  next: string;
  expiresAt: number;
}

@Injectable()
export class StateService {
  sign(next: string): string {
    const payload: StatePayload = {
      next,
      expiresAt: Date.now() + AUTH_EXPIRATION.STATE_TTL_MS,
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signature = this.createSignature(encodedPayload);

    return `${encodedPayload}.${signature}`;
  }

  verify(state: string): { next: string } | null {
    const [encodedPayload, signature] = state.split('.');

    if (!encodedPayload || !signature) {
      return null;
    }

    const expectedSignature = this.createSignature(encodedPayload);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const parsedPayload = this.parsePayload(encodedPayload);

    if (parsedPayload === null || !this.isStatePayload(parsedPayload)) {
      return null;
    }

    if (parsedPayload.expiresAt <= Date.now()) {
      return null;
    }

    return { next: parsedPayload.next };
  }

  private createSignature(encodedPayload: string): string {
    return createHmac('sha256', authConfig.stateSecret)
      .update(encodedPayload)
      .digest('base64url');
  }

  private parsePayload(encodedPayload: string): unknown {
    try {
      return JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      );
    } catch {
      return null;
    }
  }

  private isStatePayload(value: unknown): value is StatePayload {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const payload = value as Record<string, unknown>;

    return (
      typeof payload.next === 'string' && typeof payload.expiresAt === 'number'
    );
  }
}
