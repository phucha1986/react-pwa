import { ENEMY_SPECS, H, W } from './engine';
import type { GameState } from './types';

/** One colour per enemy archetype, echoing the arcade sprites. */
const ENEMY_COLORS: Record<string, string> = {
  scout: '#FF6B6B',
  bomber: '#FFD93D',
  ace: '#B197FC',
  boss: '#E8483F',
};

const PLAYER_COLOR = '#6BCB77';

const POWERUP_COLORS: Record<string, string> = {
  spread: '#FFE066',
  life: '#6BCB77',
  bomb: '#FF9F43',
};

/** Darken/lighten a hex colour by `amt` (-1..1) for simple two-tone shading. */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + amt * 255));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amt * 255));
  const b = Math.min(255, Math.max(0, (n & 255) + amt * 255));
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

/** Scroll the sky at a constant arcade pace. */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  cloudOffset: number,
): void {
  ctx.clearRect(0, 0, W, H);

  // Dusk sky gradient — warm horizon fading into deep night above.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0e1428');
  sky.addColorStop(0.55, '#1b2444');
  sky.addColorStop(1, '#3a2a4a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Soft sun glow near the horizon, right of centre.
  const sun = ctx.createRadialGradient(W * 0.72, H * 0.82, 8, W * 0.72, H * 0.82, 190);
  sun.addColorStop(0, 'rgba(255,196,120,0.5)');
  sun.addColorStop(0.4, 'rgba(255,150,90,0.18)');
  sun.addColorStop(1, 'rgba(255,150,90,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, W, H);

  // Twinkling stars in the upper band.
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (const [sx, sy, sr] of [
    [40, 40, 1.2],
    [150, 70, 1],
    [300, 30, 1.4],
    [420, 90, 1],
    [520, 50, 1.2],
    [230, 120, 0.9],
  ] as const) {
    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(s.time * 1.5 + sx));
    ctx.globalAlpha = twinkle;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Two parallax cloud layers drifting leftward at different depths.
  drawCloudLayer(ctx, cloudOffset * 0.4, 'rgba(255,255,255,0.05)', 1.4, 0.5);
  drawCloudLayer(ctx, cloudOffset, 'rgba(255,255,255,0.09)', 1, 0);

  // Scrolling ground band along the bottom, faster than the clouds for depth.
  drawGround(ctx, cloudOffset);

  // Screen-shake from the freshest explosion, applied only to the entity layer
  // so the background never leaves gaps at the canvas edges.
  const shake = computeShake(s.explosions);
  ctx.save();
  if (shake > 0) {
    ctx.translate(Math.sin(s.time * 60) * shake, Math.cos(s.time * 47) * shake);
  }

  for (const e of s.enemies) {
    drawEnemy(ctx, e, ENEMY_COLORS[e.kind]);
  }

  for (const pu of s.powerups) {
    drawPowerup(ctx, pu, s.time);
  }

  // Player bullets — glowing tracers.
  ctx.save();
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#FFE066';
  ctx.fillStyle = '#FFF3BF';
  for (const b of s.bullets) {
    drawTracer(ctx, b.x, b.y, b.vx, b.vy, b.spread ? 4 : 3, '#FFE066');
  }
  ctx.restore();

  // Enemy bullets — red tracers.
  ctx.save();
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#FF6B6B';
  ctx.fillStyle = '#FF8787';
  for (const b of s.enemyBullets) {
    drawTracer(ctx, b.x, b.y, b.vx, b.vy, 3, '#FF6B6B');
  }
  ctx.restore();

  // Player
  const blink = s.phase === 'playing' && s.time < s.invulnerableUntil;
  if (s.phase !== 'dead' && (!blink || Math.floor(s.time * 8) % 2 === 0)) {
    drawPlayer(ctx, s.player.x, s.player.y, s.time);
  }

  for (const ex of s.explosions) {
    drawExplosion(ctx, ex.x, ex.y, ex.age / ex.life, ex.kind);
  }

  ctx.restore();
}

/** Magnitude of screen-shake driven by the most recent, still-fresh explosion. */
function computeShake(explosions: GameState['explosions']): number {
  let mag = 0;
  for (const ex of explosions) {
    if (ex.age < 0.18) {
      const base = ex.kind === 'boss' ? 10 : ex.kind === 'player' ? 6 : 4;
      const f = 1 - ex.age / 0.18;
      mag = Math.max(mag, base * f);
    }
  }
  return mag;
}

/** A scrolling land silhouette with a lit horizon rim and drifting dunes. */
function drawGround(ctx: CanvasRenderingContext2D, offset: number): void {
  const top = H * 0.86;
  const g = ctx.createLinearGradient(0, top, 0, H);
  g.addColorStop(0, '#241a2e');
  g.addColorStop(1, '#120d18');
  ctx.fillStyle = g;
  ctx.fillRect(0, top, W, H - top);

  ctx.fillStyle = 'rgba(255,170,110,0.25)';
  ctx.fillRect(0, top, W, 2);

  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  const span = 160;
  const drift = (offset * 1.6) % span;
  for (let i = -1; i < W / span + 2; i += 1) {
    const x = i * span - drift;
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.quadraticCurveTo(x + span / 2, top + 6, x + span, H);
    ctx.fill();
  }
}

/** A drifting band of puffy clouds; `depth` scales size, `yBias` offsets vertically. */
function drawCloudLayer(
  ctx: CanvasRenderingContext2D,
  offset: number,
  fill: string,
  depth: number,
  yBias: number,
): void {
  ctx.fillStyle = fill;
  const span = W + 240;
  for (const [cx, cy, cr] of [
    [90, 90, 26],
    [260, 200, 32],
    [430, 120, 22],
    [540, 300, 28],
    [180, 330, 24],
  ] as const) {
    const x = ((((cx - offset) % span) + span) % span) - 120;
    const y = cy * depth + yBias * 40;
    const r = cr * depth;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.9, y - 6, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x - r * 0.9, y - 6, r * 0.7, 0, Math.PI * 2);
    ctx.arc(x, y - r * 0.6, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A glowing bullet: a bright core with a short motion-trail tracer. */
function drawTracer(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number, r: number, color: string): void {
  const len = Math.hypot(vx, vy) || 1;
  const tx = x - (vx / len) * r * 3;
  const ty = y - (vy / len) * r * 3;
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 1.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * A detailed side-on fighter. The nose points along +X, so callers rotate to
 * face the travel direction. Two-tone shading, canopy, prop blur and a tail.
 */
function drawFighter(
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
  const dark = shade(color, -0.28);

  // Tail fin
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.9, 0);
  ctx.lineTo(-size * 1.15, -size * 0.42);
  ctx.lineTo(-size * 0.7, -size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Main wing (swept back)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size * 0.1, 0);
  ctx.lineTo(-size * 0.35, size * 0.95);
  ctx.lineTo(-size * 0.55, size * 0.7);
  ctx.lineTo(-size * 0.2, 0);
  ctx.closePath();
  ctx.fill();

  // Fuselage — tapered body from nose to tail.
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size * 1.05, 0);
  ctx.quadraticCurveTo(size * 0.4, -size * 0.32, -size * 0.85, -size * 0.12);
  ctx.lineTo(-size * 0.9, size * 0.12);
  ctx.quadraticCurveTo(size * 0.3, size * 0.3, size * 1.05, 0);
  ctx.closePath();
  ctx.fill();

  // Belly shading for a sense of volume.
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(size * 0.9, size * 0.04);
  ctx.quadraticCurveTo(size * 0.2, size * 0.28, -size * 0.8, size * 0.1);
  ctx.lineTo(-size * 0.8, size * 0.02);
  ctx.quadraticCurveTo(size * 0.2, size * 0.16, size * 0.9, size * 0.02);
  ctx.closePath();
  ctx.fill();

  // Canopy (glass)
  ctx.fillStyle = 'rgba(210,235,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(size * 0.28, -size * 0.16, size * 0.26, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Propeller blur at the nose.
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(size * 1.08, 0, size * 0.06, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  // Flickering engine exhaust trailing behind the right-facing ship.
  const flick = 0.6 + 0.4 * Math.abs(Math.sin(time * 30));
  const flame = ctx.createLinearGradient(x - 14, y, x - 40, y);
  flame.addColorStop(0, 'rgba(255,220,120,0.9)');
  flame.addColorStop(0.5, 'rgba(255,150,70,0.5)');
  flame.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 3);
  ctx.quadraticCurveTo(x - 30, y, x - 14 - 26 * flick, y);
  ctx.quadraticCurveTo(x - 30, y, x - 12, y + 3);
  ctx.closePath();
  ctx.fill();

  // Player flies rightward; add a warm engine-glow behind it.
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#6BCB77';
  drawFighter(ctx, x, y, 14, PLAYER_COLOR, 0);
  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: GameState['enemies'][number], color: string): void {
  const radius = ENEMY_SPECS[e.kind].radius;
  // Enemies fly leftward.
  ctx.save();
  if (e.kind === 'boss') {
    // A hulking bomber silhouette with a pulsing core.
    ctx.shadowBlur = 16;
    ctx.shadowColor = color;
    drawFighter(ctx, e.x, e.y, radius, color, Math.PI);
    ctx.shadowBlur = 0;
    const pulse = 0.5 + 0.5 * Math.sin(e.holdUntil * 0.001);
    ctx.fillStyle = `rgba(255,240,180,${0.4 + 0.3 * pulse})`;
    ctx.beginPath();
    ctx.arc(e.x, e.y, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    drawFighter(ctx, e.x, e.y, radius, color, Math.PI);
  }
  ctx.restore();
}

/** Distinct powerup icons: spread = triple chevron, life = heart, bomb = orb. */
function drawPowerup(ctx: CanvasRenderingContext2D, pu: GameState['powerups'][number], time: number): void {
  const color = POWERUP_COLORS[pu.kind];
  const bob = Math.sin(time * 4 + pu.x) * 2;
  ctx.save();
  ctx.translate(pu.x, pu.y + bob);
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;

  // Halo ring
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(20,26,46,0.6)';
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  if (pu.kind === 'spread') {
    for (const dy of [-4, 0, 4]) {
      ctx.beginPath();
      ctx.moveTo(-5, dy - 2);
      ctx.lineTo(5, dy);
      ctx.lineTo(-5, dy + 2);
      ctx.closePath();
      ctx.fill();
    }
  } else if (pu.kind === 'life') {
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(-5, 0);
    ctx.quadraticCurveTo(-5, -5, 0, -4);
    ctx.quadraticCurveTo(5, -5, 5, 0);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF3BF';
    ctx.beginPath();
    ctx.arc(-1.5, -1.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  kind: 'enemy' | 'player' | 'boss',
): void {
  const base = kind === 'boss' ? 40 : kind === 'player' ? 26 : 20;
  const r = base * (0.4 + t);
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - t);

  // Hot white core fading to orange.
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, t < 0.4 ? '#FFFDF0' : '#FFD27A');
  g.addColorStop(0.5, kind === 'player' ? '#FF6B6B' : '#FF9F43');
  g.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Expanding shock ring.
  ctx.strokeStyle = `rgba(255,240,200,${0.6 * (1 - t)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.15, 0, Math.PI * 2);
  ctx.stroke();

  // Radiating sparks.
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + t;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.4, y + Math.sin(a) * r * 0.4);
    ctx.lineTo(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3);
    ctx.stroke();
  }
  ctx.restore();
}
