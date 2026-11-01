export type Phase = 'ready' | 'playing' | 'dead';

/** Enemy archetypes for the side-scrolling squadron shooter. */
export type EnemyKind = 'scout' | 'bomber' | 'ace' | 'boss';

export type EnemyState = 'entering' | 'holding' | 'diving';

export type PowerUpKind = 'spread' | 'life' | 'bomb';

export interface Input {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
  /** Pointer/touch target in logical canvas coordinates; wins over key flags. */
  target: { x: number; y: number } | null;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** True for the player's widened (spread) shots. */
  spread: boolean;
}

export interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  points: number;
  radius: number;
  state: EnemyState;
  /** Formation slot the enemy flies into before it dives. */
  slotX: number;
  /** Sine drift: y = baseY + amp * sin(freq * (time - t0)). */
  baseY: number;
  amp: number;
  freq: number;
  t0: number;
  holdUntil: number;
  fireAt: number;
}

export interface Explosion {
  x: number;
  y: number;
  age: number;
  life: number;
  kind: 'enemy' | 'player' | 'boss';
}

export interface PowerUp {
  x: number;
  y: number;
  vx: number;
  kind: PowerUpKind;
}

export interface GameState {
  phase: Phase;
  /** Seconds of game time since the run started. */
  time: number;
  player: { x: number; y: number };
  input: Input;
  bullets: Bullet[];
  enemyBullets: Bullet[];
  enemies: Enemy[];
  explosions: Explosion[];
  powerups: PowerUp[];
  score: number;
  lives: number;
  bombs: number;
  wave: number;
  /** Number of consecutive spread shots still active (0 = single shot). */
  spreadUntil: number;
  invulnerableUntil: number;
  nextFireAt: number;
  nextWaveAt: number;
  formationTotal: number;
  formationKilled: number;
  formationEscaped: number;
  deadAt: number;
}

export type EngineEvent =
  | { type: 'shot'; x: number; y: number; spread: boolean }
  | { type: 'enemyShot'; x: number; y: number }
  | { type: 'explosion'; x: number; y: number; kind: 'enemy' | 'player' | 'boss' }
  | { type: 'perfect'; wave: number; points: number }
  | { type: 'powerup'; x: number; y: number; kind: PowerUpKind }
  | { type: 'bomb' }
  | { type: 'wave'; wave: number }
  | { type: 'boss'; wave: number }
  | { type: 'life-lost'; lives: number }
  | { type: 'gameover'; score: number };
