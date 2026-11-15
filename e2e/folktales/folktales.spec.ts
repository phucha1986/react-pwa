import { expect, test } from '@playwright/test';

test.describe('truyện cổ tích folktales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Folktales');
    await page.waitForLoadState('networkidle');
  });

  test('the page is a grid of story icon tiles', async ({ page }) => {
    await expect(page.getByTestId('folktales-page')).toBeVisible();
    expect(await page.locator('[data-pw^="folktales-story-"]').count()).toBe(9);
  });

  test('stories with narration show a big Play button', async ({ page }) => {
    await expect(page.getByTestId('folktales-play-bamboo')).toBeVisible();
    await expect(page.getByTestId('folktales-play-thanh-giong')).toBeVisible();
    await expect(page.getByTestId('folktales-audio-bamboo')).toHaveCount(1);
    await expect(page.getByTestId('folktales-audio-thanh-giong')).toHaveCount(1);
  });

  test('stories without narration show only the icon', async ({ page }) => {
    await expect(page.getByTestId('folktales-play-tam-cam')).toHaveCount(0);
    await expect(page.getByTestId('folktales-play-son-tinh')).toHaveCount(0);
  });

  test('the home menu has the bamboo tile that opens the folktales', async ({ page }) => {
    await page.goto('/');
    await page.getByAltText('Folktales').click();
    await expect(page.getByTestId('folktales-page')).toBeVisible();
  });

  test('no horizontal overflow on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});
