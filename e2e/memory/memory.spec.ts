import { expect, test } from '@playwright/test';

test.describe('memory match game', () => {
  test('the board shows 12 cards and the HUD', async ({ page }) => {
    await page.goto('/MemoryMatch');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('memory-title')).toHaveText('Animal Memory');
    await expect(page.getByTestId('memory-hint')).toHaveText(
      'Tap two cards to find matching animal pairs!',
    );

    await expect(page.locator('[data-pw="memory-card"]')).toHaveCount(12);

    await expect(page.getByTestId('memory-pairs')).toHaveText('0/6');
    await expect(page.getByTestId('memory-moves')).toHaveText('0');
  });

  test('flipping two cards counts one move', async ({ page }) => {
    await page.goto('/MemoryMatch');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[data-pw="memory-card"]');
    await cards.nth(0).click();
    await cards.nth(1).click();

    await expect(page.getByTestId('memory-moves')).toHaveText('1');
  });

  test('flipping the same card twice does not count a move', async ({ page }) => {
    await page.goto('/MemoryMatch');
    await page.waitForLoadState('networkidle');

    const first = page.locator('[data-pw="memory-card"]').first();
    await first.click();
    await first.click();

    await expect(page.getByTestId('memory-moves')).toHaveText('0');
  });

  test('the play again button is shown', async ({ page }) => {
    await page.goto('/MemoryMatch');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('memory-play-again')).toBeVisible();
    await expect(page.getByTestId('memory-win')).toBeHidden();
  });
});
