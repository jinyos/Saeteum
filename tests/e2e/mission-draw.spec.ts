import { test, expect } from '@playwright/test';
import { createTestUser, loginAs, type TestUser } from './fixtures/testUser';

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
});
