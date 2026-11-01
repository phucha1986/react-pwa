export type Phase = 'ready' | 'playing' | 'dead';

/** Enemy archetypes, named after the 1942 arcade sprites. */
export type EnemyKind = 'zerosep' | 'hongou' | 'bandit';

export type EnemyState = 'entering' | 'holding' | 'diving';

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
  vy: number;
  /** True for the follow-on bonus plane's shots. */
  bonus: boolean;
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
  state: EnemyState;
  /** Formation slot the enemy flies into before it dives. */
  slotX: number;
  slotY: number;
  holdUntil: number;
  fireAt: number;
}

export interface Explosion {
  x: number;
  y: number;
  age: number;
  life: number;
  kind: 'enemy' | 'player';
}

export interface BonusPlane {
  x: number;
  y: number;
  /** Set once the plane has flown in from the left edge. */
  entered: boolean;
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
  bonus: BonusPlane | null;
  score: number;
  lives: number;
  bombs: number;
  wave: number;
  invulnerableUntil: number;
  nextFireAt: number;
  nextWaveAt: number;
  formationTotal: number;
  formationKilled: number;
  formationEscaped: number;
  deadAt: number;
}

export type EngineEvent =
  | { type: 'shot'; x: number; y: number; bonus: boolean }
  | { type: 'enemyShot'; x: number; y: number }
  | { type: 'explosion'; x: number; y: number; kind: 'enemy' | 'player' }
  | { type: 'perfect'; wave: number; points: number }
  | { type: 'bonus'; x: number; y: number }
  | { type: 'bomb' }
  | { type: 'wave'; wave: number }
  | { type: 'life-lost'; lives: number }
  | { type: 'gameover'; score: number };
