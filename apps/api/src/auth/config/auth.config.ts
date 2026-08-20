import { AUTH_EXPIRATION } from '@/common/constants';

function requireEnv(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }

  return value;
}

export function createAuthConfig(env: NodeJS.ProcessEnv) {
  return {
    jwtSecret: requireEnv(env, 'JWT_SECRET'),
    stateSecret: requireEnv(env, 'AUTH_STATE_SECRET'),
    webOrigin: requireEnv(env, 'WEB_ORIGIN'),

    accessTokenExpiresIn: AUTH_EXPIRATION.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresInMs: AUTH_EXPIRATION.REFRESH_TOKEN_TTL_MS,

    providers: {
      google: {
        clientId: requireEnv(env, 'GOOGLE_CLIENT_ID'),
        clientSecret: requireEnv(env, 'GOOGLE_CLIENT_SECRET'),
        redirectUri: requireEnv(env, 'GOOGLE_REDIRECT_URI'),
      },
      kakao: {
        clientId: requireEnv(env, 'KAKAO_CLIENT_ID'),
        clientSecret: env.KAKAO_CLIENT_SECRET ?? '',
        redirectUri: requireEnv(env, 'KAKAO_REDIRECT_URI'),
      },
      naver: {
        clientId: requireEnv(env, 'NAVER_CLIENT_ID'),
        clientSecret: requireEnv(env, 'NAVER_CLIENT_SECRET'),
        redirectUri: requireEnv(env, 'NAVER_REDIRECT_URI'),
      },
    },
  } as const;
}

export const authConfig = createAuthConfig(process.env);
