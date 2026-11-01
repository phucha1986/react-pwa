import type { Enemy, EnemyKind, EngineEvent, GameState, Input } from './types';

/** Logical canvas size — the DOM canvas is scaled to fit the screen. */
export const W = 400;
export const H = 600;

const PLAYER_R = 14;
const PLAYER_SPEED = 260;
const BULLET_R = 3;
const BULLET_SPEED = 520;
const FIRE_COOLDOWN = 0.22;
const ENEMY_BULLET_SPEED = 260;
const START_LIVES = 3;
const START_BOMBS = 3;
const INVULN_SECONDS = 2;
const WAVE_GAP = 2.4;
const HOLD_SECONDS = 6;
const ENTRY_SPEED = 150;
const PERFECT_BONUS = 500;
const BONUS_POINTS = 100;

export interface EnemySpec {
  hp: number;
  points: number;
  radius: number;
  diveSpeed: number;
  fireEvery: number;
}

export const ENEMY_SPECS: Record<EnemyKind, EnemySpec> = {
  zerosep: { hp: 1, points: 40, radius: 16, diveSpeed: 210, fireEvery: 3.2 },
  hongou: { hp: 2, points: 80, radius: 22, diveSpeed: 170, fireEvery: 2.4 },
  bandit: { hp: 1, points: 150, radius: 12, diveSpeed: 300, fireEvery: 4 },
};

/** 4 x 3 formation grid, the classic 1942 layout. */
const COLS = 4;
const ROWS = 3;
const slotX = (col: number) => 60 + col * 70;
const slotY = (row: number) => 90 + row * 60;

const initialInput = (): Input => ({
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  target: null,
});

const initialState = (): GameState => ({
  phase: 'ready',
  time: 0,
  player: { x: W / 2, y: H - 90 },
  input: initialInput(),
  bullets: [],
  enemyBullets: [],
  enemies: [],
  explosions: [],
  bonus: null,
  score: 0,
  lives: START_LIVES,
  bombs: START_BOMBS,
  wave: 0,
  invulnerableUntil: 0,
  nextFireAt: 0,
  nextWaveAt: 0,
  formationTotal: 0,
  formationKilled: 0,
  formationEscaped: 0,
  deadAt: 0,
});

/** Wave composition: mostly Zero-Seps, a Hong-Ou every other wave, a Bandit from wave 3. */
export function buildWave(wave: number): EnemyKind[] {
  const kinds: EnemyKind[] = [];
  const rows = Math.min(ROWS, 1 + Math.ceil(wave / 2));
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      kinds.push(wave >= 2 && row === 0 && col % 2 === 0 ? 'hongou' : 'zerosep');
    }
  }
  if (wave >= 3) kinds.push('bandit');
  return kinds;
}

export type EngineListener = (event: EngineEvent) => void;

/**
 * Game engine: owns the clock, entities, collisions and scoring. Deliberately
 * free of React and DOM so the arcade logic can be unit tested, and so the
 * render loop never triggers a React re-render per frame.
 */
export class Airplane1942Engine {
  private s: GameState;
  private listener: EngineListener;
  private rng: () => number;
  private nextId = 1;

  constructor(listener: EngineListener, rng: () => number = Math.random) {
    this.listener = listener;
    this.rng = rng;
    this.s = initialState();
  }

  get state(): GameState {
    return this.s;
  }

  setInput(input: Input) {
    this.s.input = input;
  }

  start(nowMs: number) {
    // Reset in place so `engine.state` keeps a stable object identity for the
    // render loop and the tests.
    const fresh = initialState();
    Object.assign(this.s, fresh);
    this.s.phase = 'playing';
    this.s.deadAt = nowMs;
    this.spawnWave();
  }

  restart() {
    this.start(performance.now());
  }

  /** Arcade bomb: wipes every enemy currently on screen. */
  useBomb(): boolean {
    if (this.s.phase !== 'playing' || this.s.bombs <= 0 || this.s.enemies.length === 0) {
      return false;
    }
    this.s.bombs -= 1;
    this.listener({ type: 'bomb' });
    for (const e of this.s.enemies) {
      this.s.score += ENEMY_SPECS[e.kind].points;
      this.s.formationKilled += 1;
      this.s.explosions.push({ x: e.x, y: e.y, age: 0, life: 0.5, kind: 'enemy' });
      this.listener({ type: 'explosion', x: e.x, y: e.y, kind: 'enemy' });
    }
    this.s.enemies = [];
    this.s.enemyBullets = [];
    return true;
  }

