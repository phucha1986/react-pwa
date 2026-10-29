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

  test('landscape stage splits into a notes half on top and a controls half below', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 812, height: 375 });
    await page.getByTestId('piano-play').click();
    await page.getByTestId('piano-play-twinkle').click();

    const boxes = await page.evaluate(() => {
      const rect = (sel: string) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { y: r.y, bottom: r.bottom, height: r.height };
      };
      return {
        stage: rect('[data-pw="piano-stage"]'),
        notes: rect('[data-pw="piano-notes-half"]'),
        controls: rect('[data-pw="piano-controls-half"]'),
        keyboard: rect('[data-pw="piano-keyboard"]'),
      };
    });

    expect(boxes.stage).not.toBeNull();
    expect(boxes.notes).not.toBeNull();
    expect(boxes.controls).not.toBeNull();
    expect(boxes.keyboard).not.toBeNull();

    // The two halves share the stage roughly evenly.
    expect(boxes.notes!.height).toBeGreaterThanOrEqual(boxes.stage!.height * 0.4);
    expect(boxes.controls!.height).toBeGreaterThanOrEqual(boxes.stage!.height * 0.4);

    // Falling notes sit above the buttons and the keys.
    expect(boxes.notes!.bottom).toBeLessThanOrEqual(boxes.controls!.y + 1);

    // The key bed keeps a kid-sized height and stays inside the stage.
    expect(boxes.keyboard!.height).toBeGreaterThanOrEqual(40);
    expect(boxes.keyboard!.bottom).toBeLessThanOrEqual(boxes.stage!.bottom + 1);
  });

  test('portrait phones render the game rotated so the layout stays landscape', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.getByTestId('piano-play').click();
    await page.getByTestId('piano-play-twinkle').click();

    const state = await page.evaluate(() => {
      const stage = document.querySelector('[data-pw="piano-stage"]');
      const inner = document.querySelector('[data-pw="piano-landscape"]');
      const notes = document.querySelector('[data-pw="piano-notes-half"]');
      const controls = document.querySelector('[data-pw="piano-controls-half"]');
      return {
        rotated: getComputedStyle(inner).transform !== 'none',
        // In the game's own coordinate space the halves are landscape strips:
        // wide (the screen's long edge) rather than tall.
        notesIsLandscapeStrip: notes.offsetWidth > notes.offsetHeight,
        controlsIsLandscapeStrip: controls.offsetWidth > controls.offsetHeight,
        stageFitsViewport: stage.getBoundingClientRect().bottom <= window.innerHeight + 1,
      };
    });

    expect(state.rotated).toBe(true);
    expect(state.notesIsLandscapeStrip).toBe(true);
    expect(state.controlsIsLandscapeStrip).toBe(true);
    expect(state.stageFitsViewport).toBe(true);
  });

  test('no game button is clipped by the stage on a portrait phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // A fast tempo makes the song finish quickly so the results card is on screen.
    await page.evaluate(() => {
      localStorage.setItem('piano-settings', JSON.stringify({ tempoFactor: 10, muted: true }));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('piano-play').click();
    await page.getByTestId('piano-play-twinkle').click();
    await page.getByTestId('piano-start').click();

    await expect(page.getByTestId('piano-results')).toBeVisible({ timeout: 15000 });

    const clipped = await page.evaluate(() => {
      const stage = document.querySelector('[data-pw="piano-stage"]');
      const sr = stage.getBoundingClientRect();
      const offenders: string[] = [];
      // Only elements that belong to the game itself; the BottomBar sits outside
      // the stage and is not expected to be inside it.
      for (const el of stage.querySelectorAll('[data-pw]')) {
        if (el.getAttribute('data-pw') === 'piano-stage') continue;
        if (el.tagName !== 'BUTTON' && el.getAttribute('data-pw') !== 'piano-keyboard') continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        if (
          r.left < sr.left - 1 ||
          r.right > sr.right + 1 ||
          r.top < sr.top - 1 ||
          r.bottom > sr.bottom + 1
        ) {
          offenders.push(el.getAttribute('data-pw') ?? 'unknown');
        }
      }
      return offenders;
    });

    expect(clipped).toEqual([]);

    // The bottom half must not overflow its own box either.
    const overflow = await page.evaluate(() => {
      const half = document.querySelector('[data-pw="piano-controls-half"]');
      return half.scrollHeight - half.offsetHeight;
    });
    expect(overflow).toBeLessThanOrEqual(1);

    // The notes half yields height to the buttons when the results card is shown.
    // Measured in the game's own coordinate space (offsetHeight is rotation-safe),
    // the two halves plus their gap must still fit inside the stage.
    const fit = await page.evaluate(() => {
      const stage = document.querySelector('[data-pw="piano-stage"]');
      const notes = document.querySelector('[data-pw="piano-notes-half"]');
      const controls = document.querySelector('[data-pw="piano-controls-half"]');
      return {
        stage: stage.offsetHeight,
        used: notes.offsetHeight + controls.offsetHeight + 8,
      };
    });
    expect(fit.used).toBeLessThanOrEqual(fit.stage + 1);
  });
});
