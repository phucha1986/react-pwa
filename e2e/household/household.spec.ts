import { expect, test } from '@playwright/test';

test.describe('household game', () => {
  test('the gallery shows the title and the item tiles', async ({ page }) => {
    await page.goto('/HouseholdGame');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('household-title')).toHaveText('🏠 Household Things');

    const tiles = page.locator('[data-pw="household-tile"]');
    await expect(tiles).toHaveCount(23);
    await expect(tiles.first()).toBeVisible();
  });

  test('the play button starts the quiz with the first item', async ({ page }) => {
    await page.goto('/HouseholdGame');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('household-play').click();

    await expect(page.getByTestId('household-question')).toHaveText('Which one is the Table?');
  });

  test('tapping a gallery tile starts the quiz for that item', async ({ page }) => {
    await page.goto('/HouseholdGame');
    await page.waitForLoadState('networkidle');

    const bedTile = page
      .locator('[data-pw="household-tile"]')
      .filter({ has: page.getByRole('img', { name: 'Bed' }) })
      .first();
    await expect(bedTile).toHaveCount(1);
    await bedTile.click();

    await expect(page.getByTestId('household-question')).toHaveText('Which one is the Bed?');
  });

  test('the quiz shows the current item with four options', async ({ page }) => {
    await page.goto('/HouseholdGame');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('household-play').click();

    await expect(page.getByTestId('household-question')).toHaveText('Which one is the Table?');
    await expect(page.getByTestId('household-option')).toHaveCount(4);
    await expect(
      page.getByTestId('household-option').filter({ has: page.getByRole('img', { name: 'Table' }) }),
    ).toHaveCount(1);
  });

  test('a wrong pick shakes but does not trigger success', async ({ page }) => {
    await page.goto('/HouseholdGame');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('household-play').click();

    const wrong = page
      .getByTestId('household-option')
      .filter({ hasNot: page.getByRole('img', { name: 'Table' }) })
      .first();
    await wrong.click();

    await expect(wrong).toHaveCSS('animation-name', 'shake');
    await expect(page.getByTestId('household-question')).toHaveText('Which one is the Table?');
    await expect(page.getByTestId('household-confetti')).toHaveCount(0);
  });

  test('the correct pick shows success + confetti and auto-advances in page', async ({ page }) => {
    await page.goto('/HouseholdGame');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('household-play').click();

    const correct = page
      .getByTestId('household-option')
      .filter({ has: page.getByRole('img', { name: 'Table' }) });
    await correct.click();

    await expect(page.getByTestId('household-question')).toHaveText("Great Job! It's Table!");
    await expect(page.getByTestId('household-confetti')).toHaveCount(60);
    await expect(correct).toHaveCSS('animation-name', 'bounce');

    // Advancing is in-page (no URL change): after the 6s speech fallback the
    // question switches to the next item (table → chair).
    await expect(page.getByTestId('household-question')).toHaveText('Which one is the Chair?', {
      timeout: 12000,
    });
    await expect(page).toHaveURL(/\/HouseholdGame/);
  });

  test('the back button returns to the gallery', async ({ page }) => {
    await page.goto('/HouseholdGame');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('household-play').click();
    await page.getByTestId('household-back').click();

    await expect(page.getByTestId('household-title')).toHaveText('🏠 Household Things');
    await expect(page.locator('[data-pw="household-tile"]')).toHaveCount(23);
  });

  test('language toggle switches the question to Vietnamese', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('bottom-bar-language').click();

    await page.goto('/HouseholdGame');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('household-play').click();

    await expect(page.getByTestId('household-question')).toHaveText('Con nào là Bàn?');
  });
});