  private spawnWave() {
    this.s.wave += 1;
    const kinds = buildWave(this.s.wave);
    this.s.formationTotal = kinds.length;
    this.s.formationKilled = 0;
    this.s.formationEscaped = 0;

    kinds.forEach((kind, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const spec = ENEMY_SPECS[kind];
      this.s.enemies.push({
        id: this.nextId++,
        kind,
        x: W + 30 + i * 45,
        y: slotY(row),
        vx: -ENTRY_SPEED,
        vy: 0,
        hp: spec.hp,
        points: spec.points,
        state: 'entering',
        slotX: slotX(col),
        slotY: slotY(row),
        holdUntil: this.s.time + HOLD_SECONDS + i * 0.35,
        fireAt: this.s.time + 1 + this.rng() * 3,
      });
    });

    this.listener({ type: 'wave', wave: this.s.wave });

    if (this.s.wave % 2 === 0) {
      this.s.bonus = { x: -40, y: 60, entered: false };
    }
  }

  /** Advance the world by dt seconds. Called once per animation frame. */
  step(dt: number) {
    if (this.s.phase === 'dead') {
      this.updateExplosions(dt);
      return;
    }
    if (this.s.phase !== 'playing') return;

    this.s.time += dt;

    this.movePlayer(dt);
    this.firePlayer();
    this.moveBullets(dt);
    this.moveEnemies(dt);
    this.moveBonus(dt);
    this.updateExplosions(dt);
    this.checkWaveComplete();

    if (
      this.s.phase === 'playing' &&
      this.s.enemies.length === 0 &&
      this.s.nextWaveAt <= this.s.time
    ) {
      this.spawnWave();
    }
  }

  private movePlayer(dt: number) {
    const p = this.s.player;
    const input = this.s.input;

    if (input.target) {
      const dx = input.target.x - p.x;
      const dy = input.target.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const step = Math.min(dist, PLAYER_SPEED * dt);
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
      }
    } else {
      if (input.left) p.x -= PLAYER_SPEED * dt;
      if (input.right) p.x += PLAYER_SPEED * dt;
      if (input.up) p.y -= PLAYER_SPEED * dt;
      if (input.down) p.y += PLAYER_SPEED * dt;
    }

