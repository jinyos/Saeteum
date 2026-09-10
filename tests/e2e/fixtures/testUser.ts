import path from 'node:path';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { BrowserContext } from '@playwright/test';
import postgres from 'postgres';

process.loadEnvFile(path.resolve(__dirname, '../../../apps/api/.env'));

const sql = postgres(process.env.DATABASE_URL!);

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface TestUser {
  id: string;
  nickname: string;
  cleanup: () => Promise<void>;
}

/**
 * E2E 전용 유저를 DB에 직접 생성한다.
 * 소셜 로그인을 자동화할 수 없어서, provider_id에 매번 고유한 값을 써서
 * 실제 유저와 병렬로 도는 다른 워커의 테스트 유저와도 절대 충돌하지 않게 한다.
 */
export async function createTestUser(): Promise<TestUser> {
  const suffix = randomUUID();
  const providerId = `e2e-${suffix}`;
  const nickname = `e2e테스터${suffix.slice(0, 8)}`;

  const [user] = await sql`
    insert into users (nickname, provider, provider_id)
    values (${nickname}, 'google', ${providerId})
    returning id
  `;

  return {
    id: user.id,
    nickname,
    cleanup: async () => {
      await sql`delete from users where id = ${user.id}`;
    },
  };
}

/**
 * refresh_token 쿠키를 심어서 로그인된 상태로 만든다.
 * AuthProvider가 마운트 시 POST /api/auth/refresh를 호출해
 * 이 토큰으로 실제 access token을 발급받아오므로, access token은 따로 만들 필요 없다.
 */
export async function loginAs(
  context: BrowserContext,
  user: TestUser,
): Promise<void> {
  const rawToken = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await sql`
    insert into refresh_tokens (user_id, token_hash, expires_at)
    values (${user.id}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  await context.addCookies([
    {
      name: 'refresh_token',
      value: rawToken,
      domain: 'localhost',
      path: '/api/auth',
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: 'has_session',
      value: '1',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function getKstDayKey(date: Date = new Date()): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export interface DrawnMission {
  missionDrawId: string;
  missionId: number;
  missionContent: string;
  category: string;
}

/**
 * "미션 뽑기" 자체는 mission-draw.spec.ts에서 이미 검증하므로,
 * 다른 흐름을 테스트할 땐 매번 UI로 뽑지 않고 오늘 뽑은 상태를 DB에 직접 만들어 시작한다.
 */
export async function drawTodayMission(user: TestUser): Promise<DrawnMission> {
  const [mission] = await sql`
    select id, content, category from missions order by id limit 1
  `;

  const [draw] = await sql`
    insert into mission_draws (user_id, mission_id, drawn_date)
    values (${user.id}, ${mission.id}, ${getKstDayKey()})
    returning id
  `;

  return {
    missionDrawId: draw.id,
    missionId: mission.id,
    missionContent: mission.content,
    category: mission.category,
  };
}
