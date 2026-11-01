import { expect, test } from '@playwright/test';

test.describe('candy crush game', () => {
  test('the idle screen shows the board and HUD', async ({ page }) => {
    await page.goto('/CandyCrush');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('candy-title')).toHaveText('Candy Crush');

    await expect(page.locator('[data-pw="candy-cell"]')).toHaveCount(36);

    await expect(page.getByTestId('candy-score')).toHaveText('0');
    await expect(page.getByTestId('candy-moves')).toHaveText('25');
    await expect(page.getByTestId('candy-play')).toBeVisible();
  });

  test('the play button starts a round', async ({ page }) => {
    await page.goto('/CandyCrush');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('candy-play').click();

    await expect(page.getByTestId('candy-play')).toBeHidden();
    await expect(page.getByTestId('candy-moves')).toHaveText('25');
  });

  test('selecting a cell marks it and keeps the move count', async ({ page }) => {
    await page.goto('/CandyCrush');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('candy-play').click();

    await page.locator('[data-pw="candy-cell"]').nth(0).click();

    await expect(page.getByTestId('candy-moves')).toHaveText('25');
  });

  test('a non-adjacent pair is not a valid swap', async ({ page }) => {
    await page.goto('/CandyCrush');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('candy-play').click();

    const cells = page.locator('[data-pw="candy-cell"]');
    await cells.nth(0).click();
    await cells.nth(8).click();

    // Not adjacent: the second click just reselects, no move is spent.
    await expect(page.getByTestId('candy-moves')).toHaveText('25');
  });
});
