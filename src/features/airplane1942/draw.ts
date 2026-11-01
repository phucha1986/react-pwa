import { ENEMY_SPECS, H, W } from './engine';
import type { GameState } from './types';

/** One colour per enemy archetype, echoing the arcade sprites. */
const ENEMY_COLORS: Record<string, string> = {
  zerosep: '#FF6B6B',
  hongou: '#FFD93D',
  bandit: '#B197FC',
};

const PLAYER_COLOR = '#6BCB77';

/** Scroll the sky at a constant arcade pace. */
export function drawScene(ctx: CanvasRenderingContext2D, s: GameState, cloudOffset: number): void {
  ctx.clearRect(0, 0, W, H);

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#141a2e');
  sky.addColorStop(1, '#1d2540');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Parallax clouds drifting downward, the way a scrolling shooter feels.
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  const shift = cloudOffset % (H + 200);
  for (const [cx, cy, cr] of [
    [70, 120, 26],
    [210, 260, 32],
    [330, 420, 22],
    [150, 520, 28],
  ] as const) {
    const y = ((((cy + shift) % (H + 200)) + H + 200) % (H + 200)) - 100;
    ctx.beginPath();
    ctx.arc(cx, y, cr, 0, Math.PI * 2);
    ctx.arc(cx + cr * 0.9, y - 6, cr * 0.75, 0, Math.PI * 2);
    ctx.arc(cx - cr * 0.9, y - 6, cr * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const e of s.enemies) {
    drawEnemy(ctx, e.x, e.y, ENEMY_COLORS[e.kind], ENEMY_SPECS[e.kind].radius);
  }

  if (s.bonus) {
    drawPlane(ctx, s.bonus.x, s.bonus.y, 16, '#FFC2D4', Math.PI);
  }

  // Bullets
  ctx.fillStyle = '#FFE066';
  for (const b of s.bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.bonus ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#FF8787';
  for (const b of s.enemyBullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player
  const blink = s.phase === 'playing' && s.time < s.invulnerableUntil;
  if (s.phase !== 'dead' && (!blink || Math.floor(s.time * 8) % 2 === 0)) {
    drawPlane(ctx, s.player.x, s.player.y, 14, PLAYER_COLOR, 0);
  }

  for (const ex of s.explosions) {
    drawExplosion(ctx, ex.x, ex.y, ex.age / ex.life, ex.kind);
  }
}

/** A simple top-down fighter: fuselage, wings, tail. */
function drawPlane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  rotation: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Wings
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.lineTo(size, size * 0.35);
  ctx.lineTo(-size, size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Fuselage
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.28, size * 0.6);
  ctx.lineTo(-size * 0.28, size * 0.6);
  ctx.closePath();
  ctx.fill();

  // Tail
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(-size * 0.45, size * 0.5, size * 0.9, size * 0.18);

  ctx.restore();
}

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  radius: number,
): void {
  drawPlane(ctx, x, y, radius, color, Math.PI);
}

function drawExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  kind: 'enemy' | 'player',
): void {
  const r = (kind === 'player' ? 26 : 20) * (0.4 + t);
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - t);
  ctx.fillStyle = t < 0.4 ? '#FFF3BF' : kind === 'player' ? '#FF6B6B' : '#FF9F43';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3);
    ctx.stroke();
  }
  ctx.restore();
}
