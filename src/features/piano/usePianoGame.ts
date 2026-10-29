import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { pianoAudio } from './audio';
import { drawScene } from './draw';
import { PianoGameEngine } from './engine';
import { buildKeyLayout, whiteKeyWidth } from './keyboard';
import type { CanvasLayout } from './positions';
import { loadProgress, recordCompletion } from './storage';
import type { GamePhase, Progress, Score, Settings, Song } from './types';

export interface PianoGameApi {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  score: Score;
  phase: GamePhase;
  pressedMidi: number | null;
  lastEvent: { type: string; midi: number } | null;
  keyWidth: number;
  keyLayout: ReturnType<typeof buildKeyLayout>;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  tap: (midi: number) => void;
  release: () => void;
  stars: number;
  progress: Progress;
  /** Updated on a timer (not per frame) so the UI stays cheap. */
  elapsedSeconds: number;
}

/**
 * Wires the engine to the canvas. The render loop uses requestAnimationFrame
 * and draws directly, so React never re-renders per frame; state updates only
 * happen on discrete game events.
 */
export function usePianoGame(song: Song, settings: Settings): PianoGameApi {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layoutRef = useRef<CanvasLayout>({ width: 0, height: 0, targetY: 0, pxPerBeat: 40 });
  const pressedRef = useRef<number | null>(null);

  const [score, setScore] = useState<Score>({ correct: 0, incorrect: 0, missed: 0, total: 0 });
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [pressedMidi, setPressedMidi] = useState<number | null>(null);
  const [lastEvent, setLastEvent] = useState<{ type: string; midi: number } | null>(null);
  const [keyWidth, setKeyWidth] = useState(44);
  const [stars, setStars] = useState(0);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const keyLayout = useMemo(() => buildKeyLayout(60, 72), []);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const engine = useMemo(() => {
    const e = new PianoGameEngine(
      song,
      () => settingsRef.current,
      pianoAudio,
      (event) => {
        if (event.type === 'finished') {
          setStars(event.stars);
          setPhase('finished');
          setScore({ ...e.state.score });
          const acc = e.state.score.total > 0 ? e.state.score.correct / e.state.score.total : 0;
          setProgress(recordCompletion(loadProgress(), song.id, event.stars, acc));
        } else if (event.type === 'hit' || event.type === 'missed') {
          setScore({ ...e.state.score });
        } else {
          setLastEvent({ type: event.type, midi: event.midi });
        }
      },
    );
    return e;
  }, [song]);

  // Size the canvas for the device pixel ratio so shapes stay crisp.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      // offsetWidth/Height report the unrotated layout box. getBoundingClientRect
      // would report swapped dimensions when the stage is rotated on a portrait phone.
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const kw = whiteKeyWidth(width, keyLayout.whiteCount);
      setKeyWidth(kw);

      layoutRef.current = {
        width,
        height,
        // The target line stays close to the keyboard so the strip above it is as
        // long as possible; that strip is the runway the falling speed is based on.
        targetY: height - Math.max(34, height * 0.16),
        pxPerBeat: Math.max(28, Math.min(60, height / 8)),
      };
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [keyLayout]);

  // Render loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let raf = 0;
    const frame = (nowMs: number) => {
      engine.tick(nowMs);
      drawScene(ctx, {
        tracked: engine.state.tracked,
        layout: layoutRef.current,
        keyLayout,
        settings: settingsRef.current,
        difficulty: settingsRef.current.difficultyMode,
        secondsPerBeat: 60 / (song.bpm * settingsRef.current.tempoFactor),
        elapsedSeconds: engine.elapsed(nowMs),
        pressedMidi: pressedRef.current,
        keyWidth,
      });
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [engine, keyLayout, song, keyWidth]);

  // Throttled progress readout for the UI: React is not re-rendered per frame.
  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsedSeconds(engine.elapsed(performance.now()));
    }, 200);
    return () => window.clearInterval(id);
  }, [engine]);

  const start = useCallback(() => {
    pianoAudio.ensure();
    engine.start(performance.now());
    setPhase('running');
    setStars(0);
    setScore(engine.state.score);
  }, [engine]);

  const pause = useCallback(() => {
    engine.pause(performance.now());
    setPhase('paused');
  }, [engine]);

  const resume = useCallback(() => {
    engine.resume(performance.now());
    setPhase('running');
  }, [engine]);

  const restart = useCallback(() => {
    engine.restart(performance.now());
    setPhase('running');
    setStars(0);
    setScore(engine.state.score);
  }, [engine]);

  const tap = useCallback(
    (midi: number) => {
      pianoAudio.ensure();
      pressedRef.current = midi;
      setPressedMidi(midi);
      engine.tap(midi, performance.now());
    },
    [engine],
  );

  const release = useCallback(() => {
    pressedRef.current = null;
    setPressedMidi(null);
  }, []);

  // Release audio + listeners on unmount so nothing leaks between games.
  useEffect(() => {
    return () => {
      pianoAudio.stopAll();
    };
  }, []);

  return {
    canvasRef,
    score,
    phase,
    pressedMidi,
    lastEvent,
    keyWidth,
    keyLayout,
    start,
    pause,
    resume,
    restart,
    tap,
    release,
    stars,
    progress,
    elapsedSeconds,
  };
}
