// Audio engine for the piano game.
// Creates more realistic piano-like sounds using multiple oscillators and filters

// Audio context (created on first use, so it's safe to import anywhere).
let audioContext: AudioContext | null = null;
export const getAudioContext = () => {
  if (!audioContext) {
    // Create a new audio context on user interaction (required by browsers).
    const onUserGesture = () => {
      audioContext = new window.AudioContext();
      window.removeEventListener('click', onUserGesture);
      window.removeEventListener('touchend', onUserGesture);
    };
    window.addEventListener('click', onUserGesture);
    window.addEventListener('touchend', onUserGesture);
  }
  return audioContext;
};

// Play a single note with a more realistic piano-like sound
export const playNote = (freq: number, delay = 0, vol = 1): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Create multiple oscillators to simulate a more complex piano sound
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();

  // Add a vibrato oscillator for more natural sound
  const vibratoOsc = ctx.createOscillator();
  const vibratoGain = ctx.createGain();

  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const filter2 = ctx.createBiquadFilter();

  // Set up oscillators with different waveforms and frequencies for a richer sound
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc3.type = 'sine';

  // Create slight detuning to make it more natural (piano-like)
  const baseFreq = freq;
  osc1.frequency.value = baseFreq * 0.5; // Octave below
  osc2.frequency.value = baseFreq; // Base frequency
  osc3.frequency.value = baseFreq * 1.5; // Octave above

  // Add slight detuning to make it sound more natural (piano-like)
  osc1.detune.value = -10; // -10 cents (slightly flat)
  osc2.detune.value = 0;
  osc3.detune.value = 8; // +8 cents (slightly sharp)

  // Set up vibrato oscillator
  vibratoOsc.type = 'sine';
  vibratoOsc.frequency.value = 5; // 5 Hz vibrato
  vibratoGain.gain.value = 0.5; // Small amount of vibrato

  // Connect vibrato to frequency of main oscillators
  vibratoOsc.connect(vibratoGain);
  vibratoGain.connect(osc1.frequency);
  vibratoGain.connect(osc2.frequency);
  vibratoGain.connect(osc3.frequency);

  // Set up filter to simulate piano sound characteristics (more realistic lowpass)
  filter.type = 'lowpass';
  filter.frequency.value = 3000; // Lower cutoff for more piano-like sound
  filter.Q.value = 1;

  // Additional high-pass filter to remove very low frequencies
  filter2.type = 'highpass';
  filter2.frequency.value = 50;
  filter2.Q.value = 1;

  // Set up gain envelope for a more natural piano attack and decay
  gain.gain.value = 0;
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol * 0.3, ctx.currentTime + delay + 0.01); // Fast attack
  gain.gain.linearRampToValueAtTime(vol * 0.2, ctx.currentTime + delay + 0.05); // Sustain
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + 0.3); // Release

  // Connect the oscillators to the filter and then to the output
  osc1.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  filter.connect(filter2);
  filter2.connect(gain);
  gain.connect(ctx.destination);

  // Start and stop the oscillators
  osc1.start(ctx.currentTime + delay);
  osc2.start(ctx.currentTime + delay);
  osc3.start(ctx.currentTime + delay);
  vibratoOsc.start(ctx.currentTime + delay);

  osc1.stop(ctx.currentTime + delay + 0.3);
  osc2.stop(ctx.currentTime + delay + 0.3);
  osc3.stop(ctx.currentTime + delay + 0.3);
  vibratoOsc.stop(ctx.currentTime + delay + 0.3);
};

