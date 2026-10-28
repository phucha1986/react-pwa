import type { PianoAudio } from './audio';
import { emptyScore, starsForScore } from './scoring';
import { SongClock, hitWindowSeconds, songDurationSeconds } from './timing';
import type {
  EngineEvent,
  GamePhase,
  HitResult,
  Score,
  Settings,
  Song,
  TrackedNote,
} from './types';

export type EngineListener = (event: EngineEvent) => void;

/**
 * Game engine: owns the song clock, note states and scoring. It is deliberately
 * free of React so the timing/scoring logic can be unit tested, and so the
 * render loop never triggers a React re-render per frame.
 */
export class PianoGameEngine {
  private readonly clock: SongClock;
  private tracked: TrackedNote[] = [];
  private score: Score;
  private phase: GamePhase = 'idle';

  constructor(
    private readonly song: Song,
    private readonly getSettings: () => Settings,
    private readonly audio: PianoAudio,
    private readonly onEvent: EngineListener,
  ) {
    this.clock = new SongClock(song.bpm);
    this.score = emptyScore(song.notes.length);
  }

  get state(): { phase: GamePhase; score: Score; tracked: TrackedNote[] } {
    return { phase: this.phase, score: this.score, tracked: this.tracked };
  }

  start(nowMs: number) {
    this.tracked = this.song.notes.map((note) => ({ note, status: 'pending', played: false }));
    this.score = emptyScore(this.song.notes.length);
    this.clock.start(nowMs);
    this.phase = 'running';
  }

  pause(nowMs: number) {
    if (this.phase !== 'running') return;
    this.clock.pause(nowMs);
    this.phase = 'paused';
    this.audio.stopAll();
  }

  resume(nowMs: number) {
    if (this.phase !== 'paused') return;
    this.clock.resume(nowMs);
    this.phase = 'running';
  }

  restart(nowMs: number) {
    this.audio.stopAll();
    this.start(nowMs);
  }

  /**
   * Advance the song clock. Called once per animation frame. Notes are played
   * as their start time is crossed, which keeps audio and visuals on the same
   * clock (no drift) and naturally stops while paused.
   */
  tick(nowMs: number) {
    if (this.phase !== 'running') return;

    const elapsed = this.clock.elapsedSeconds(nowMs);
    const secondsPerBeat = this.clock.secondsPerBeat(this.getSettings().tempoFactor);
    const window = hitWindowSeconds(
      this.getSettings().difficultyMode,
      this.getSettings().tempoFactor,
    );

    for (const item of this.tracked) {
      const startSeconds = item.note.startBeat * secondsPerBeat;
      const endSeconds = startSeconds + item.note.durationBeats * secondsPerBeat;

      // Sound each note once as its start time is crossed. In auto-play mode the
      // melody also sounds on its own so a child can follow the falling notes.
      if (!item.played && elapsed >= startSeconds) {
        if (item.status === 'pending' || this.getSettings().autoPlayMelody) {
          this.audio.playNote(item.note.midi, Math.max(0.15, endSeconds - elapsed), 0, 0.7);
        }
        item.played = true;
      }

      // A note is missed once its hit window has passed without a tap.
      if (item.status === 'pending' && elapsed > startSeconds + window) {
        item.status = 'missed';
        this.score.missed += 1;
        this.onEvent({ type: 'missed', midi: item.note.midi, noteIndex: this.indexOfNote(item) });
      }
    }

    if (elapsed >= songDurationSeconds(this.song, this.getSettings().tempoFactor)) {
      this.finish();
    }
  }

  /**
   * Handle a key press. During playback a tap inside the hit window of the
   * right note scores; anything else is counted as an incorrect tap but the
   * song keeps playing (non-punitive). Outside playback every tap is free play.
   */
  tap(midi: number, nowMs: number): HitResult {
    if (this.phase !== 'running') {
      this.audio.playNote(midi, 0.6);
      this.onEvent({ type: 'free', midi });
      return 'free';
    }

    const elapsed = this.clock.elapsedSeconds(nowMs);
    const secondsPerBeat = this.clock.secondsPerBeat(this.getSettings().tempoFactor);
    const window = hitWindowSeconds(
      this.getSettings().difficultyMode,
      this.getSettings().tempoFactor,
    );

    const target = this.tracked.find(
      (item) =>
        item.status === 'pending' &&
        item.note.midi === midi &&
        Math.abs(elapsed - item.note.startBeat * secondsPerBeat) <= window,
    );

    if (target) {
      target.status = 'hit';
      this.score.correct += 1;
      if (!target.played) {
        this.audio.playNote(midi, Math.max(0.2, target.note.durationBeats * secondsPerBeat));
        target.played = true;
      }
      this.onEvent({ type: 'hit', midi, noteIndex: this.indexOfNote(target) });
      return 'correct';
    }

    this.score.incorrect += 1;
    this.audio.playNote(midi, 0.4, 0, 0.5);
    this.onEvent({ type: 'incorrect', midi });
    return 'incorrect';
  }

  /** Seconds elapsed for the render loop. */
  elapsed(nowMs: number): number {
    return this.clock.elapsedSeconds(nowMs);
  }

  private finish() {
    if (this.phase === 'finished') return;
    this.phase = 'finished';
    const stars = starsForScore(this.score);
    this.onEvent({ type: 'finished', stars });
  }

  private indexOfNote(item: TrackedNote): number {
    return this.song.notes.indexOf(item.note);
  }
}