    p.x = Math.max(PLAYER_R, Math.min(W - PLAYER_R, p.x));
    p.y = Math.max(PLAYER_R, Math.min(H - PLAYER_R, p.y));
  }

  private firePlayer() {
    if (!this.s.input.fire || this.s.time < this.s.nextFireAt) return;
    this.s.nextFireAt = this.s.time + FIRE_COOLDOWN;
    this.s.bullets.push({
      x: this.s.player.x,
      y: this.s.player.y - PLAYER_R,
      vy: -BULLET_SPEED,
      bonus: false,
    });
    this.listener({ type: 'shot', x: this.s.player.x, y: this.s.player.y, bonus: false });
  }

  private moveBullets(dt: number) {
    for (const b of this.s.bullets) {
      b.y += b.vy * dt;
    }
    for (const b of this.s.enemyBullets) {
      b.y += b.vy * dt;
    }
    this.s.bullets = this.s.bullets.filter((b) => b.y > -20);
    this.s.enemyBullets = this.s.enemyBullets.filter((b) => b.y < H + 20);

    // Player bullets vs enemies / bonus plane.
    for (const b of this.s.bullets) {
      for (const e of this.s.enemies) {
        const spec = ENEMY_SPECS[e.kind];
        if (Math.hypot(b.x - e.x, b.y - e.y) <= spec.radius + BULLET_R) {
          e.hp -= 1;
          b.y = -100; // consume the bullet
          if (e.hp <= 0) {
            this.killEnemy(e);
          }
          break;
        }
      }

      const bonus = this.s.bonus;
      if (bonus && bonus.entered && Math.hypot(b.x - bonus.x, b.y - bonus.y) <= 16 + BULLET_R) {
        this.s.score += BONUS_POINTS;
        this.s.explosions.push({ x: bonus.x, y: bonus.y, age: 0, life: 0.5, kind: 'enemy' });
        this.s.bonus = null;
        this.listener({ type: 'explosion', x: bonus.x, y: bonus.y, kind: 'enemy' });
        b.y = -100;
      }
    }
    this.s.bullets = this.s.bullets.filter((b) => b.y > -20);

    // Enemy bullets vs the player.
    if (this.s.time >= this.s.invulnerableUntil) {
      for (const b of this.s.enemyBullets) {
        if (Math.hypot(b.x - this.s.player.x, b.y - this.s.player.y) <= PLAYER_R + BULLET_R) {
          b.y = H + 100;
          this.killPlayer();
          break;
        }
      }
    }
    this.s.enemyBullets = this.s.enemyBullets.filter((b) => b.y < H + 20);
  }

  private moveEnemies(dt: number) {
    const survivors: Enemy[] = [];

    for (const e of this.s.enemies) {
      if (e.state === 'entering') {
        e.x += e.vx * dt;
        if (e.x <= e.slotX) {
          e.x = e.slotX;
          e.vx = 0;
          e.state = 'holding';
        }
      } else if (e.state === 'holding') {
        if (this.s.time >= e.fireAt) {
          e.fireAt = this.s.time + ENEMY_SPECS[e.kind].fireEvery * (0.6 + this.rng() * 0.8);
          this.s.enemyBullets.push({
            x: e.x,
            y: e.y + ENEMY_SPECS[e.kind].radius,
            vy: ENEMY_BULLET_SPEED,
            bonus: false,
          });
          this.listener({ type: 'enemyShot', x: e.x, y: e.y });
        }
        if (this.s.time >= e.holdUntil) {
          e.state = 'diving';
          e.vy = ENEMY_SPECS[e.kind].diveSpeed;
          e.vx = (this.rng() - 0.5) * 40;
        }
      } else {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      }

      // Body collision with the player.
      if (this.s.time >= this.s.invulnerableUntil) {
        const spec = ENEMY_SPECS[e.kind];
        if (Math.hypot(e.x - this.s.player.x, e.y - this.s.player.y) <= spec.radius + PLAYER_R) {
          this.killEnemy(e);
          this.killPlayer();
          continue;
        }
      }

      if (e.y > H + 30) {
        this.s.formationEscaped += 1;
        continue;
      }
      survivors.push(e);
    }

    this.s.enemies = survivors;
  }

  private moveBonus(dt: number) {
    const bonus = this.s.bonus;
    if (!bonus) return;

    bonus.x += 120 * dt;
    bonus.entered = true;

    if (bonus.x > W + 40) {
      this.s.bonus = null;
      return;
    }

    if (
      this.s.time >= this.s.invulnerableUntil &&
      Math.hypot(bonus.x - this.s.player.x, bonus.y - this.s.player.y) <= 16 + PLAYER_R
    ) {
      this.killPlayer();
      return;
    }
  }

  private updateExplosions(dt: number) {
    for (const ex of this.s.explosions) {
      ex.age += dt;
    }
    this.s.explosions = this.s.explosions.filter((ex) => ex.age < ex.life);
  }

  private checkWaveComplete() {
    if (this.s.formationTotal === 0) return;
    if (this.s.formationKilled + this.s.formationEscaped < this.s.formationTotal) return;

    if (this.s.formationKilled === this.s.formationTotal) {
      this.s.score += PERFECT_BONUS;
      this.listener({ type: 'perfect', wave: this.s.wave, points: PERFECT_BONUS });
    }
    this.s.formationTotal = 0;
    this.s.nextWaveAt = this.s.time + WAVE_GAP;
  }

  private killEnemy(e: Enemy) {
    this.s.score += e.points;
    this.s.formationKilled += 1;
    this.s.explosions.push({ x: e.x, y: e.y, age: 0, life: 0.5, kind: 'enemy' });
    this.s.enemies = this.s.enemies.filter((x) => x.id !== e.id);
    this.listener({ type: 'explosion', x: e.x, y: e.y, kind: 'enemy' });
  }

  private killPlayer() {
    if (this.s.phase !== 'playing') return;
    this.s.explosions.push({
      x: this.s.player.x,
      y: this.s.player.y,
      age: 0,
      life: 0.6,
      kind: 'player',
    });
    this.listener({ type: 'explosion', x: this.s.player.x, y: this.s.player.y, kind: 'player' });
    this.s.lives -= 1;
    this.listener({ type: 'life-lost', lives: this.s.lives });

    if (this.s.lives <= 0) {
      this.s.phase = 'dead';
      this.s.deadAt = performance.now();
      this.listener({ type: 'gameover', score: this.s.score });
      return;
    }

    this.s.player = { x: W / 2, y: H - 90 };
    this.s.invulnerableUntil = this.s.time + INVULN_SECONDS;
    this.s.enemyBullets = [];
  }
}
