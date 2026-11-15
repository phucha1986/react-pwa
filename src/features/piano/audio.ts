import { midiToFrequency } from './midi';

/**
 * Piano-like synthesis built on the Web Audio API. No samples are downloaded,
 * so the game works offline and needs no licensed assets.
 *
 * Signal chain: per-note voice bus (lowpass + stereo pan) -> master gain ->
 * gentle limiter -> speakers, with a parallel procedural-room reverb send.
 *
 * A single AudioContext is reused for the whole app. Browsers only allow it to
 * start after a user gesture, so `ensure()` is called from click/tap handlers
 * and resumes a suspended context.
 */
export class PianoAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private reverb: ConvolverNode | null = null;
  private reverbSend: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
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
        // Gentle limiter: chords of many partial-rich notes must not clip.
        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.value = -18;
        this.limiter.knee.value = 8;
        this.limiter.ratio.value = 3;
        this.limiter.attack.value = 0.004;
        this.limiter.release.value = 0.3;
        this.master.connect(this.limiter);
        this.limiter.connect(this.ctx.destination);
        // Procedural "room": a decaying-noise impulse response gives the bare
        // synth a sense of space without any downloaded asset.
        this.reverb = this.ctx.createConvolver();
        this.reverb.buffer = this.makeImpulseResponse(this.ctx);
        this.reverbSend = this.ctx.createGain();
        this.reverbSend.gain.value = 0.16;
        this.reverbSend.connect(this.reverb);
        this.reverb.connect(this.limiter);
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
   * - INHARMONICITY: real piano strings are stiff, so overtones sit slightly
   *   sharp of exact multiples. The resulting beating between close partials
   *   is a large part of the piano's acoustic signature;
   * - a per-note lowpass whose cutoff falls over the note's life: struck
   *   strings lose brightness long before they lose volume;
   * - a short filtered-noise burst on the attack (key/hammer noise) on top of
   *   the low-frequency hammer thump;
   * - a tiny deterministic per-pitch tuning wobble plus a per-note dynamic
   *   variation, since real pianos are neither perfectly equal-tempered nor
   *   identically struck every time;
   * - notes are panned slightly by pitch (bass left, treble right) and feed a
   *   small procedural-room reverb send, so chords open up instead of
   *   collapsing to a mono point.
   */
  playNote(midi: number, durationSeconds: number, when = 0, gain = 0.8) {
    const ctx = this.ensure();
    if (!ctx || !this.master || !this.reverbSend) return;

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

    // Stiff-string inharmonicity: partial n is sharp by ~B*n^2 (inharmonicity
    // coefficient B grows with pitch; piano bass strings are the most extreme).
    // Kept small so intervals still sound in tune, but close partials beat.
    const B = 0.0004 + 0.0012 * register;
    const partialRatio = (n: number) => n * Math.sqrt(1 + B * n * n);

    // Per-note voice bus: everything for this strike shares one lowpass and one
    // pan position, which is both cheaper and more coherent than filtering each
    // partial separately.
    const bus = ctx.createGain();
    bus.gain.value = 1;
    // Notes spread slightly across the stereo field by pitch, like a real
    // keyboard. Older browsers without StereoPannerNode stay centred.
    const panner: AudioNode = ctx.createStereoPanner
      ? (() => {
          const p = ctx.createStereoPanner();
          p.pan.value = 0.3 * (register - 0.5) * 2;
          return p;
        })()
      : ctx.createGain();
    panner.connect(bus);
    const brightness = ctx.createBiquadFilter();
    brightness.type = 'lowpass';
    // Hard strikes open brighter; the cutoff then falls toward a dull sustain.
    const openHz = Math.min(16000, tuned * (6 + 10 * gain) + 1500);
    const closeHz = Math.min(openHz, Math.max(tuned * 3, 900));
    brightness.frequency.setValueAtTime(openHz, startTime);
    brightness.frequency.exponentialRampToValueAtTime(
      closeHz,
      startTime + Math.min(1.2, 0.25 + durationSeconds * 0.6),
    );
    brightness.Q.value = 0.4;
    brightness.connect(bus);
    bus.connect(this.master);
    // A touch of the voice feeds the room; higher notes get slightly more wet.
    const wet = ctx.createGain();
    wet.gain.value = 0.1 + 0.12 * register;
    bus.connect(wet);
    wet.connect(this.reverbSend);

    // Fundamental plus overtones. `tail` scales each partial's decay: the
    // fundamental sustains longest, upper partials fade out sooner, which is
    // what gives a struck string its warm tail instead of a uniform synth pad.
    const partials: { n: number; level: number; tail: number }[] = [
      { n: 1, level: 1, tail: 1 },
      { n: 2, level: 0.3 + 0.14 * register, tail: 0.72 },
      { n: 3, level: 0.15, tail: 0.5 },
      { n: 4, level: 0.06 + 0.06 * register, tail: 0.4 },
      { n: 5, level: 0.035, tail: 0.3 },
    ];

    const sources: { src: AudioScheduledSourceNode; gain: GainNode; prestarted: boolean }[] = [];
    for (const p of partials) {
      const peak = loud * p.level;
      const node = this.tone(ctx, tuned * partialRatio(p.n), 'sine', peak, brightness);
      this.envelope(node.gain, startTime, peak, durationSeconds * p.tail);
      sources.push({ src: node.osc, gain: node.gain, prestarted: false });
    }

    // Felt-hammer strike: a brief low impulse just under the fundamental.
    const thumpPeak = 0.5 * loud;
    const thump = this.tone(ctx, tuned * 0.5, 'sine', thumpPeak, brightness);
    this.envelope(thump.gain, startTime, thumpPeak, durationSeconds * 0.18);
    sources.push({ src: thump.osc, gain: thump.gain, prestarted: false });

    // Key/hammer noise: a very short band-passed burst. Deterministic per
    // pitch (same slice of the shared noise buffer) so repeated strikes match.
    const noiseBuf = this.getNoise(ctx);
    if (noiseBuf) {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      noise.loop = true;
      const offset = (midi * 0.0173) % 1.5;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = Math.min(9000, Math.max(1200, tuned * 4));
      noiseFilter.Q.value = 0.7;
      const noiseGain = ctx.createGain();
      const noisePeak = 0.12 * loud;
      noiseGain.gain.setValueAtTime(0.0001, startTime);
      noiseGain.gain.linearRampToValueAtTime(noisePeak, startTime + 0.002);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.06);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(panner);
      noise.start(startTime, offset);
      noise.stop(startTime + 0.1);
      sources.push({ src: noise, gain: noiseGain, prestarted: true });
    }

    for (const node of sources) {
      if (!node.prestarted) node.src.start(startTime);
      node.src.stop(startTime + durationSeconds + 0.6);
    }

    const voice = {
      stop: (whenToStop: number) => {
        for (const node of sources) {
          try {
            node.src.stop(Math.max(whenToStop, ctx.currentTime));
          } catch {
            /* already stopped */
          }
        }
      },
    };
    this.active.add(voice);
    let finished = 0;
    for (const node of sources) {
      node.src.onended = () => {
        node.gain.disconnect();
        finished += 1;
        if (finished >= sources.length) {
          brightness.disconnect();
          bus.disconnect();
          wet.disconnect();
          panner.disconnect();
          this.active.delete(voice);
        }
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

  /**
   * Procedural room impulse response: exponentially decaying stereo noise.
   * Short (~1.3 s) and bright so it adds space without smearing fast runs.
   */
  private makeImpulseResponse(ctx: AudioContext): AudioBuffer {
    const seconds = 1.3;
    const rate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, Math.floor(rate * seconds), rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        const t = i / data.length;
        // Decay gets steeper over time (like absorption), and the first few
        // ms stay dense to keep a hint of early-reflection body.
        const envelope = Math.exp(-6 * t) * (t < 0.004 ? t / 0.004 : 1);
        data[i] = (Math.random() * 2 - 1) * envelope;
      }
    }
    return buffer;
  }

  /** Shared 2-second white noise buffer, created once per context. */
  private getNoise(ctx: AudioContext): AudioBuffer | null {
    if (this.noiseBuf) return this.noiseBuf;
    try {
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuf = buffer;
      return buffer;
    } catch {
      return null;
    }
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
      this.limiter?.disconnect();
      this.limiter = null;
      this.reverb?.disconnect();
      this.reverb = null;
      this.reverbSend?.disconnect();
      this.reverbSend = null;
      this.noiseBuf = null;
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
