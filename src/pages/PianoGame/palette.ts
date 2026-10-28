import type { Difficulty } from '@/features/piano/types';

/**
 * PianoFlow-inspired palette: deep navy/indigo surfaces, purple + teal accents,
 * white text. Kept in one file so every piano screen shares the same look.
 */
export const NAVY = '#141a2e';
export const NAVY_CARD = '#1d2540';
export const NAVY_CARD_HOVER = '#222b4a';
export const NAVY_BORDER = '#2b3557';
export const TEXT = '#f2f5ff';
export const MUTED = '#9aa6c8';

export const PURPLE = '#6c5ce7';
export const PURPLE_DEEP = '#4834d4';
export const TEAL = '#11a5a5';
export const GOLD = '#f5b301';

/** Pill colours for the difficulty chips / badges, mirroring PianoFlow. */
export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: '#3fa66b',
  medium: '#f2720c',
  challenge: '#e5484d',
};

/** Kid-sized touch targets (>= 44px). */
export const TOUCH_TARGET = { minHeight: 48, minWidth: 48 };
