import { expect, test } from '@playwright/test';

test.describe('dế mèn comic book', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ComicBook');
    await page.waitForLoadState('networkidle');
  });

  test('the reader shows the first panel with caption and speech bubble', async ({ page }) => {
    await expect(page.getByTestId('comic-book')).toBeVisible();
    await expect(page.getByTestId('comic-panel')).toBeVisible();
    await expect(page.getByTestId('comic-caption')).toContainText('Dế Mèn');
    await expect(page.getByTestId('comic-bubble-0')).toContainText('Dế Mèn');
  });

  test('next and previous turn the pages', async ({ page }) => {
    await expect(page.getByTestId('comic-page-dot-0')).toHaveCSS(
      'background-color',
      'rgb(224, 122, 95)',
    );

    await page.getByTestId('comic-next').click();
    await expect(page.getByTestId('comic-panel')).toBeVisible();
    await expect(page.getByTestId('comic-caption')).toContainText('Cóc Ná');

    await page.getByTestId('comic-prev').click();
    await expect(page.getByTestId('comic-caption')).toContainText('Dế Mèn');
  });

  test('page dots jump straight to a page and the last page disables next', async ({ page }) => {
    await page.getByTestId('comic-page-dot-11').click();
    await expect(page.getByTestId('comic-caption')).toContainText('new cave');
    await expect(page.getByTestId('comic-next')).toBeDisabled();
    await expect(page.getByTestId('comic-prev')).toBeEnabled();
  });

  test('the welcome menu tile opens the comic book', async ({ page }) => {
    await page.goto('/');
    await page.getByAltText('Dế Mèn Comic Book').click();
    await expect(page.getByTestId('comic-book')).toBeVisible();
  });

  test('the comic follows the app language', async ({ page }) => {
    // The language toggle is rendered on the home route only, so switch there
    // and then open the comic book.
    await page.goto('/');
    await page.getByTestId('bottom-bar-language').click();
    await page.getByAltText('Truyện tranh Dế Mèn').click();

    await expect(page.getByTestId('comic-book')).toBeVisible();
    await expect(page.getByTestId('comic-caption')).toContainText('hang đất');
  });

  test('no horizontal overflow on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });

  test('every speech bubble stays inside its panel on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const clipped: number[] = [];
    for (let i = 0; i < 12; i++) {
      await page.getByTestId(`comic-page-dot-${i}`).click();
      const isClipped = await page.evaluate(() => {
        const panel = document.querySelector('[data-pw="comic-panel"]');
        const bubble = document.querySelector('[data-pw="comic-bubble-0"] div');
        if (!panel || !bubble) return true;
        const pr = panel.getBoundingClientRect();
        const br = bubble.getBoundingClientRect();
        return (
          br.top < pr.top + 4 ||
          br.bottom > pr.bottom - 4 ||
          br.left < pr.left + 4 ||
          br.right > pr.right - 4
        );
      });
      if (isClipped) clipped.push(i + 1);
    }

    expect(clipped).toEqual([]);
  });
});
