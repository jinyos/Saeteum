import { test, expect } from '@playwright/test';
import {
  createTestUser,
  drawTodayMission,
  loginAs,
  type TestUser,
} from './fixtures/testUser';

test.describe('오늘의 미션 뽑기', () => {
  let user: TestUser;

  test.beforeEach(async ({ context }) => {
    user = await createTestUser();
    await loginAs(context, user);
  });

  test.afterEach(async () => {
    await user.cleanup();
  });

  test('미션을 뽑으면 오늘의 미션 내용이 화면에 보인다', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('아직 미션이 없어요.')).toBeVisible();

    await page.getByRole('button', { name: '미션 뽑기' }).click();

    await expect(page.getByText('아직 미션이 없어요.')).not.toBeVisible();
    await expect(page.getByText('오늘의 미션')).toBeVisible();
  });

  test('이미 오늘 미션을 뽑았다면 다시 뽑을 수 없다', async ({ page }) => {
    await drawTodayMission(user);

    await page.goto('/');

    await expect(
      page.getByRole('button', { name: '미션 뽑기' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('link', { name: '후기 작성하기' }),
    ).toBeVisible();
  });
});
