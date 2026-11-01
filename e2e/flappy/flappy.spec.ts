import { expect, test } from '@playwright/test';

test.describe('flappy bird game', () => {
  test('the game screen shows the canvas and the ready overlay', async ({ page }) => {
    await page.goto('/FlappyBird');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('flappy-canvas')).toBeVisible();
    await expect(page.getByTestId('flappy-ready-title')).toHaveText('Flappy Bird');
    await expect(page.getByTestId('flappy-ready-hint')).toHaveText('Tap or press Space to fly');
    await expect(page.getByTestId('flappy-score')).toBeHidden();
  });

  test('pressing Space starts the game', async ({ page }) => {
    await page.goto('/FlappyBird');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Space');

    await expect(page.getByTestId('flappy-ready-title')).toBeHidden();
    await expect(page.getByTestId('flappy-score')).toBeVisible();
    await expect(page.getByTestId('flappy-score')).toHaveText('0');
  });

  test('the bird falls to the ground and the game ends', async ({ page }) => {
    await page.goto('/FlappyBird');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Space');

    // Without flaps, gravity drops the bird onto the ground within a second.
    await expect(page.getByTestId('flappy-gameover')).toHaveText('Game Over', { timeout: 10000 });
    await expect(page.getByTestId('flappy-play-again')).toBeVisible();
  });

  test('play again resets to the ready screen', async ({ page }) => {
    await page.goto('/FlappyBird');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Space');

    await expect(page.getByTestId('flappy-gameover')).toHaveText('Game Over', { timeout: 10000 });

    await page.getByTestId('flappy-play-again').click();

    await expect(page.getByTestId('flappy-ready-title')).toHaveText('Flappy Bird');
    await expect(page.getByTestId('flappy-score')).toBeHidden();
  });

  test('tapping the game area flaps the bird', async ({ page }) => {
    await page.goto('/FlappyBird');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('flappy-canvas').click();

    await expect(page.getByTestId('flappy-ready-title')).toBeHidden();
    await expect(page.getByTestId('flappy-score')).toBeVisible();
  });
});
