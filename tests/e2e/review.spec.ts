import { test, expect } from '@playwright/test';
import {
  createTestUser,
  drawTodayMission,
  loginAs,
  type DrawnMission,
  type TestUser,
} from './fixtures/testUser';

test.describe('후기 작성 및 보기', () => {
  let user: TestUser;
  let mission: DrawnMission;

  test.beforeEach(async ({ context }) => {
    user = await createTestUser();
    await loginAs(context, user);
    mission = await drawTodayMission(user);
  });

  test.afterEach(async () => {
    await user.cleanup();
  });

  test('별점과 문장으로 후기를 저장하면 후기 보기 화면에 그대로 보인다', async ({
    page,
  }) => {
    await page.goto('/reviews/new');

    await expect(page.getByText(mission.missionContent)).toBeVisible();

    await page.getByRole('button', { name: '별점 5점' }).click();
    await page
      .getByPlaceholder('오늘 새틈은 어땠나요?')
      .fill('오늘 뽑은 미션 좋았다');

    await page.getByRole('button', { name: '저장하기' }).click();

    await expect(page).toHaveURL(`/reviews/${mission.missionDrawId}`);
    await expect(page.getByText('오늘 뽑은 미션 좋았다')).toBeVisible();
    await expect(page.getByLabel('별점 5점')).toBeVisible();
  });
});
