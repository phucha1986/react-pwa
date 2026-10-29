import { describe, expect, test } from 'vitest';

import { COMIC_PAGES, pageText } from './story';

describe('comic story', () => {
  test('the book has 12 pages', () => {
    expect(COMIC_PAGES).toHaveLength(12);
  });

  test('every page has a caption and at least one bubble in both languages', () => {
    for (const page of COMIC_PAGES) {
      expect(page.caption.en.length).toBeGreaterThan(0);
      expect(page.caption.vi.length).toBeGreaterThan(0);
      expect(page.bubbles.length).toBeGreaterThan(0);
      for (const bubble of page.bubbles) {
        expect(bubble.en.length).toBeGreaterThan(0);
        expect(bubble.vi.length).toBeGreaterThan(0);
        expect(bubble.x).toBeGreaterThan(0);
        expect(bubble.y).toBeGreaterThan(0);
      }
    }
  });

  test('page ids are unique', () => {
    const ids = new Set(COMIC_PAGES.map((p) => p.id));
    expect(ids.size).toBe(COMIC_PAGES.length);
  });

  test('pageText joins the caption and the dialogue for the chosen language', () => {
    const page = COMIC_PAGES[0];
    const text = pageText(page, 'en');
    expect(text.startsWith(page.caption.en)).toBe(true);
    expect(text).toContain(`${page.bubbles[0].who}: ${page.bubbles[0].en}`);
  });
});
