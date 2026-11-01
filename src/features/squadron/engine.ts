import type {
  Enemy,
  EnemyKind,
  EngineEvent,
  GameState,
  Input,
  PowerUp,
  PowerUpKind,
} from './types';

/** Logical canvas size — the DOM canvas is scaled to fit the screen. */
export const W = 600;
export const H = 400;

const PLAYER_R = 14;
const PLAYER_SPEED = 260;
const BULLET_R = 3;
const BULLET_SPEED = 560;
const FIRE_COOLDOWN = 0.2;
const ENEMY_BULLET_SPEED = 240;
const START_LIVES = 3;
const START_BOMBS = 3;
const INVULN_SECONDS = 2;
const WAVE_GAP = 2.2;
const HOLD_SECONDS = 5;
const ENTRY_SPEED = 170;
const PERFECT_BONUS = 500;
const SPREAD_SECONDS = 8;
const BOSS_EVERY = 5;

export interface EnemySpec {
  hp: number;
  points: number;
  radius: number;
  diveSpeed: number;
  fireEvery: number;
}

export const ENEMY_SPECS: Record<EnemyKind, EnemySpec> = {
  scout: { hp: 1, points: 40, radius: 15, diveSpeed: 220, fireEvery: 3.2 },
  bomber: { hp: 3, points: 120, radius: 24, diveSpeed: 150, fireEvery: 2.2 },
  ace: { hp: 1, points: 150, radius: 13, diveSpeed: 320, fireEvery: 4 },
  boss: { hp: 14, points: 1000, radius: 40, diveSpeed: 0, fireEvery: 1.1 },
};

/** Formation grid: rows of enemies that fly in from the right edge. */
const ROWS = 3;
const COLS = 4;
const slotY = (row: number) => 70 + row * ((H - 140) / (ROWS - 1));
const slotX = (col: number) => 150 + col * 90;

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
  player: { x: 70, y: H / 2 },
  input: initialInput(),
  bullets: [],
  enemyBullets: [],
  enemies: [],
  explosions: [],
  powerups: [],
  score: 0,
  lives: START_LIVES,
  bombs: START_BOMBS,
  wave: 0,
  spreadUntil: 0,
  invulnerableUntil: 0,
  nextFireAt: 0,
  nextWaveAt: 0,
  formationTotal: 0,
  formationKilled: 0,
  formationEscaped: 0,
  deadAt: 0,
});

/** Wave composition: mostly scouts, a bomber every other wave, an ace from wave 3. */
export function buildWave(wave: number): EnemyKind[] {
  if (wave % BOSS_EVERY === 0) return ['boss'];

  const kinds: EnemyKind[] = [];
  const rows = Math.min(ROWS, 1 + Math.ceil(wave / 2));
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      kinds.push(wave >= 2 && row === 0 && col % 2 === 0 ? 'bomber' : 'scout');
    }
  }
  if (wave >= 3) kinds.push('ace');
  return kinds;
}

export type EngineListener = (event: EngineEvent) => void;

/**
 * Game engine: owns the clock, entities, collisions and scoring. Deliberately
 * free of React and DOM so the arcade logic can be unit tested, and so the
 * render loop never triggers a React re-render per frame.
 */
