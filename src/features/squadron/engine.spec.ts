import { describe, expect, test } from 'vitest';

import { SquadronEngine, ENEMY_SPECS, H, W, buildWave } from './engine';
import type { EngineEvent } from './types';

/** Deterministic rng so dive angles and fire times are reproducible. */
const fixedRng = (value: number) => () => value;

function makeEngine(events: EngineEvent[] = [], rngValue = 0.5) {
  const engine = new SquadronEngine((e) => events.push(e), fixedRng(rngValue));
  return { engine, events };
}

const stepUntil = (engine: SquadronEngine, seconds: number) => {
  const dt = 1 / 60;
  for (let i = 0; i < Math.round(seconds / dt); i += 1) {
    engine.step(dt);
  }
};

describe('squadron engine', () => {
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

  test('wave 1 is a 2x4 formation of scouts with no bomber or ace', () => {
    expect(buildWave(1)).toHaveLength(8);
    expect(buildWave(1).every((k) => k === 'scout')).toBe(true);
  });

  test('a bomber joins from wave 2 and an ace joins from wave 3', () => {
    expect(buildWave(2).filter((k) => k === 'bomber').length).toBeGreaterThan(0);
    expect(buildWave(3)).toContain('ace');
  });

  test('a boss wave appears every fifth wave', () => {
    expect(buildWave(5)).toEqual(['boss']);
    expect(buildWave(10)).toEqual(['boss']);
  });

  test('a bullet kills a scout and scores its value', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    const s = engine.state;
    engine.start(0);

    const enemy = s.enemies[0];
    s.bullets.push({ x: enemy.x, y: enemy.y, vx: -560, vy: 0, spread: false });
    engine.step(1 / 60);

    expect(s.enemies).toHaveLength(buildWave(1).length - 1);
    expect(s.score).toBe(ENEMY_SPECS.scout.points);
    expect(events.some((e) => e.type === 'explosion')).toBe(true);
  });

  test('a bomber survives two hits and dies on the third', () => {
    const { engine } = makeEngine();
    engine.start(0);
    const s = engine.state;

    // Wave 1 is all scouts, so play until wave 2 to see a bomber.
    for (const e of [...s.enemies]) {
      s.bullets.push({ x: e.x, y: e.y, vx: -560, vy: 0, spread: false });
      engine.step(1 / 60);
    }
    stepUntil(engine, 3);

    const bomber = s.enemies.find((e) => e.kind === 'bomber')!;
    expect(bomber).toBeDefined();
    const before = s.score;

    s.bullets.push({ x: bomber.x, y: bomber.y, vx: -560, vy: 0, spread: false });
    engine.step(1 / 60);
    expect(s.score).toBe(before);
    expect(s.enemies).toContain(bomber);

    s.bullets.push({ x: bomber.x, y: bomber.y, vx: -560, vy: 0, spread: false });
    engine.step(1 / 60);
    expect(s.score).toBe(before);
    expect(s.enemies).toContain(bomber);

    s.bullets.push({ x: bomber.x, y: bomber.y, vx: -560, vy: 0, spread: false });
    engine.step(1 / 60);
    expect(s.score).toBe(before + ENEMY_SPECS.bomber.points);
    expect(s.enemies).not.toContain(bomber);
  });

  test('a perfect formation awards the bonus once the wave is cleared', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    for (const e of [...s.enemies]) {
      s.bullets.push({ x: e.x, y: e.y, vx: -560, vy: 0, spread: false });
      engine.step(1 / 60);
    }

    const total = buildWave(1).length * ENEMY_SPECS.scout.points;
    expect(s.score).toBe(total + 500);
    expect(events.some((e) => e.type === 'perfect' && e.wave === 1)).toBe(true);
  });

  test('enemies that escape the left edge stop the perfect bonus', () => {
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

  test('the bomb clears the formation and consumes a bomb', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    const used = engine.useBomb();
    expect(used).toBe(true);
    expect(s.bombs).toBe(2);
    expect(s.enemies).toHaveLength(0);
    expect(s.enemyBullets).toHaveLength(0);
  });

  test('a bomb only chips the boss and does not clear it outright', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    // Inject a boss directly so the bomb-vs-boss rule is exercised in isolation.
    s.enemies.push({
      id: 999,
      kind: 'boss',
      x: W * 0.78,
      y: H / 2,
      vx: 0,
      vy: 0,
      hp: ENEMY_SPECS.boss.hp,
      points: ENEMY_SPECS.boss.points,
      radius: ENEMY_SPECS.boss.radius,
      state: 'holding',
      slotX: W * 0.78,
      baseY: H / 2,
      amp: 0,
      freq: 1,
      t0: 0,
      holdUntil: s.time + 999,
      fireAt: s.time + 999,
    });

    engine.useBomb();
    expect(s.enemies.some((e) => e.kind === 'boss')).toBe(true);
    expect(s.enemies.find((e) => e.kind === 'boss')!.hp).toBe(ENEMY_SPECS.boss.hp - 3);
  });

  test('a powerup grants the spread shot for a window of time', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    // Drop a spread powerup right on top of the player.
    s.powerups.push({ x: s.player.x, y: s.player.y, vx: 0, kind: 'spread' });
    engine.step(1 / 60);

    expect(events.some((e) => e.type === 'powerup' && e.kind === 'spread')).toBe(true);
    expect(s.spreadUntil).toBeGreaterThan(s.time);
  });

  test('a life powerup adds a life', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    s.powerups.push({ x: s.player.x, y: s.player.y, vx: 0, kind: 'life' });
    engine.step(1 / 60);

    expect(s.lives).toBe(4);
  });

  test('a spread shot fires three bullets per shot', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    s.powerups.push({ x: s.player.x, y: s.player.y, vx: 0, kind: 'spread' });
    engine.step(1 / 60);
    engine.setInput({
      up: false,
      down: false,
      left: false,
      right: false,
      fire: true,
      target: null,
    });
    engine.step(1 / 60);

    const spreadBullets = s.bullets.filter((b) => b.spread);
    expect(spreadBullets.length).toBeGreaterThanOrEqual(3);
  });

  test('an enemy that reaches the player costs a life', () => {
    const events: EngineEvent[] = [];
    const { engine } = makeEngine(events);
    engine.start(0);
    const s = engine.state;

    // Drop an enemy right on top of the player to force a body collision.
    const enemy = s.enemies[0];
    enemy.state = 'diving';
    enemy.x = s.player.x;
    enemy.y = s.player.y;
    engine.step(1 / 60);

    expect(s.lives).toBe(2);
    expect(events.some((e) => e.type === 'life-lost')).toBe(true);
  });

  test('losing all lives ends the game', () => {
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
      target: { x: 20, y: H / 2 },
    });

    stepUntil(engine, 60);

    expect(s.phase).toBe('dead');
    expect(events.some((e) => e.type === 'gameover')).toBe(true);
  });
});
