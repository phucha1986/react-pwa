import { describe, expect, test } from 'vitest';

import { Airplane1942Engine, ENEMY_SPECS, H, W, buildWave } from './engine';
import type { EngineEvent } from './types';

/** Deterministic rng so dive angles and fire times are reproducible. */
const fixedRng = (value: number) => () => value;

function makeEngine(events: EngineEvent[] = [], rngValue = 0.5) {
  const engine = new Airplane1942Engine((e) => events.push(e), fixedRng(rngValue));
  return { engine, events };
}

const stepUntil = (engine: Airplane1942Engine, seconds: number) => {
  const dt = 1 / 60;
  for (let i = 0; i < Math.round(seconds / dt); i += 1) {
    engine.step(dt);
  }
};

describe('airplane 1942 engine', () => {
  test('start resets the world and spawns wave 1', () => {
    const { engine } = makeEngine();
    engine.start(0);

    expect(engine.state.phase).toBe('playing');
    expect(engine.state.wave).toBe(1);
    expect(engine.state.score).toBe(0);
    expect(engine.state.lives).toBe(3);
    expect(engine.state.bombs).toBe(3);
    expect(engine.state.enemies.length).toBe(buildWave(1).length);
    expect(engine.state.enemies.every((e) => e.state === 'entering')).toBe(true);
  });

  test('wave 1 is a 4x2 formation of Zero-Seps with no Bandit', () => {
    expect(buildWave(1)).toHaveLength(8);
    expect(buildWave(1).every((k) => k === 'zerosep')).toBe(true);
  });

  test('a Bandit joins from wave 3 and Hong-Ous appear in row 1', () => {
    expect(buildWave(3)).toContain('bandit');
    expect(buildWave(2).filter((k) => k === 'hongou').length).toBeGreaterThan(0);
  });

  test('a bullet kills a Zero-Sep and scores its value', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    const s = engine.state;
    engine.start(0);

    const enemy = s.enemies[0];
    s.bullets.push({ x: enemy.x, y: enemy.y, vy: -520, bonus: false });
    engine.step(1 / 60);

    expect(s.enemies).toHaveLength(buildWave(1).length - 1);
    expect(s.score).toBe(ENEMY_SPECS.zerosep.points);
    expect(events.some((e) => e.type === 'explosion')).toBe(true);
  });

  test('a Hong-Ou survives one hit and dies on the second', () => {
    const { engine } = makeEngine();
    engine.start(0);
    const s = engine.state;

    // Wave 1 is all Zero-Seps, so play until wave 2 to see a Hong-Ou.
    for (const e of [...s.enemies]) {
      s.bullets.push({ x: e.x, y: e.y, vy: -520, bonus: false });
      engine.step(1 / 60);
    }
    stepUntil(engine, 3);

    const hongou = s.enemies.find((e) => e.kind === 'hongou')!;
    expect(hongou).toBeDefined();
    const before = s.score;

    s.bullets.push({ x: hongou.x, y: hongou.y, vy: -520, bonus: false });
    engine.step(1 / 60);
    expect(s.score).toBe(before);
    expect(s.enemies).toContain(hongou);

    s.bullets.push({ x: hongou.x, y: hongou.y, vy: -520, bonus: false });
    engine.step(1 / 60);
    expect(s.score).toBe(before + ENEMY_SPECS.hongou.points);
    expect(s.enemies).not.toContain(hongou);
  });

  test('a perfect formation awards the bonus once the wave is cleared', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    for (const e of [...s.enemies]) {
      s.bullets.push({ x: e.x, y: e.y, vy: -520, bonus: false });
      engine.step(1 / 60);
    }

    const total = buildWave(1).length * ENEMY_SPECS.zerosep.points;
    expect(s.score).toBe(total + 500);
    expect(events.some((e) => e.type === 'perfect' && e.wave === 1)).toBe(true);
  });

  test('enemies that escape the screen stop the perfect bonus', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;
    engine.setInput({
      up: false,
      down: false,
      left: false,
      right: false,
      fire: false,
      target: { x: 20, y: H - 20 },
    });

    stepUntil(engine, 12);

    expect(s.formationEscaped).toBeGreaterThan(0);
    expect(events.some((e) => e.type === 'perfect')).toBe(false);
  });

  test('the bomb clears every enemy on screen and consumes a bomb', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    const before = s.score;
    expect(engine.useBomb()).toBe(true);
    expect(s.enemies).toHaveLength(0);
    expect(s.bombs).toBe(2);
    expect(s.score).toBe(before + buildWave(1).length * ENEMY_SPECS.zerosep.points);
    expect(events.some((e) => e.type === 'bomb')).toBe(true);

    // Nothing left to bomb.
    expect(engine.useBomb()).toBe(false);
  });

  test('an enemy bullet costs a life and the player respawns invulnerable', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    s.enemyBullets.push({ x: s.player.x, y: s.player.y, vy: 260, bonus: false });
    engine.step(1 / 60);

    expect(s.lives).toBe(2);
    expect(s.phase).toBe('playing');
    expect(s.player).toEqual({ x: W / 2, y: H - 90 });
    expect(s.invulnerableUntil).toBeGreaterThan(s.time);
    expect(events.some((e) => e.type === 'life-lost')).toBe(true);

    // A second hit during the invulnerability window is ignored.
    s.enemyBullets.push({ x: s.player.x, y: s.player.y, vy: 260, bonus: false });
    engine.step(1 / 60);
    expect(s.lives).toBe(2);
  });

  test('the last life ends the game', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    for (let i = 0; i < 3; i += 1) {
      s.invulnerableUntil = 0;
      s.enemyBullets.push({ x: s.player.x, y: s.player.y, vy: 260, bonus: false });
      engine.step(1 / 60);
    }

    expect(s.lives).toBe(0);
    expect(s.phase).toBe('dead');
    expect(events.filter((e) => e.type === 'life-lost')).toHaveLength(3);
    expect(events.some((e) => e.type === 'gameover')).toBe(true);
  });

  test('the player cannot leave the playfield', () => {
    const { engine } = makeEngine();
    engine.start(0);
    const s = engine.state;
    engine.setInput({ up: true, down: false, left: true, right: false, fire: false, target: null });

    stepUntil(engine, 3);

    expect(s.player.x).toBeCloseTo(14, 1);
    expect(s.player.y).toBeCloseTo(14, 1);
  });

  test('fire is rate limited by the cooldown', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    engine.setInput({
      up: false,
      down: false,
      left: false,
      right: false,
      fire: true,
      target: null,
    });

    stepUntil(engine, 1);

    // 1 second at 0.22s cooldown => 5 shots.
    expect(events.filter((e) => e.type === 'shot')).toHaveLength(5);
  });

  test('a held formation slot stops the enemy at its formation position', () => {
    const { engine } = makeEngine();
    engine.start(0);
    const s = engine.state;
    const first = s.enemies[0];

    stepUntil(engine, 4);

    expect(first.state).toBe('holding');
    expect(first.x).toBeCloseTo(first.slotX, 1);
  });

  test('a diving enemy leaves the playfield and counts as escaped', () => {
    const { engine } = makeEngine();
    engine.start(0);
    const s = engine.state;
    engine.setInput({
      up: false,
      down: false,
      left: false,
      right: false,
      fire: false,
      target: { x: 20, y: H - 20 },
    });

    stepUntil(engine, 8);

    expect(s.enemies.some((e) => e.state === 'diving')).toBe(true);

    stepUntil(engine, 4);
    expect(s.formationEscaped).toBeGreaterThan(0);
  });

  test('a bonus plane appears on even waves and scores when shot', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    for (const e of [...s.enemies]) {
      s.bullets.push({ x: e.x, y: e.y, vy: -520, bonus: false });
      engine.step(1 / 60);
    }

    stepUntil(engine, 3);
    expect(s.wave).toBe(2);
    expect(s.bonus).not.toBeNull();

    const before = s.score;
    s.bullets.push({ x: s.bonus!.x, y: s.bonus!.y, vy: -520, bonus: false });
    engine.step(1 / 60);
    expect(s.bonus).toBeNull();
    expect(s.score).toBe(before + 100);
  });

  test('step does nothing before the game starts', () => {
    const { engine } = makeEngine();
    engine.step(1 / 60);
    expect(engine.state.phase).toBe('ready');
    expect(engine.state.enemies).toHaveLength(0);
  });
});
