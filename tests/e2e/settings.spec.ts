import { test, expect } from '@playwright/test';
import {
  createTestUser,
  loginAs,
  userExists,
  type TestUser,
} from './fixtures/testUser';

test.describe('설정', () => {
  let user: TestUser;

  test.beforeEach(async ({ context }) => {
    user = await createTestUser();
    await loginAs(context, user);
  });

  test.afterEach(async () => {
    await user.cleanup();
  });

  test('닉네임을 수정하면 저장되고, 새로고침해도 유지된다', async ({
    page,
  }) => {
    await page.goto('/mypage/settings');

    const nicknameInput = page.getByRole('textbox');
    await expect(nicknameInput).toHaveValue(user.nickname);

    await nicknameInput.fill('새로운닉네임');
    await page.getByRole('button', { name: '저장' }).click();

    await expect(page.getByText('닉네임을 저장했어요.')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('textbox')).toHaveValue('새로운닉네임');
  });

  test('로그아웃하면 랜딩 화면으로 이동하고 세션이 끝난다', async ({
    page,
  }) => {
    await page.goto('/mypage/settings');

    await page.getByRole('button', { name: '로그아웃' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('틈만 나면, 새로움!')).toBeVisible();

    await page.goto('/mypage/settings');
    await expect(page).toHaveURL('/');
  });

  test('탈퇴하면 계정이 삭제되고 랜딩 화면으로 이동한다', async ({ page }) => {
    await page.goto('/mypage/settings');

    await page.getByRole('button', { name: '탈퇴' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: '탈퇴' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('틈만 나면, 새로움!')).toBeVisible();
    await expect(await userExists(user.id)).toBe(false);
  });
});
