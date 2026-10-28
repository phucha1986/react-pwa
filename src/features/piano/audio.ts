import { midiToFrequency } from './midi';

/**
 * Piano-like synthesis built on the Web Audio API. No samples are downloaded,
 * so the game works offline and needs no licensed assets.
 *
 * A single AudioContext is reused for the whole app. Browsers only allow it to
 * start after a user gesture, so `ensure()` is called from click/tap handlers
 * and resumes a suspended context.
 */
export class PianoAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private active = new Set<{ stop: (when: number) => void }>();
  private volume = 0.6;
  private muted = false;

  /** Create/resume the context. Must be called from a user gesture. */
  ensure(): AudioContext | null {
    try {
      if (!this.ctx) {
        const Ctor: typeof AudioContext | undefined =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return null;
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : this.volume;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      // Audio is unavailable (blocked by policy or unsupported) — the game
      // still runs visually, so callers must tolerate a null context.
      return null;
    }
  }

  setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.02);
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.02);
    }
  }

  /**
   * Play one note. `when` is an absolute AudioContext time, which keeps
   * scheduled notes aligned with the song clock even when the tab is busy.
   */
  playNote(midi: number, durationSeconds: number, when = 0, gain = 0.8) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;

    const startTime = when > 0 ? Math.max(when, ctx.currentTime) : ctx.currentTime;
    const freq = midiToFrequency(midi);

    const voiceGain = ctx.createGain();
    voiceGain.connect(this.master);

    // Pleasant piano-ish attack/decay: fast attack, exponential decay, soft release.
    const peak = 0.32 * gain;
    voiceGain.gain.setValueAtTime(0.0001, startTime);
    voiceGain.gain.linearRampToValueAtTime(peak, startTime + 0.012);
    voiceGain.gain.exponentialRampToValueAtTime(
      peak * 0.35,
      startTime + Math.min(0.4, durationSeconds),
    );
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds + 0.05);

    const oscillators = [
      this.tone(ctx, freq, 'triangle', 1),
      this.tone(ctx, freq * 2, 'sine', 0.22),
      this.tone(ctx, freq * 3, 'sine', 0.08),
    ];

    const releaseAt = startTime + durationSeconds + 0.06;
    for (const osc of oscillators) {
      osc.start(startTime);
      osc.stop(releaseAt);
    }

    const voice = {
      stop: (whenToStop: number) => {
        for (const osc of oscillators) {
          try {
            osc.stop(Math.max(whenToStop, ctx.currentTime));
          } catch {
            /* already stopped */
          }
        }
      },
    };
    this.active.add(voice);
    for (const osc of oscillators) {
      osc.onended = () => {
        if (osc === oscillators[0]) this.active.delete(voice);
        voiceGain.disconnect();
      };
    }
  }

  private tone(ctx: AudioContext, freq: number, type: OscillatorType, level: number) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = level;
    osc.connect(g);
    g.connect(this.master!);
    return osc;
  }

  /** Stop every sounding note (used on restart / unmount to avoid leaks). */
  stopAll() {
    if (!this.ctx) return;
    for (const voice of this.active) voice.stop(this.ctx.currentTime);
    this.active.clear();
  }

  /** Release the context; called on unmount so nothing leaks between games. */
  dispose() {
    this.stopAll();
    if (this.ctx) {
      this.master?.disconnect();
      this.master = null;
      void this.ctx.close().catch(() => undefined);
      this.ctx = null;
    }
  }

  get state(): AudioContext['state'] | 'unavailable' {
    return this.ctx?.state ?? 'unavailable';
  }
}

/** Shared engine instance so volume/mute settings apply app-wide. */
export const pianoAudio = new PianoAudio();
