import { expect, test } from '@playwright/test';

test.describe('fruit game', () => {
  test('the orchard shows the eighteen fruit tiles', async ({ page }) => {
    await page.goto('/FruitGame');
    await page.waitForLoadState('networkidle');

    const tiles = page.locator('[data-pw="fruit-tile"]');
    await expect(tiles).toHaveCount(18);
    await expect(tiles.first()).toBeVisible();
  });

  test('clicking an apple tile opens the guess page for that fruit', async ({ page }) => {
    await page.goto('/FruitGame');
    await page.waitForLoadState('networkidle');

    const appleTile = page
      .locator('[data-pw="fruit-tile"]')
      .filter({ has: page.getByRole('img', { name: 'Apple' }) })
      .first();
    await expect(appleTile).toHaveCount(1);
    await appleTile.click();

    await expect(page).toHaveURL(/\/FruitGuessPage\?fruit=Apple/);
  });

  test('guess page defaults to apple and shows 4 options', async ({ page }) => {
    await page.goto('/FruitGuessPage');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('fruit-question')).toHaveText('Which one is the Apple?');
    await expect(page.getByTestId('fruit-option')).toHaveCount(4);
    await expect(
      page.getByTestId('fruit-option').filter({ has: page.getByRole('img', { name: 'Apple' }) }),
    ).toHaveCount(1);
  });

  test('a wrong pick shakes but does not trigger success', async ({ page }) => {
    await page.goto('/FruitGuessPage');
    await page.waitForLoadState('networkidle');

    const wrong = page
      .getByTestId('fruit-option')
      .filter({ hasNot: page.getByRole('img', { name: 'Apple' }) })
      .first();
    await wrong.click();

    await expect(wrong).toHaveCSS('animation-name', 'shake');
    await expect(page.getByTestId('fruit-question')).toHaveText('Which one is the Apple?');
    await expect(page.getByTestId('fruit-confetti')).toHaveCount(0);
  });

  test('the correct pick shows success + confetti and auto-advances to the next fruit', async ({
    page,
  }) => {
    await page.goto('/FruitGuessPage');
    await page.waitForLoadState('networkidle');

    const correct = page
      .getByTestId('fruit-option')
      .filter({ has: page.getByRole('img', { name: 'Apple' }) });
    await correct.click();

    await expect(page.getByTestId('fruit-question')).toHaveText("🎉 Great Job! It's Apple!");
    await expect(page.getByTestId('fruit-confetti')).toHaveCount(60);
    await expect(correct).toHaveCSS('animation-name', 'bounce');

    // In headless browsers speechSynthesis never fires onend, so the 6s
    // fallback timer in FruitGuessPage advances to the next fruit (apple → banana).
    await expect(page).toHaveURL(/fruit=banana/, { timeout: 12000 });
  });

  test('language toggle switches the question to Vietnamese', async ({ page }) => {
    // The language toggle only renders on the home page, so switch there first;
    // the choice persists in localStorage and applies on the guess page.
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('bottom-bar-language').click();

    await page.goto('/FruitGuessPage');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('fruit-question')).toHaveText('Con nào là Táo?');
  });

  test('a correct pick disables the other three options', async ({ page }) => {
    await page.goto('/FruitGuessPage?fruit=apple');
    await page.waitForLoadState('networkidle');

    const correct = page
      .getByTestId('fruit-option')
      .filter({ has: page.getByRole('img', { name: 'Apple' }) });
    await correct.click();

    const others = page
      .getByTestId('fruit-option')
      .filter({ hasNot: page.getByRole('img', { name: 'Apple' }) });
    await expect(others).toHaveCount(3);
    await expect(others.first()).toHaveCSS('opacity', '0.4');
  });

  test('a wrong pick shakes then settles back after the timeout', async ({ page }) => {
    await page.goto('/FruitGuessPage?fruit=apple');
    await page.waitForLoadState('networkidle');

    const wrong = page
      .getByTestId('fruit-option')
      .filter({ hasNot: page.getByRole('img', { name: 'Apple' }) })
      .first();
    await wrong.click();

    await expect(wrong).toHaveCSS('animation-name', 'shake');
    await page.waitForTimeout(600);
    await expect(wrong).toHaveCSS('animation-name', 'pop-in');
  });

  test('olive is the last fruit and auto-advance wraps back to apple', async ({ page }) => {
    await page.goto('/FruitGuessPage?fruit=olive');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('fruit-question')).toHaveText('Which one is the Olive?');

    const correct = page
      .getByTestId('fruit-option')
      .filter({ has: page.getByRole('img', { name: 'Olive' }) });
    await correct.click();

    await expect(page.getByTestId('fruit-question')).toHaveText("🎉 Great Job! It's Olive!");
    await expect(page).toHaveURL(/fruit=apple/, { timeout: 12000 });
  });

  test('an unknown fruit falls back to the default apple', async ({ page }) => {
    await page.goto('/FruitGuessPage?fruit=unicorn');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('fruit-question')).toHaveText('Which one is the Apple?');
    await expect(page.getByTestId('fruit-option')).toHaveCount(4);
  });

  test('a fruit name resolves case-insensitively to its key', async ({ page }) => {
    await page.goto('/FruitGuessPage?fruit=BANANA');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('fruit-question')).toHaveText('Which one is the Banana?');
  });
});
