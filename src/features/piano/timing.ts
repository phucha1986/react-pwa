import type { Difficulty, Song } from './types';

/**
 * Song clock. Time is derived from a monotonic clock (performance.now), never
 * from frame counts, so rendering hitches cannot make notes drift out of sync
 * with the audio.
 */
export class SongClock {
  private startMs = 0;
  private pausedAtMs: number | null = null;

  constructor(private readonly bpm: number) {}

  start(nowMs: number) {
    this.startMs = nowMs;
    this.pausedAtMs = null;
  }

  pause(nowMs: number) {
    if (this.pausedAtMs === null) this.pausedAtMs = nowMs;
  }

  resume(nowMs: number) {
    if (this.pausedAtMs !== null) {
      // Shift the start so elapsed time continues exactly where it stopped.
      this.startMs += nowMs - this.pausedAtMs;
      this.pausedAtMs = null;
    }
  }

  restart(nowMs: number) {
    this.start(nowMs);
  }

  /** Seconds elapsed since the song started (frozen while paused). */
  elapsedSeconds(nowMs: number): number {
    const endMs = this.pausedAtMs ?? nowMs;
    return Math.max(0, (endMs - this.startMs) / 1000);
  }

  /** Seconds per beat at the current tempo factor. */
  secondsPerBeat(tempoFactor: number): number {
    return 60 / (this.bpm * tempoFactor);
  }

  /** Absolute song time in seconds for a beat offset. */
  beatToSeconds(beat: number, tempoFactor: number): number {
    return beat * this.secondsPerBeat(tempoFactor);
  }
}

/** Song duration in seconds (last note end), including the intro. */
export function songDurationSeconds(song: Song, tempoFactor: number): number {
  const lastBeat = song.notes.reduce((max, n) => Math.max(max, n.startBeat + n.durationBeats), 0);
  return lastBeat * (60 / (song.bpm * tempoFactor));
}

/**
 * Hit windows in seconds, generous for toddlers on 'easy' and tighter on
 * 'challenge'. Windows scale with tempo so a slowed-down song stays fair.
 */
export function hitWindowSeconds(difficulty: Difficulty, tempoFactor: number): number {
  const base = { easy: 0.9, medium: 0.6, challenge: 0.4 }[difficulty];
  return base / tempoFactor;
}

/** Vertical scroll speed in px/second for the falling-notes canvas. */
export function fallSpeedPxPerSecond(difficulty: Difficulty, canvasHeight: number): number {
  // Notes should be visible for roughly this many seconds before the target line.
  // Kids need a long lead: a note must be clearly visible, and its key highlighted,
  // for several seconds before it has to be pressed.
  const leadSeconds = { easy: 4.5, medium: 3.2, challenge: 2.2 }[difficulty];
  return canvasHeight / leadSeconds;
}
