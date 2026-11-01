import { expect, test } from '@playwright/test';

test.describe('whack-a-mole game', () => {
  test('the board shows 9 holes and the idle HUD', async ({ page }) => {
    await page.goto('/WhackAMole');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('whack-title')).toHaveText('Whack-a-Mole');
    await expect(page.getByTestId('whack-hint')).toHaveText(
      'Tap the animals as they pop out of the holes!',
    );

    await expect(page.locator('[data-pw="whack-hole"]')).toHaveCount(9);

    await expect(page.getByTestId('whack-score')).toHaveText('0');
    await expect(page.getByTestId('whack-time')).toHaveText('30s');
    await expect(page.getByTestId('whack-play')).toBeVisible();
    await expect(page.getByTestId('whack-mole')).toHaveCount(0);
  });

  test('the play button starts the countdown', async ({ page }) => {
    await page.goto('/WhackAMole');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('whack-play').evaluate((el) => el.click());

    await expect(page.getByTestId('whack-play')).toBeHidden();
    await expect(page.getByTestId('whack-time')).toHaveText('29s', { timeout: 8000 });

    // The spawner puts a mole in a random hole every 650ms.
    await expect(page.getByTestId('whack-mole')).toHaveCount(1, { timeout: 5000 });
  });

  test('tapping the holes scores at least one whack', async ({ page }) => {
    await page.goto('/WhackAMole');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('whack-play').evaluate((el) => el.click());

    // Exactly one hole holds the mole; tapping all nine guarantees a hit.
    const holes = page.locator('[data-pw="whack-hole"]');
    for (let i = 0; i < 9; i += 1) await holes.nth(i).click();

    const score = Number(await page.getByTestId('whack-score').textContent());
    expect(score).toBeGreaterThan(0);
  });

  test('the game ends when the timer runs out', async ({ page }) => {
    await page.goto('/WhackAMole');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('whack-play').evaluate((el) => el.click());

    await expect(page.getByTestId('whack-time')).toHaveText('0s', { timeout: 35000 });
    await expect(page.getByTestId('whack-gameover')).toBeVisible({ timeout: 35000 });
    await expect(page.getByTestId('whack-play-again')).toBeVisible();
  }, { timeout: 60000 });
});