export class SquadronEngine {
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
      if (e.kind === 'boss') {
        // A bomb only chips the boss; it is too tough to clear outright.
        e.hp -= 3;
        if (e.hp > 0) continue;
      } else {
        e.hp = 0;
      }
      this.s.score += e.points;
      this.s.formationKilled += 1;
      this.s.explosions.push({ x: e.x, y: e.y, age: 0, life: 0.5, kind: 'enemy' });
      this.listener({ type: 'explosion', x: e.x, y: e.y, kind: 'enemy' });
    }
    this.s.enemies = this.s.enemies.filter((e) => e.hp > 0);
    this.s.enemyBullets = [];
    return true;
  }

  private spawnWave() {
    this.s.wave += 1;
    const kinds = buildWave(this.s.wave);
    this.s.formationTotal = kinds.length;
    this.s.formationKilled = 0;
    this.s.formationEscaped = 0;

    const isBoss = this.s.wave % BOSS_EVERY === 0;
    if (isBoss) this.listener({ type: 'boss', wave: this.s.wave });

    kinds.forEach((kind, i) => {
      const spec = ENEMY_SPECS[kind];
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const baseY = isBoss ? H / 2 : slotY(row);
      this.s.enemies.push({
        id: this.nextId++,
        kind,
        x: W + 20 + i * 30,
        y: baseY,
        vx: isBoss ? -60 : -ENTRY_SPEED,
        vy: 0,
        hp: spec.hp,
        points: spec.points,
        radius: spec.radius,
        state: 'entering',
        slotX: isBoss ? W * 0.78 : slotX(col),
        baseY,
        amp: isBoss ? 40 : 18 + this.rng() * 26,
        freq: 1.4 + this.rng() * 1.2,
        t0: this.s.time,
        holdUntil: this.s.time + HOLD_SECONDS + i * 0.35,
        fireAt: this.s.time + 1 + this.rng() * 3,
      });
    });

    this.listener({ type: 'wave', wave: this.s.wave });

    if (this.s.wave % 2 === 0) {
      this.s.powerups.push({ x: W + 30, y: 60 + this.rng() * (H - 120), vx: -120, kind: 'spread' });
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
    this.movePowerups(dt);
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
    const spread = this.s.time < this.s.spreadUntil;
    const y = this.s.player.y;
    const x = this.s.player.x + PLAYER_R;

    this.s.bullets.push({ x, y, vx: BULLET_SPEED, vy: 0, spread });
    if (spread) {
      this.s.bullets.push({ x, y: y - 8, vx: BULLET_SPEED, vy: -120, spread: true });
      this.s.bullets.push({ x, y: y + 8, vx: BULLET_SPEED, vy: 120, spread: true });
    }
    this.listener({ type: 'shot', x, y, spread });
  }

  private moveBullets(dt: number) {
    for (const b of this.s.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }
    for (const b of this.s.enemyBullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }
    this.s.bullets = this.s.bullets.filter((b) => b.x < W + 300 && b.y > -20 && b.y < H + 20);
    this.s.enemyBullets = this.s.enemyBullets.filter((b) => b.x > -20);

    // Player bullets vs enemies / powerups.
    for (const b of this.s.bullets) {
      for (const e of this.s.enemies) {
        if (Math.hypot(b.x - e.x, b.y - e.y) <= e.radius + BULLET_R) {
          e.hp -= 1;
          b.x = -100; // consume the bullet
          if (e.hp <= 0) {
            this.killEnemy(e);
          }
          break;
        }
      }
    }
    this.s.bullets = this.s.bullets.filter((b) => b.x > -20);

    // Enemy bullets vs the player.
    if (this.s.time >= this.s.invulnerableUntil) {
      for (const b of this.s.enemyBullets) {
        if (Math.hypot(b.x - this.s.player.x, b.y - this.s.player.y) <= PLAYER_R + BULLET_R) {
          b.x = W + 100;
          this.killPlayer();
          break;
        }
      }
    }
    this.s.enemyBullets = this.s.enemyBullets.filter((b) => b.x > -20);
  }

  private moveEnemies(dt: number) {
    const survivors: Enemy[] = [];

    for (const e of this.s.enemies) {
      if (e.state === 'entering') {
        e.x += e.vx * dt;
        const targetX = e.slotX;
        if (e.x <= targetX) {
          e.x = targetX;
          e.vx = e.kind === 'boss' ? -60 : 0;
          e.state = 'holding';
        }
      } else if (e.state === 'holding') {
        if (this.s.time >= e.fireAt) {
          e.fireAt = this.s.time + ENEMY_SPECS[e.kind].fireEvery * (0.6 + this.rng() * 0.8);
          this.s.enemyBullets.push({
            x: e.x - e.radius,
            y: e.y,
            vx: -ENEMY_BULLET_SPEED,
            vy: 0,
            spread: false,
          });
          this.listener({ type: 'enemyShot', x: e.x, y: e.y });
        }
        if (e.kind !== 'boss' && this.s.time >= e.holdUntil) {
          e.state = 'diving';
          e.vy = ENEMY_SPECS[e.kind].diveSpeed;
          e.vx = -ENEMY_SPECS[e.kind].diveSpeed * 0.6;
        }
      } else {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      }

      // Sine drift while holding formation.
      if (e.state === 'holding' && e.kind !== 'boss') {
        e.y = e.baseY + e.amp * Math.sin(e.freq * (this.s.time - e.t0));
      } else if (e.kind === 'boss') {
        e.y = e.baseY + e.amp * Math.sin(e.freq * (this.s.time - e.t0));
      }

      // Body collision with the player.
      if (this.s.time >= this.s.invulnerableUntil) {
        if (Math.hypot(e.x - this.s.player.x, e.y - this.s.player.y) <= e.radius + PLAYER_R) {
          this.killEnemy(e);
          this.killPlayer();
          continue;
        }
      }

      // Exited the left edge — the formation leaked.
      if (e.x < -30) {
        this.s.formationEscaped += 1;
        continue;
      }
      survivors.push(e);
    }

    this.s.enemies = survivors;
  }

  private movePowerups(dt: number) {
    const survivors: PowerUp[] = [];
    for (const pu of this.s.powerups) {
      pu.x += pu.vx * dt;

      if (
        this.s.time >= this.s.invulnerableUntil &&
        Math.hypot(pu.x - this.s.player.x, pu.y - this.s.player.y) <= 16 + PLAYER_R
      ) {
        this.applyPowerup(pu.kind, pu.x, pu.y);
        continue;
      }

      if (pu.x > -30) survivors.push(pu);
    }
    this.s.powerups = survivors;
  }

  private applyPowerup(kind: PowerUpKind, x: number, y: number) {
    this.listener({ type: 'powerup', x, y, kind });
    if (kind === 'spread') {
      this.s.spreadUntil = this.s.time + SPREAD_SECONDS;
    } else if (kind === 'life') {
      this.s.lives += 1;
    } else if (kind === 'bomb') {
      this.s.bombs += 1;
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
    const kind = e.kind === 'boss' ? 'boss' : 'enemy';
    this.s.explosions.push({ x: e.x, y: e.y, age: 0, life: e.kind === 'boss' ? 1 : 0.5, kind });
    this.s.enemies = this.s.enemies.filter((x) => x.id !== e.id);
    this.listener({ type: 'explosion', x: e.x, y: e.y, kind });

    if (e.kind === 'boss') {
      // Boss drops a life powerup on defeat.
      this.s.powerups.push({ x: e.x, y: e.y, vx: -80, kind: 'life' });
    }
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

    this.s.player = { x: 70, y: H / 2 };
    this.s.invulnerableUntil = this.s.time + INVULN_SECONDS;
    this.s.enemyBullets = [];
  }
}
