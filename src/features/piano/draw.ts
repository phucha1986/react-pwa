import { type KeyLayout, laneInfo } from './keyboard';
import { noteLetter } from './midi';
import { type CanvasLayout, noteHeight, noteY } from './positions';
import type { Difficulty, Settings, TrackedNote } from './types';

/** One colour per pitch class (C..B) so a note always looks the same. */
const PALETTE = [
  '#E5484D', // C
  '#F2720C', // C#
  '#F5C518', // D
  '#3FA66B', // D#
  '#2F80ED', // E
  '#8E44AD', // F
  '#11A5A5', // F#
  '#65A30B', // G
  '#D6409E', // G#
  '#C97B10', // A
  '#3E63DD', // A#
  '#7C5CDB', // B
];

export interface DrawOptions {
  tracked: TrackedNote[];
  layout: CanvasLayout;
  keyLayout: KeyLayout;
  settings: Settings;
  difficulty: Difficulty;
  secondsPerBeat: number;
  elapsedSeconds: number;
  pressedMidi: number | null;
  keyWidth: number;
}

/**
 * Draw one frame. Pure function (no React, no DOM assumptions beyond the
 * 2D context) so it can be exercised from tests.
 */
export function drawScene(ctx: CanvasRenderingContext2D, opts: DrawOptions): void {
  const { layout, settings, difficulty, elapsedSeconds, tracked, keyWidth } = opts;

  ctx.clearRect(0, 0, layout.width, layout.height);

  // Background
  ctx.fillStyle = settings.animations ? '#F7F8FB' : '#FFFFFF';
  ctx.fillRect(0, 0, layout.width, layout.height);

  // Lane guides so a child can see which key each column belongs to.
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i < opts.keyLayout.whiteCount; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * keyWidth, 0);
    ctx.lineTo(i * keyWidth, layout.height);
    ctx.stroke();
  }

  // Target line — where a note should be when the key is pressed.
  ctx.strokeStyle = '#3E63DD';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, layout.targetY);
  ctx.lineTo(layout.width, layout.targetY);
  ctx.stroke();

  if (settings.animations) {
    ctx.fillStyle = 'rgba(62,99,221,0.12)';
    ctx.fillRect(0, layout.targetY - 10, layout.width, 20);
  }

  for (const item of tracked) {
    const { whiteIndex, blackRatio } = laneInfo(opts.keyLayout, item.note.midi);
    const cx = whiteIndex * keyWidth + (blackRatio === null ? keyWidth / 2 : keyWidth * blackRatio);
    const h = noteHeight(item.note, layout);
    const bottom = noteY(item.note, elapsedSeconds, layout, difficulty, opts.secondsPerBeat);
    const top = bottom - h;

    if (bottom < 0 || top > layout.height) continue;

    const color = PALETTE[((item.note.midi % 12) + 12) % 12];
    const radius = Math.min(keyWidth / 2 - 4, h / 2);

    ctx.globalAlpha = item.status === 'missed' ? 0.35 : 1;
    ctx.fillStyle = item.status === 'hit' ? '#3FA66B' : color;

    roundRect(ctx, cx - (keyWidth / 2 - 4), top, keyWidth - 8, h, radius);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (settings.showNoteNames) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.min(16, h)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(noteLetter(item.note.midi), cx, top + h / 2);
    }

    if (item.status === 'hit' && settings.animations) {
      ctx.strokeStyle = '#3FA66B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, layout.targetY, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Highlight the key currently being pressed.
  if (opts.pressedMidi !== null) {
    const { whiteIndex, blackRatio } = laneInfo(opts.keyLayout, opts.pressedMidi);
    const cx = whiteIndex * keyWidth + (blackRatio === null ? keyWidth / 2 : keyWidth * blackRatio);
    ctx.fillStyle = 'rgba(62,99,221,0.25)';
    ctx.fillRect(cx - keyWidth / 2, layout.targetY, keyWidth, layout.height - layout.targetY);
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
