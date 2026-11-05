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
   * The timbre aims at an acoustic grand piano rather than a plain synth:
   * - a partial stack (fundamental + overtones) whose upper harmonics grow
   *   with the register, so low notes have body and high notes are brighter;
   * - each partial carries its OWN attack/decay envelope, and upper partials
   *   decay faster than the fundamental, so a struck string blooms then leaves
   *   a warm, slowly-fading tail instead of one uniform pad;
   * - a short low-frequency "hammer thump" on the attack for the felt strike;
   * - a tiny deterministic per-pitch tuning wobble plus a per-note dynamic
   *   variation, since real pianos are neither perfectly equal-tempered nor
   *   identically struck every time.
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

    // Deterministic per-pitch dynamic variation (0.9..1.0) so the same note
    // struck again is not a byte-identical clone, but repeated strikes match.
    const dyn = 0.9 + 0.1 * (((midi * 13) % 7) / 6);

    // Dynamic: a harder strike is louder and opens the upper partials.
    const loud = (0.26 + 0.14 * gain) * dyn;

    // Fundamental plus overtones. `tail` scales each partial's decay: the
    // fundamental sustains longest, upper partials fade out sooner, which is
    // what gives a struck string its warm tail instead of a uniform synth pad.
    const partials: { ratio: number; level: number; tail: number }[] = [
      { ratio: 1, level: 1, tail: 1 },
      { ratio: 2, level: 0.3 + 0.14 * register, tail: 0.72 },
      { ratio: 3, level: 0.15, tail: 0.5 },
      { ratio: 4, level: 0.06 + 0.06 * register, tail: 0.4 },
      { ratio: 5, level: 0.035, tail: 0.3 },
    ];

    const nodes: { osc: OscillatorNode; gain: GainNode }[] = [];
    for (const p of partials) {
      const peak = loud * p.level;
      const node = this.tone(ctx, tuned * p.ratio, 'sine', peak, this.master);
      this.envelope(node.gain, startTime, peak, durationSeconds * p.tail);
      nodes.push(node);
    }

    // Felt-hammer strike: a brief low impulse just under the fundamental.
    const thumpPeak = 0.5 * loud;
    const thump = this.tone(ctx, tuned * 0.5, 'sine', thumpPeak, this.master);
    this.envelope(thump.gain, startTime, thumpPeak, durationSeconds * 0.18);
    nodes.push(thump);

    for (const node of nodes) {
      node.osc.start(startTime);
      node.osc.stop(startTime + durationSeconds + 0.6);
    }

    const voice = {
      stop: (whenToStop: number) => {
        for (const node of nodes) {
          try {
            node.osc.stop(Math.max(whenToStop, ctx.currentTime));
          } catch {
            /* already stopped */
          }
        }
      },
    };
    this.active.add(voice);
    for (const node of nodes) {
      node.osc.onended = () => {
        node.gain.disconnect();
        if (node.osc === nodes[0].osc) this.active.delete(voice);
      };
    }
  }

  /**
   * Apply a piano-like attack/decay to one partial's gain node: a fast bloom,
   * a quick settle, then a long soft tail whose length is `tailSeconds`. Upper
   * partials get a shorter `tailSeconds` so they fade before the fundamental.
   */
  private envelope(gain: GainNode, start: number, peak: number, tailSeconds: number) {
    const settle = peak * 0.6;
    const mid = peak * 0.14;
    const g = gain.gain;
    g.setValueAtTime(0.0001, start);
    g.linearRampToValueAtTime(peak, start + 0.004);
    g.exponentialRampToValueAtTime(settle, start + 0.09);
    g.exponentialRampToValueAtTime(mid, start + 0.12 + tailSeconds * 0.55);
    g.exponentialRampToValueAtTime(0.0001, start + 0.12 + tailSeconds + 0.4);
  }

  /** Build one oscillator->gain chain feeding `dest` (defaults to the master). */
  private tone(
    ctx: AudioContext,
    freq: number,
    type: OscillatorType,
    level: number,
    dest: GainNode = this.master!,
  ): { osc: OscillatorNode; gain: GainNode } {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = level;
    osc.connect(gain);
    gain.connect(dest);
    return { osc, gain };
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
