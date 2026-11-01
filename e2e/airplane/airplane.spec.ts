import { expect, test } from '@playwright/test';

test.describe('1942 airplane game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Airplane1942');
    await page.waitForLoadState('networkidle');
  });

  test('the game screen shows the canvas, HUD and start overlay', async ({ page }) => {
    await expect(page.getByTestId('airplane-canvas')).toBeVisible();
    await expect(page.getByTestId('airplane-ready')).toBeVisible();
    await expect(page.getByTestId('airplane-start')).toBeVisible();
    await expect(page.getByTestId('airplane-score')).toHaveText('0');
    await expect(page.getByTestId('airplane-lives')).toHaveText('❤❤❤');
    await expect(page.getByTestId('airplane-bombs')).toHaveText('✦✦✦');
  });

  test('the welcome tile navigates to the game', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('heading', { name: '1942 Airplane' }).click();

    await expect(page).toHaveURL(/\/Airplane1942/);
    await expect(page.getByTestId('airplane-canvas')).toBeVisible();
  });

  test('pressing Space starts the game and spawns wave 1', async ({ page }) => {
    await page.keyboard.press('Space');

    await expect(page.getByTestId('airplane-ready')).toBeHidden();
    await expect(page.getByTestId('airplane-wave')).toContainText('Wave 1');
  });

  test('shooting an enemy increases the score', async ({ page }) => {
    await page.keyboard.press('Space');

    // Hold fire for a few seconds; enemies enter the formation and get hit.
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');

    const score = Number(await page.getByTestId('airplane-score').textContent());
    expect(score).toBeGreaterThan(0);
  });

  test('the bomb key clears the formation and consumes a bomb', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);

    await page.keyboard.press('KeyB');

    await expect(page.getByTestId('airplane-bombs')).toHaveText('✦✦');
  });

  test('a diving formation enemy costs a life', async ({ page }) => {
    await page.keyboard.press('Space');

    // The player starts at the bottom centre, directly under the middle
    // formation column, so a diving enemy reaches it within a few seconds.
    await expect(page.getByTestId('airplane-lives')).toHaveText('❤❤', { timeout: 15000 });
  });
});
