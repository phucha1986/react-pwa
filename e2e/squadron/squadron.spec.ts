import { expect, test } from '@playwright/test';

test.describe('sky squadron game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Squadron');
    await page.waitForLoadState('networkidle');
  });

  test('the game screen shows the canvas, HUD and start overlay', async ({ page }) => {
    await expect(page.getByTestId('squadron-canvas')).toBeVisible();
    await expect(page.getByTestId('squadron-ready')).toBeVisible();
    await expect(page.getByTestId('squadron-start')).toBeVisible();
    await expect(page.getByTestId('squadron-score')).toHaveText('0');
    await expect(page.getByTestId('squadron-lives')).toHaveText('❤❤❤');
    await expect(page.getByTestId('squadron-bombs')).toHaveText('✦✦✦');
  });

  test('the welcome tile navigates to the game', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('heading', { name: 'Sky Squadron' }).click();

    await expect(page).toHaveURL(/\/Squadron/);
    await expect(page.getByTestId('squadron-canvas')).toBeVisible();
  });

  test('pressing Space starts the game and spawns wave 1', async ({ page }) => {
    await page.keyboard.press('Space');

    await expect(page.getByTestId('squadron-ready')).toBeHidden();
    await expect(page.getByTestId('squadron-wave')).toContainText('Wave 1');
  });

  test('shooting an enemy increases the score', async ({ page }) => {
    await page.keyboard.press('Space');

    // Hold fire for a few seconds; enemies enter the formation and get hit.
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');

    const score = Number(await page.getByTestId('squadron-score').textContent());
    expect(score).toBeGreaterThan(0);
  });

  test('the bomb key clears the formation and consumes a bomb', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);

    await page.keyboard.press('KeyB');

    await expect(page.getByTestId('squadron-bombs')).toHaveText('✦✦');
  });

  test('a diving formation enemy costs a life', async ({ page }) => {
    await page.keyboard.press('Space');

    // The player starts at the left centre, directly in the path of the
    // middle formation column, so a diving enemy reaches it within a few seconds.
    await expect(page.getByTestId('squadron-lives')).toHaveText('❤❤', { timeout: 15000 });
  });
});
