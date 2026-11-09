import { type Page, expect, test } from '@playwright/test';

test.describe('animal game', () => {
  test('welcome tile opens the guess page directly, skipping the animal list', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByText('Animals').click();

    // No 30-animal picker grid: the game starts straight on the guess board.
    await expect(page).toHaveURL(/\/AnimalGuessPage/);
    await expect(page.getByTestId('question')).toHaveAccessibleName('Lion');
    await expect(page.getByTestId('option')).toHaveCount(4);
  });

  test('clicking an animal tile opens the guess page for that animal', async ({ page }) => {
    await page.goto('/AnimalGame');
    await page.waitForLoadState('networkidle');

    await page.getByRole('img', { name: 'Tiger' }).click();

    await expect(page).toHaveURL('/AnimalGuessPage?animal=Tiger');
    // The prompt is now the target animal's picture, not the question text.
    await expect(page.getByTestId('question')).toHaveAccessibleName('Tiger');
  });

  test('guess page defaults to lion and shows exactly 1 lion among 4 options', async ({ page }) => {
    await page.goto('/AnimalGuessPage');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('question')).toHaveAccessibleName('Lion');
    await expect(page.getByTestId('option')).toHaveCount(4);
    // On the 4-tile board only one target is hidden — the kid finds a single animal.
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
    await expect(page.getByTestId('question')).toHaveAccessibleName('Lion');
    await expect(page.getByTestId('confetti')).toHaveCount(0);
    await expect(page).toHaveURL(/animal=lion/);
  });

  test('the single correct pick marks the tile found and completes the round', async ({ page }) => {
    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');

    const correct = page
      .getByTestId('option')
      .filter({ has: page.getByRole('img', { name: 'Lion' }) });
    await correct.first().click();

    // Mirrors the Number game: the answered tile is visually distinct (check
    // badge + green rim) and the round is done, so success + confetti appear.
    await expect(page.getByTestId('option-check')).toHaveCount(1);
    await expect(
      page.getByTestId('option').filter({ has: page.getByTestId('option-check') }),
    ).toHaveCount(1);
    await expect(page.getByTestId('question')).toHaveText("🎉 Great Job! It's Lion!");
    await expect(page.getByTestId('confetti')).toHaveCount(60);
    await expect(correct.first()).toHaveCSS('animation-name', 'bounce');
  });

  test('after the round completes the game auto-advances to the next animal', async ({ page }) => {
    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');

    const correct = page
      .getByTestId('option')
      .filter({ has: page.getByRole('img', { name: 'Lion' }) });
    await correct.first().click();

    // In headless browsers speechSynthesis never fires onend, so the 6s
    // fallback timer in AnimalGuessPage advances to the next animal (lion -> elephant).
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

    await expect(page.getByTestId('question')).toHaveAccessibleName('Sư tử');
  });

  test('back button returns from the guess page to the home menu', async ({ page }) => {
    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('bottom-bar-back').click();

    await expect(page).toHaveURL('/');
  });

  test('completing the round disables the untouched options', async ({ page }) => {
    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');

    const correct = page
      .getByTestId('option')
      .filter({ has: page.getByRole('img', { name: 'Lion' }) });
    await correct.first().click();

    const others = page
      .getByTestId('option')
      .filter({ hasNot: page.getByRole('img', { name: 'Lion' }) });
    await expect(others).toHaveCount(3);
    await expect(others.first()).toHaveCSS('opacity', '0.4');
  });

  test('a wrong pick shakes then settles back after the timeout', async ({ page }) => {
    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');

    const wrong = page
      .getByTestId('option')
      .filter({ hasNot: page.getByRole('img', { name: 'Lion' }) })
      .first();
    await wrong.click();

    await expect(wrong).toHaveCSS('animation-name', 'shake');
    await page.waitForTimeout(600);
    await expect(wrong).toHaveCSS('animation-name', 'pop-in');
  });

  test('reindeer is the last animal and auto-advance wraps back to lion', async ({ page }) => {
    await page.goto('/AnimalGuessPage?animal=reindeer');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('question')).toHaveAccessibleName('Reindeer');

    const correct = page
      .getByTestId('option')
      .filter({ has: page.getByRole('img', { name: 'Reindeer' }) });
    await correct.first().click();

    await expect(page.getByTestId('question')).toHaveText("🎉 Great Job! It's Reindeer!");
    await expect(page).toHaveURL(/animal=lion/, { timeout: 12000 });
  });

  test('an unknown animal falls back to the raw key', async ({ page }) => {
    await page.goto('/AnimalGuessPage?animal=unicorn');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('question')).toHaveText('Find the unicorn — there is 1');
    await expect(page.getByTestId('option')).toHaveCount(4);
  });

  // The tiles are laid out in slot order, so two copies of the same animal
  // must never land in neighbouring cells (same row side by side, or stacked
  // in the same column).
  const assertNoAdjacentDuplicates = async (page: Page) => {
    const cols = await page.$eval(
      '[data-pw="stage-grid"]',
      (el) => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length,
    );
    const names = await page.$$eval('[data-pw="option"] img', (els) => els.map((e) => e.alt));
    for (let a = 0; a < names.length; a++) {
      for (let b = a + 1; b < names.length; b++) {
        if (names[a] !== names[b]) continue;
        const ra = Math.floor(a / cols);
        const rb = Math.floor(b / cols);
        const ca = a % cols;
        const cb = b % cols;
        const adjacent =
          (ra === rb && Math.abs(ca - cb) === 1) || (ca === cb && Math.abs(ra - rb) === 1);
        expect(adjacent, `duplicate "${names[a]}" at slots ${a} and ${b}`).toBe(false);
      }
    }
  };

  // After a round is completed, the page shows the "Great Job" line (which has
  // no alt) until it auto-advances. Waiting for a question image whose alt
  // differs from the round we just cleared is the only deterministic signal
  // that the *next* round is on screen — a URL check passes too early, because
  // the URL is already non-lion from the previous transition.
  const waitForNextRound = async (page: Page, prevTarget: string) => {
    await page.waitForFunction(
      (prev) => {
        const el = document.querySelector('[data-pw="question"][alt]');
        return !!el && el.alt !== prev;
      },
      prevTarget,
      { timeout: 12000 },
    );
    await page.waitForSelector('[data-pw="option"]');
  };

  test('duplicate copies of the target are never next to each other', async ({ page }) => {
    // Several rounds with the 6s speech fallback each, so give it a big budget.
    test.setTimeout(90000);
    // 3x2 board with 2 copies (score >= 5 gives level 1; use a fresh page and
    // reach it by clearing rounds).
    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');
    await assertNoAdjacentDuplicates(page);

    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[data-pw="question"][alt]');
      const target = await page.getAttribute('[data-pw="question"]', 'alt');
      const correct = page
        .getByTestId('option')
        .filter({ has: page.getByRole('img', { name: target! }) });
      const matches = await correct.count();
      for (let k = 0; k < matches; k++) await correct.nth(k).click();
      await waitForNextRound(page, target!);
    }

    // Now on the 3x2 board with 2 copies, then the 3x3 board with 3 copies.
    await expect(page.getByTestId('option')).toHaveCount(6);
    await assertNoAdjacentDuplicates(page);

    await page.waitForSelector('[data-pw="question"][alt]');
    const target = await page.getAttribute('[data-pw="question"]', 'alt');
    const correct = page
      .getByTestId('option')
      .filter({ has: page.getByRole('img', { name: target! }) });
    for (let k = 0; k < (await correct.count()); k++) await correct.nth(k).click();
    await waitForNextRound(page, target!);
    await expect(page.getByTestId('option')).toHaveCount(6);
    await assertNoAdjacentDuplicates(page);

    await page.waitForSelector('[data-pw="question"][alt]');
    const target2 = await page.getAttribute('[data-pw="question"]', 'alt');
    const correct2 = page
      .getByTestId('option')
      .filter({ has: page.getByRole('img', { name: target2! }) });
    for (let k = 0; k < (await correct2.count()); k++) await correct2.nth(k).click();
    await waitForNextRound(page, target2!);
    // Score is 9 (5 + 2 + 2) — level 2 needs 10 finds, so the board is still
    // 3x2. One more round pushes the score past the threshold.
    await expect(page.getByTestId('option')).toHaveCount(6);
    await assertNoAdjacentDuplicates(page);

    await page.waitForSelector('[data-pw="question"][alt]');
    const target3 = await page.getAttribute('[data-pw="question"]', 'alt');
    const correct3 = page
      .getByTestId('option')
      .filter({ has: page.getByRole('img', { name: target3! }) });
    for (let k = 0; k < (await correct3.count()); k++) await correct3.nth(k).click();
    await waitForNextRound(page, target3!);
    await expect(page.getByTestId('option')).toHaveCount(9);
    await assertNoAdjacentDuplicates(page);
  });

  // Mirrors the Number game's difficulty ladder: the board grows as the kid
  // scores (2x2 -> 3x2 -> 3x3, every 5 finds), with more copies on bigger
  // boards. Each round ends with a spoken "Great job" then auto-advances, so
  // this test needs a longer budget than the default 30s timeout.
  test('board grows with score like the number game ladder', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/AnimalGuessPage?animal=lion');
    await page.waitForLoadState('networkidle');

    const clearRound = async () => {
      // The prompt is the target picture (an img with alt); the success line
      // shares data-pw="question" but has no alt, so wait for the img.
      await page.waitForSelector('[data-pw="question"][alt]');
      const target = await page.getAttribute('[data-pw="question"]', 'alt');
      const correct = page
        .getByTestId('option')
        .filter({ has: page.getByRole('img', { name: target! }) });
      const matches = await correct.count();
      for (let i = 0; i < matches; i++) await correct.nth(i).click();
      await waitForNextRound(page, target!);
    };

    // Rounds 1-5 stay on the 2x2 board with a single target (score < 5).
    await expect(page.getByTestId('option')).toHaveCount(4);
    await clearRound();
    await expect(page.getByTestId('option')).toHaveCount(4);
    await clearRound();
    await expect(page.getByTestId('option')).toHaveCount(4);
    await clearRound();
    await expect(page.getByTestId('option')).toHaveCount(4);
    await clearRound();
    await expect(page.getByTestId('option')).toHaveCount(4);
    await clearRound();

    // Score is now 5 -> level 1: a 3x2 board with 6 tiles and 2 copies.
    await expect(page.getByTestId('option')).toHaveCount(6);
    await page.waitForSelector('[data-pw="question"][alt]');
    const sixTarget = await page.getAttribute('[data-pw="question"]', 'alt');
    await expect(
      page.getByTestId('option').filter({ has: page.getByRole('img', { name: sixTarget! }) }),
    ).toHaveCount(2);
    await clearRound();

    // Score is now 7 -> still level 1.
    await expect(page.getByTestId('option')).toHaveCount(6);
    await clearRound();

    // Score is now 9 -> still level 1 (level 2 needs 10 finds).
    await expect(page.getByTestId('option')).toHaveCount(6);
    await clearRound();

    // Score is now 11 -> level 2: a 3x3 board with 9 tiles and 3 copies.
    await expect(page.getByTestId('option')).toHaveCount(9);
    await page.waitForSelector('[data-pw="question"][alt]');
    const target = await page.getAttribute('[data-pw="question"]', 'alt');
    await expect(
      page.getByTestId('option').filter({ has: page.getByRole('img', { name: target! }) }),
    ).toHaveCount(3);
  });
});
