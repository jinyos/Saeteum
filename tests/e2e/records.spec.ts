import { test, expect } from '@playwright/test';
import {
  createTestUser,
  drawTodayMission,
  loginAs,
  type DrawnMission,
  type TestUser,
} from './fixtures/testUser';

test.describe('기록 조회', () => {
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

  test('기록 목록에서 카테고리, 뽑은 미션을 거쳐 읽기 전용 후기 화면까지 이동한다', async ({
    page,
  }) => {
    await page.goto('/mypage/records');

    await page.locator(`a[href="/mypage/records/${mission.category}"]`).click();

    await expect(page).toHaveURL(`/mypage/records/${mission.category}`);

    await page
      .locator(
        `a[href="/mypage/records/${mission.category}/${mission.missionId}"]`,
      )
      .click();

    await expect(page).toHaveURL(
      `/mypage/records/${mission.category}/${mission.missionId}`,
    );
    await expect(page.getByText(mission.missionContent)).toBeVisible();
    await expect(page.getByText('후기를 남기지 않았어요')).toBeVisible();
  });
});