// Play a chord (multiple notes at once) with piano-like characteristics
export const playPad = (
  freqs: number[],
  dur = 1.8,
  delay = 0,
  vol = 1,
): { gains: GainNode[]; oscs: AudioScheduledSourceNode[] } => {
  const ctx = getAudioContext();
  if (!ctx) return { gains: [], oscs: [] };

  const gains: GainNode[] = [];
  const oscs: AudioScheduledSourceNode[] = [];

  // Create a more complex chord sound with multiple oscillators
  for (const freq of freqs) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Use different waveforms for the chord to make it more rich and piano-like
    osc.type = 'sine';

    // Add slight detuning to make it sound more natural
    osc.frequency.value = freq;
    gain.gain.value = 0;

    // Create a smooth attack and release for chord
    const now = ctx.currentTime + delay;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol * 0.1, now + 0.1); // Fast attack
    gain.gain.linearRampToValueAtTime(vol * 0.05, now + dur - 0.2); // Sustain
    gain.gain.linearRampToValueAtTime(0, now + dur); // Release

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + dur);

    gains.push(gain);
    oscs.push(osc);
  }

  return { gains, oscs };
};

// Improved piano sound with more realistic characteristics
export const playPianoNote = (freq: number, delay = 0, vol = 1): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Create multiple oscillators to simulate a more complex piano sound
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();

  // Add noise for more realistic sound
  const noise = ctx.createBufferSource();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  noise.buffer = noiseBuffer;
  noise.loop = true;

  // Add a vibrato oscillator for more natural sound
  const vibratoOsc = ctx.createOscillator();
  const vibratoGain = ctx.createGain();

  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const filter2 = ctx.createBiquadFilter();
  const noiseFilter = ctx.createBiquadFilter();

  // Set up oscillators with different waveforms and frequencies for a richer sound
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc3.type = 'sine';

  // Create slight detuning to make it more natural (piano-like)
  const baseFreq = freq;
  osc1.frequency.value = baseFreq * 0.5; // Octave below
  osc2.frequency.value = baseFreq; // Base frequency
  osc3.frequency.value = baseFreq * 1.5; // Octave above

  // Add slight detuning to make it sound more natural (piano-like)
  osc1.detune.value = -10; // -10 cents (slightly flat)
  osc2.detune.value = 0;
  osc3.detune.value = 8; // +8 cents (slightly sharp)

  // Set up vibrato oscillator
  vibratoOsc.type = 'sine';
  vibratoOsc.frequency.value = 5; // 5 Hz vibrato
  vibratoGain.gain.value = 0.2; // Small amount of vibrato

  // Connect vibrato to frequency of main oscillators
  vibratoOsc.connect(vibratoGain);
  vibratoGain.connect(osc1.frequency);
  vibratoGain.connect(osc2.frequency);
  vibratoGain.connect(osc3.frequency);

  // Set up filters for more realistic piano sound
  filter.type = 'lowpass';
  filter.frequency.value = 3000; // Lower cutoff for more piano-like sound
  filter.Q.value = 1;

  // Additional high-pass filter to remove very low frequencies
  filter2.type = 'highpass';
  filter2.frequency.value = 50;
  filter2.Q.value = 1;

  // Noise filter
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 800;
  noiseFilter.Q.value = 1;

  // Set up gain envelope for a more natural piano attack and decay
  gain.gain.value = 0;
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol * 0.3, ctx.currentTime + delay + 0.01); // Fast attack
  gain.gain.linearRampToValueAtTime(vol * 0.2, ctx.currentTime + delay + 0.05); // Sustain
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + 0.3); // Release

  // Connect the oscillators and noise to the filters and then to the output
  osc1.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  noise.connect(noiseFilter);
  noiseFilter.connect(gain);
  filter.connect(filter2);
  filter2.connect(gain);
  gain.connect(ctx.destination);

  // Start and stop the oscillators and noise
  osc1.start(ctx.currentTime + delay);
  osc2.start(ctx.currentTime + delay);
  osc3.start(ctx.currentTime + delay);
  vibratoOsc.start(ctx.currentTime + delay);
  noise.start(ctx.currentTime + delay);

  osc1.stop(ctx.currentTime + delay + 0.3);
  osc2.stop(ctx.currentTime + delay + 0.3);
  osc3.stop(ctx.currentTime + delay + 0.3);
  vibratoOsc.stop(ctx.currentTime + delay + 0.3);
  noise.stop(ctx.currentTime + delay + 0.3);
};
