import { expect, test } from '@playwright/test';

test.describe('find-the-number game', () => {
  test('the board shows 4 tiles and a single target digit', async ({ page }) => {
    await page.goto('/NumberGame');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('number-target')).toBeVisible();
    await expect(page.locator('[data-pw="number-tile"]')).toHaveCount(4);
    await expect(page.locator('[data-pw="number-tile-value"]')).toHaveCount(4);

    const target = (await page.getByTestId('number-target-value').textContent()).trim();
    expect(target).toMatch(/^[0-3]$/);
  });

  test('the target appears more than once on the board', async ({ page }) => {
    await page.goto('/NumberGame');
    await page.waitForLoadState('networkidle');

    const target = (await page.getByTestId('number-target-value').textContent()).trim();
    const values = (await page.locator('[data-pw="number-tile-value"]').all()).map((el) => el.textContent().trim());

    // Every board has at least two rows, so there is always more than one match.
    expect(values.filter((v) => v === target).length).toBeGreaterThan(1);
  });

  test('the non-target numbers are all distinct', async ({ page }) => {
    await page.goto('/NumberGame');
    await page.waitForLoadState('networkidle');

    const target = (await page.getByTestId('number-target-value').textContent()).trim();
    const values = (await page.locator('[data-pw="number-tile-value"]').all()).map((el) => el.textContent().trim());
    const distractors = values.filter((v) => v !== target);

    // Only the target repeats; distractors never duplicate.
    expect(new Set(distractors).size).toBe(distractors.length);
  });

  test('tapping a wrong tile does not advance the round', async ({ page }) => {
    await page.goto('/NumberGame');
    await page.waitForLoadState('networkidle');

    const target = (await page.getByTestId('number-target-value').textContent()).trim();
    const values = (await page.locator('[data-pw="number-tile-value"]').all()).map((el) => el.textContent().trim());

    const wrongIndex = values.findIndex((v) => v !== target);
    await page.locator('[data-pw="number-tile"]').nth(wrongIndex).click();

    // A mis-tap must not regenerate the board: the target stays put.
    await expect(page.getByTestId('number-target-value')).toHaveText(target);
    await expect(page.locator('[data-pw="number-tile"]')).toHaveCount(4);
  });

  test('a correctly tapped tile is marked as found and stays distinct', async ({ page }) => {
    await page.goto('/NumberGame');
    await page.waitForLoadState('networkidle');

    const target = (await page.getByTestId('number-target-value').textContent()).trim();
    const values = (await page.locator('[data-pw="number-tile-value"]').all()).map((el) => el.textContent().trim());
    const correctIndexes = values.map((v, i) => (v === target ? i : -1)).filter((i) => i >= 0);

    await page.locator('[data-pw="number-tile"]').nth(correctIndexes[0]).click();

    // The tapped tile gets a found marker and a check badge; the untouched
    // copy of the same number stays plain, so the kid can see what is left.
    await expect(page.locator('[data-pw="number-tile"][data-found="true"]')).toHaveCount(1);
    await expect(page.locator('[data-pw="number-tile-check"]')).toHaveCount(1);
    await expect(page.locator('[data-pw="number-tile"][data-found="false"]')).toHaveCount(values.length - 1);
  });

  test('tapping one correct tile keeps the board until all matches are found', async ({ page }) => {
    await page.goto('/NumberGame');
    await page.waitForLoadState('networkidle');

    const target = (await page.getByTestId('number-target-value').textContent()).trim();
    const values = (await page.locator('[data-pw="number-tile-value"]').all()).map((el) => el.textContent().trim());
    const before = values.join('');
    const correctIndexes = values.map((v, i) => (v === target ? i : -1)).filter((i) => i >= 0);

    // A single find must not regenerate the board — the other copies remain.
    await page.locator('[data-pw="number-tile"]').nth(correctIndexes[0]).click();
    await expect(page.getByTestId('number-target-value')).toHaveText(target);
    await expect(page.locator('[data-pw="number-tile-value"]')).toHaveCount(values.length);
    const still = (await page.locator('[data-pw="number-tile-value"]').all()).map((el) => el.textContent().trim()).join('');
    expect(still).toBe(before);

    // Finding every copy schedules a fresh board with a different target.
    for (const i of correctIndexes.slice(1)) {
      await page.locator('[data-pw="number-tile"]').nth(i).click();
    }
    await expect(page.getByTestId('number-target-value')).notToHaveText(target, { timeout: 5000 });

    const after = (await page.locator('[data-pw="number-tile-value"]').all()).map((el) => el.textContent().trim()).join('');
    expect(after).not.toBe(before);
  });

  test('the new board is valid too', async ({ page }) => {
    await page.goto('/NumberGame');
    await page.waitForLoadState('networkidle');

    const target = (await page.getByTestId('number-target-value').textContent()).trim();
    const values = (await page.locator('[data-pw="number-tile-value"]').all()).map((el) => el.textContent().trim());
    const correctIndexes = values.map((v, i) => (v === target ? i : -1)).filter((i) => i >= 0);
    for (const i of correctIndexes) {
      await page.locator('[data-pw="number-tile"]').nth(i).click();
    }

    await expect(page.locator('[data-pw="number-tile"]')).toHaveCount(4);
    const nextTarget = (await page.getByTestId('number-target-value').textContent()).trim();
    const nextValues = (await page.locator('[data-pw="number-tile-value"]').all()).map((el) => el.textContent().trim());
    expect(nextValues.filter((v) => v === nextTarget).length).toBeGreaterThan(1);
  });
});
