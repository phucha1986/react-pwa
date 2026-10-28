import { expect, test } from '@playwright/test';

test.describe('animal game', () => {
  test('welcome tile opens the animal game with 30 animals', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByText('Animals').click();

    await expect(page).toHaveURL(/\/AnimalGame/);
    await expect(page.getByRole('img')).toHaveCount(30);
    await expect(page.getByRole('img', { name: 'Lion' })).toBeVisible();
  });

  test('clicking an animal tile opens the guess page for that animal', async ({ page }) => {
    await page.goto('/AnimalGame');
    await page.waitForLoadState('networkidle');

    await page.getByRole('img', { name: 'Tiger' }).click();

    await expect(page).toHaveURL('/AnimalGuessPage?animal=Tiger');
    await expect(page.getByTestId('question')).toHaveText('Which one is the Tiger?');
  });

  test('guess page defaults to lion and shows 4 options in a 2x2 grid', async ({ page }) => {
    await page.goto('/AnimalGuessPage');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('question')).toHaveText('Which one is the Lion?');
    await expect(page.getByTestId('option')).toHaveCount(4);
    await expect(
      page.getByTestId('option').filter({ has: page.getByRole('img', { name: 'Lion' }) }),
    ).toHaveCount(1);
  });

  test('a wrong pick shakes but does not trigger success', async ({ page }) => {
    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');

    const wrong = page
      .getByTestId('option')
      .filter({ hasNot: page.getByRole('img', { name: 'Lion' }) })
      .first();
    await wrong.click();

    await expect(wrong).toHaveCSS('animation-name', 'shake');
    await expect(page.getByTestId('question')).toHaveText('Which one is the Lion?');
    await expect(page.getByTestId('confetti')).toHaveCount(0);
    await expect(page).toHaveURL(/animal=lion/);
  });

  test('the correct pick shows success + confetti and auto-advances to the next animal', async ({
    page,
  }) => {
    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');

    const correct = page
      .getByTestId('option')
      .filter({ has: page.getByRole('img', { name: 'Lion' }) });
    await correct.click();

    await expect(page.getByTestId('question')).toHaveText("🎉 Great Job! It's Lion!");
    await expect(page.getByTestId('confetti')).toHaveCount(60);
    await expect(correct).toHaveCSS('animation-name', 'bounce');

    // In headless browsers speechSynthesis never fires onend, so the 6s
    // fallback timer in AnimalGuessPage advances to the next animal (lion → elephant).
    await expect(page).toHaveURL(/animal=elephant/, { timeout: 12000 });
  });

  test('language toggle switches the question to Vietnamese', async ({ page }) => {
    // The language toggle only renders on the home page, so switch there first;
    // the choice persists in localStorage and applies on the guess page.
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('bottom-bar-language').click();

    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('question')).toHaveText('Con nào là Sư tử?');
  });

  test('back button returns from the guess page to the animal grid', async ({ page }) => {
    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('bottom-bar-back').click();

    await expect(page).toHaveURL('/AnimalGame');
  });
});
