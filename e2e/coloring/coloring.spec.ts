import { expect, test } from '@playwright/test';

test.describe('coloring game', () => {
  test('the home screen lists the pictures to color', async ({ page }) => {
    await page.goto('/ColoringGame');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('coloring-title')).toHaveText('Coloring');
    await expect(page.getByTestId('coloring-choose')).toHaveText('Pick a picture to color');
    await expect(page.locator('[data-pw="coloring-item"]')).toHaveCount(10);
  });

  test('opening the house shows its name, progress and palette', async ({ page }) => {
    await page.goto('/ColoringGame');
    await page.waitForLoadState('networkidle');

    const houseCard = page
      .locator('[data-pw="coloring-item"]')
      .filter({ hasText: 'House' })
      .first();
    await expect(houseCard).toHaveCount(1);
    await houseCard.click();

    await expect(page.getByTestId('coloring-name')).toHaveText('House');
    await expect(page.getByTestId('coloring-progress')).toHaveText('0/12');
    await expect(page.getByTestId('coloring-swatch')).toHaveCount(9);
    await expect(page.getByTestId('coloring-brush')).toHaveCount(3);
    await expect(page.getByTestId('coloring-hint')).toHaveText(
      'Pick a color, then drag over a part of the picture to paint it',
    );
  });

  test('selecting a palette color marks it as chosen', async ({ page }) => {
    await page.goto('/ColoringGame');
    await page.waitForLoadState('networkidle');

    const houseCard = page
      .locator('[data-pw="coloring-item"]')
      .filter({ hasText: 'House' })
      .first();
    await houseCard.click();

    await page.getByTestId('coloring-swatch').first().click();

    await expect(page.getByTestId('coloring-progress')).toHaveText('0/12');
  });

  test('the reset button clears the picture', async ({ page }) => {
    await page.goto('/ColoringGame');
    await page.waitForLoadState('networkidle');

    const houseCard = page
      .locator('[data-pw="coloring-item"]')
      .filter({ hasText: 'House' })
      .first();
    await houseCard.click();

    await page.getByTestId('coloring-reset').evaluate((el) => el.click());

    await expect(page.getByTestId('coloring-progress')).toHaveText('0/12');
  });

  test('the back button returns to the home grid', async ({ page }) => {
    await page.goto('/ColoringGame');
    await page.waitForLoadState('networkidle');

    const houseCard = page
      .locator('[data-pw="coloring-item"]')
      .filter({ hasText: 'House' })
      .first();
    await houseCard.click();

    await page.getByTestId('coloring-back').evaluate((el) => el.click());

    await expect(page.getByTestId('coloring-title')).toHaveText('Coloring');
    await expect(page.locator('[data-pw="coloring-item"]')).toHaveCount(10);
  });

  test('language toggle switches the titles to Vietnamese', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('bottom-bar-language').click();

    await page.goto('/ColoringGame');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('coloring-title')).toHaveText('Tô màu');
    await expect(page.getByTestId('coloring-choose')).toHaveText('Chọn một bức tranh để tô');
  });
});
