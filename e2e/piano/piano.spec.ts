import { expect, test } from '@playwright/test';

test.describe('piano learning game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/PianoGame');
    await page.waitForLoadState('networkidle');
  });

  test('home screen shows play, settings and progress', async ({ page }) => {
    await expect(page.getByTestId('piano-home')).toBeVisible();
    await expect(page.getByTestId('piano-play')).toBeVisible();
    await expect(page.getByTestId('piano-settings')).toBeVisible();
    await expect(page.getByTestId('piano-progress')).toBeVisible();
  });

  test('main menu link lands straight on the song selector', async ({ page }) => {
    await page.goto('/?screen=songs');
    await page.getByAltText('Piano Learning Game').click();

    await expect(page.getByTestId('piano-song-selection')).toBeVisible();
    await expect(page.getByTestId(/^piano-song-card-/)).toHaveCount(8);
  });

  test('play opens the song list with 8 public-domain songs', async ({ page }) => {
    await page.getByTestId('piano-play').click();

    await expect(page.getByTestId('piano-song-selection')).toBeVisible();
    await expect(page.getByTestId(/^piano-song-card-/)).toHaveCount(8);
  });

  test('difficulty chips filter the song list', async ({ page }) => {
    await page.getByTestId('piano-play').click();

    await expect(page.getByTestId(/^piano-song-card-/)).toHaveCount(8);

    await page.getByTestId('piano-filter-medium').click();
    await expect(page.getByTestId(/^piano-song-card-/)).toHaveCount(2);

    await page.getByTestId('piano-filter-all').click();
    await expect(page.getByTestId(/^piano-song-card-/)).toHaveCount(8);
  });

  test('choosing a song opens gameplay with canvas + keyboard', async ({ page }) => {
    await page.getByTestId('piano-play').click();
    await page.getByTestId('piano-play-twinkle').click();

    await expect(page.getByTestId('piano-gameplay')).toBeVisible();
    await expect(page.getByTestId('piano-canvas')).toBeVisible();
    await expect(page.getByTestId('piano-keyboard')).toBeVisible();
    await expect(page.getByTestId('piano-start')).toBeVisible();
  });

  test('starting the game and tapping the right key scores a correct note', async ({ page }) => {
    await page.getByTestId('piano-play').click();
    await page.getByTestId('piano-play-twinkle').click();

    // First Twinkle note is C4 (60) at beat 2, 100 bpm -> ~1.2s after start.
    await page.getByTestId('piano-start').click();
    await page.waitForTimeout(1200);
    await page.getByTestId('piano-key-60').evaluate((el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });

    await expect(page.getByTestId('piano-score')).toContainText('1');
  });

  test('pause freezes the game and resume continues it', async ({ page }) => {
    await page.getByTestId('piano-play').click();
    await page.getByTestId('piano-play-twinkle').click();
    await page.getByTestId('piano-start').click();

    await page.getByTestId('piano-pause').click();
    await expect(page.getByTestId('piano-paused-overlay')).toBeVisible();

    await page.getByTestId('piano-resume').click();
    await expect(page.getByTestId('piano-paused-overlay')).toBeHidden();
  });

  test('settings changes persist across reloads', async ({ page }) => {
    await page.getByTestId('piano-settings').click();

    await page.getByTestId('piano-mute').click();
    await page.getByTestId('piano-show-note-names').click();

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('piano-settings').click();
    // MUI Switch puts data-pw on the switch wrapper span, so assert the checked class.
    await expect(page.getByTestId('piano-mute')).toHaveClass(/Mui-checked/);
    await expect(page.getByTestId('piano-show-note-names')).not.toHaveClass(/Mui-checked/);
  });

  test('progress screen reflects a completed run stored in localStorage', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem(
        'piano-progress',
        JSON.stringify({
          twinkle: { stars: 3, bestAccuracy: 0.95, completions: 1, lastPlayedAt: 1 },
        }),
      );
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('piano-progress').click();
    await expect(page.getByTestId('piano-progress')).toBeVisible();
    await expect(page.getByTestId('piano-progress-row-twinkle')).toContainText('95%');
  });

  test('canvas renders falling notes after start', async ({ page }) => {
    await page.getByTestId('piano-play').click();
    await page.getByTestId('piano-play-twinkle').click();
    await page.getByTestId('piano-start').click();
    await page.waitForTimeout(2500);

    const notePixels = await page.evaluate(() => {
      // One colour per pitch class, matching PALETTE in src/features/piano/draw.ts.
      const PALETTE = [
        [229, 72, 77],
        [242, 114, 12],
        [245, 197, 24],
        [63, 166, 107],
        [47, 128, 237],
        [142, 68, 173],
        [17, 165, 165],
        [101, 163, 11],
        [214, 64, 158],
        [201, 123, 16],
        [62, 99, 221],
        [124, 92, 219],
      ];
      const canvas = document.querySelector('[data-pw="piano-canvas"] canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const h = canvas.height;
      const w = canvas.width;
      // Only sample the upper region so the target line / glow band cannot
      // satisfy the assertion on its own — notes fall through this area.
      const limit = Math.floor(h * 0.6);
      let count = 0;
      for (let y = 0; y < limit; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const i = (y * w + x) * 4;
          if (data[i + 3] === 0) continue;
          for (const [r, g, b] of PALETTE) {
            if (
              Math.abs(data[i] - r) < 24 &&
              Math.abs(data[i + 1] - g) < 24 &&
              Math.abs(data[i + 2] - b) < 24
            ) {
              count += 1;
              break;
            }
          }
        }
      }
      return count;
    });

    // At least one falling note must be drawn in the upper part of the canvas.
    expect(notePixels).toBeGreaterThan(200);
  });

  test('mobile viewport has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.getByTestId('piano-play').click();
    await page.getByTestId('piano-play-twinkle').click();
    await page.getByTestId('piano-start').click();

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
