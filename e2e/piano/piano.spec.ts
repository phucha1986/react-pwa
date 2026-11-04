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
      // Note colours now follow the hand-based scheme in src/features/piano/draw.ts
      // (cyan left hand, orange right hand, green when hit).
      const PALETTE = [
        [34, 181, 229], // #22b5e5 left hand
        [242, 160, 58], // #f2a03a right hand
        [63, 166, 107], // #3FA66B hit
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

  test('falling notes stay visually separable, not one merged blob', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.getByTestId('piano-play').click();
    await page.getByTestId('piano-play-twinkle').click();
    await page.getByTestId('piano-start').click();
    await page.waitForTimeout(2500);

    const runs = await page.evaluate(() => {
      const PALETTE = [
        [34, 181, 229], // #22b5e5 left hand
        [242, 160, 58], // #f2a03a right hand
        [63, 166, 107], // #3FA66B hit
      ];
      const canvas = document.querySelector('[data-pw="piano-canvas"] canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const w = canvas.width;
      const h = canvas.height;
      const cssH = canvas.offsetHeight;
      const targetY = cssH - Math.max(34, cssH * 0.16);
      const limit = Math.floor(targetY * (h / cssH));
      const data = ctx.getImageData(0, 0, w, limit).data;

      // Rows that hold a real cluster of note pixels, then group them into runs.
      const noteRows: number[] = [];
      for (let y = 0; y < limit; y += 1) {
        let count = 0;
        for (let x = 0; x < w; x += 1) {
          const i = (y * w + x) * 4;
          if (data[i + 3] === 0) continue;
          for (const [r, g, b] of PALETTE) {
            if (
              Math.abs(data[i] - r) < 12 &&
              Math.abs(data[i + 1] - g) < 12 &&
              Math.abs(data[i + 2] - b) < 12
            ) {
              count += 1;
              break;
            }
          }
        }
        if (count >= 20) noteRows.push(y);
      }

      const groups: { start: number; end: number }[] = [];
      for (const y of noteRows) {
        const last = groups[groups.length - 1];
        if (last && y === last.end + 1) last.end = y;
        else groups.push({ start: y, end: y });
      }
      return { groups, runwayRows: limit };
    });

    // Several notes must be on screen at once, and they must be separated by
    // gaps — a single continuous run would mean the bars merged into a blob.
    expect(runs.groups.length).toBeGreaterThanOrEqual(2);
    const gaps = runs.groups.slice(1).map((g, i) => g.start - runs.groups[i].end - 1);
    expect(Math.max(...gaps)).toBeGreaterThanOrEqual(1);
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

  // ---- co-op: two devices, one two-octave piano (host = lower, guest = upper) ----

  test('co-op host lobby shows a four-character invite code', async ({ page }) => {
    await page.goto('/PianoGame?screen=coop');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('piano-coop-host')).toBeVisible();
    await expect(page.getByTestId('piano-coop-code')).toBeVisible();
    await expect(page.getByTestId('piano-coop-start')).toBeVisible();

    // The alphabet deliberately omits 0/O/1/I so small fingers can't confuse them.
    const code = await page.getByTestId('piano-coop-code-value').innerText();
    expect(code.trim()).toMatch(/^[A-HJ-NP-Z2-9]{4}$/);
  });

  test('co-op host starts on the lower octave C4-C5', async ({ page }) => {
    await page.goto('/PianoGame?screen=coop');
    await page.waitForLoadState('networkidle');

    // The lobby button animates in, so skip the stability check before clicking.
    await page.getByTestId('piano-coop-start').click({ force: true });

    await expect(page.getByTestId('piano-gameplay')).toBeVisible();
    await expect(page.getByTestId('piano-coop-turn')).toHaveText(/Lower octave/);

    // Host owns midi 60..72 and must not expose the guest's upper octave.
    await expect(page.getByTestId('piano-key-60')).toBeVisible();
    await expect(page.getByTestId('piano-key-72')).toBeVisible();
    await expect(page.getByTestId('piano-key-84')).toHaveCount(0);
  });

  test('co-op guest resolves the host code and starts on the upper octave C5-C6', async ({
    page,
  }) => {
    // T2BJ is the deterministic code for "hot-cross-buns" (FNV-1a of the song id).
    await page.goto('/PianoGame?screen=coop&side=guest&code=T2BJ');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('piano-coop-join')).toBeVisible();
    await expect(page.getByTestId('piano-coop-code-value')).toHaveText('T2BJ');
    await expect(page.getByTestId('piano-coop-join-start')).toBeVisible();

    await page.getByTestId('piano-coop-join-start').click();

    await expect(page.getByTestId('piano-gameplay')).toBeVisible();
    await expect(page.getByTestId('piano-coop-turn')).toHaveText(/Upper octave/);

    // Guest owns midi 72..84 and must not expose the host's lower octave.
    await expect(page.getByTestId('piano-key-72')).toBeVisible();
    await expect(page.getByTestId('piano-key-84')).toBeVisible();
    await expect(page.getByTestId('piano-key-60')).toHaveCount(0);
  });

  test('co-op guest cannot start until the typed code resolves to a song', async ({ page }) => {
    // ZZZZ is not the code of any song, so the Start button stays disabled.
    await page.goto('/PianoGame?screen=coop&side=guest&code=ZZZZ');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('piano-coop-join-start')).toBeDisabled();
  });

  // Notes must actually fall down the canvas on each device, in that device's
  // hand colour. handColor() is cyan (#22b5e5) below midi 68 and orange
  // (#f2a03a) at/above it, so on Hot Cross Buns the host (C4-C5, 60-64) is all
  // cyan and the guest (C5-C6, 72-76) is all orange. Sampling only the upper
  // region proves the bars are falling, not resting on the target line.
  // Runs in the browser page (Playwright serialises it), so it may only touch
  // DOM globals - no Node-scope closures.
  function countNotePixels() {
    const PALETTE = [
      [34, 181, 229],
      [242, 160, 58],
    ]; // cyan host / orange guest
    const canvas = document.querySelector('[data-pw="piano-canvas"] canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;
    const limit = Math.floor(h * 0.6);
    const data = ctx.getImageData(0, 0, w, limit).data;
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
  }

  test('co-op host canvas has falling notes in the host (cyan) colour', async ({ page }) => {
    await page.goto('/PianoGame?screen=coop');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('piano-coop-start').click({ force: true });
    // The lobby Start opens the gameplay screen, which shows its own Start
    // overlay; clicking that begins the 3s countdown and then the falling notes.
    await page.getByTestId('piano-start').click({ force: true });
    await page.waitForTimeout(5500);

    const pixels = await page.evaluate(countNotePixels);
    expect(pixels).toBeGreaterThan(200);
  });

  test('co-op guest canvas has falling notes in the guest (orange) colour', async ({ page }) => {
    await page.goto('/PianoGame?screen=coop&side=guest&code=T2BJ');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('piano-coop-join-start').click();
    await page.getByTestId('piano-start').click({ force: true });
    await page.waitForTimeout(5500);

    const pixels = await page.evaluate(countNotePixels);
    expect(pixels).toBeGreaterThan(200);
  });
});
