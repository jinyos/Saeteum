/**
 * 검증 포인트:
 * 1. 필수 환경 변수가 있으면 authConfig를 정상적으로 구성한다.
 * 2. 필수 환경 변수가 없으면 즉시 에러를 던진다.
 */
import { createAuthConfig } from './auth.config';

describe('createAuthConfig', () => {
  const env = {
    JWT_SECRET: 'test-jwt-secret',
    AUTH_STATE_SECRET: 'test-state-secret',
    WEB_ORIGIN: 'http://localhost:3000',

    GOOGLE_CLIENT_ID: 'google-client-id',
    GOOGLE_CLIENT_SECRET: 'google-client-secret',
    GOOGLE_REDIRECT_URI: 'http://localhost:4000/auth/google/callback',

    KAKAO_CLIENT_ID: 'kakao-client-id',
    KAKAO_CLIENT_SECRET: 'kakao-client-secret',
    KAKAO_REDIRECT_URI: 'http://localhost:4000/auth/kakao/callback',

    NAVER_CLIENT_ID: 'naver-client-id',
    NAVER_CLIENT_SECRET: 'naver-client-secret',
    NAVER_REDIRECT_URI: 'http://localhost:4000/auth/naver/callback',
  };

  // 1
  it('create authConfig from environment variables', () => {
    const config = createAuthConfig(env);

    expect(config.jwtSecret).toBe('test-jwt-secret');
    expect(config.stateSecret).toBe('test-state-secret');
    expect(config.webOrigin).toBe('http://localhost:3000');

    expect(config.providers.google.clientId).toBe('google-client-id');
    expect(config.providers.kakao.clientId).toBe('kakao-client-id');
    expect(config.providers.naver.clientId).toBe('naver-client-id');
  });

  // 2
  it('throw error when required environment variable is missing', () => {
    const invalidEnv = {
      ...env,
      JWT_SECRET: undefined,
    };

    expect(() => createAuthConfig(invalidEnv)).toThrow(
      'Missing required env var: JWT_SECRET',
    );
  });
});
