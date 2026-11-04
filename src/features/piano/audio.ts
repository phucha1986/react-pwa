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
   *
   * The timbre aims at an acoustic grand piano rather a plain synth:
   * - a partial stack (fundamental + overtones) whose upper harmonics grow
   *   with the register, so low notes have body and high notes are brighter;
   * - a short low-frequency "hammer thump" on the attack for the felt strike;
   * - a real attack/decay envelope (overshoot, settle, long soft tail) wired
   *   through the oscillator chain so notes swell then fade like a struck
   *   string, instead of popping on and off;
   * - a tiny deterministic per-pitch tuning wobble, since real pianos are not
   *   perfectly equal-tempered.
   */
  playNote(midi: number, durationSeconds: number, when = 0, gain = 0.8) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;

    const startTime = when > 0 ? Math.max(when, ctx.currentTime) : ctx.currentTime;
    const freq = midiToFrequency(midi);

    // Deterministic tuning wobble (-2.4..+2.4 cents) so repeated strikes of the
    // same key match, but the row does not sound like one cloned synth pad.
    const cents = (((midi * 7) % 9) - 4) * 0.6;
    const tuned = freq * Math.pow(2, cents / 1200);

    // 0 at the low end, 1 at the high end of the playable range.
    const register = Math.min(1, Math.max(0, (midi - 48) / 36));

    const voiceGain = ctx.createGain();
    voiceGain.connect(this.master);

    // Dynamic: a harder strike is louder and opens the upper partials.
    const loud = 0.26 + 0.14 * gain;

    // Envelope: hammer-like overshoot, quick settle, then a long natural decay
    // where the fundamental sustains and fades out slowly.
    voiceGain.gain.setValueAtTime(0.0001, startTime);
    voiceGain.gain.linearRampToValueAtTime(loud * 1.18, startTime + 0.006);
    voiceGain.gain.exponentialRampToValueAtTime(loud * 0.55, startTime + 0.12);
    voiceGain.gain.exponentialRampToValueAtTime(loud * 0.16, startTime + durationSeconds * 0.6);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds + 0.4);

    const releaseAt = startTime + durationSeconds + 0.45;

    // Fundamental plus overtones; upper partials are quieter and brighter with
    // register. All route through voiceGain so the envelope above actually
    // shapes them (the previous wiring bypassed it, leaving notes unenveloped).
    const partials: { ratio: number; level: number }[] = [
      { ratio: 1, level: 1 },
      { ratio: 2, level: 0.3 + 0.14 * register },
      { ratio: 3, level: 0.15 },
      { ratio: 4, level: 0.06 + 0.06 * register },
      { ratio: 5, level: 0.035 },
    ];

    // Every partial feeds voiceGain, so the envelope above shapes the whole
    // stack (attack/decay) instead of the partials popping straight to master.
    const oscillators = partials.map((p) =>
      this.tone(ctx, tuned * p.ratio, 'sine', p.level, voiceGain),
    );

    // Felt-hammer strike: a brief low impulse just under the fundamental.
    const thump = this.tone(ctx, tuned * 0.5, 'sine', 0.5 * loud, voiceGain);
    oscillators.push(thump);

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

  /** Build one oscillator->gain chain feeding `dest` (defaults to the master). */
  private tone(
    ctx: AudioContext,
    freq: number,
    type: OscillatorType,
    level: number,
    dest: GainNode = this.master!,
  ) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = level;
    osc.connect(g);
    g.connect(dest);
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
