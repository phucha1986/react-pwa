let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (ctx: AudioContext, freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
};

/** Happy ascending arpeggio for a correct answer. */
export const playSuccessSound = () => {
  try {
    const ctx = getCtx();
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => playTone(ctx, freq, i * 0.12, 0.35));
  } catch {
    /* audio not available */
  }
};

/** Short low "boop" for a wrong answer. */
export const playWrongSound = () => {
  try {
    const ctx = getCtx();
    playTone(ctx, 196, 0, 0.2, 'triangle');
    playTone(ctx, 147, 0.15, 0.25, 'triangle');
  } catch {
    /* audio not available */
  }
};

const FEMALE_VOICE_HINTS =
  /female|woman|hazel|susan|libby|sonia|maisie|emma|abi|jenny|aria|ana|mia|zira|samantha|salli|google us english/i;
const MALE_VOICE_HINTS = /male|man|george|ryan|thomas|brian|david|james|guy|eric|christopher/i;

/** Pick a friendly female ("lady") voice when available, preferring English. */
const pickLadyVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const pool = english.length ? english : voices;
  return (
    pool.find((v) => FEMALE_VOICE_HINTS.test(v.name) && !MALE_VOICE_HINTS.test(v.name)) || null
  );
};

/**
 * Speak a phrase with a slow, friendly female voice.
 * Calls `onEnd` when the speech finishes (or immediately if speech is unavailable).
 */
export const speak = (text: string, onEnd?: () => void) => {
  try {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.1;
    utterance.rate = 0.85; // slow, clear delivery
    utterance.volume = 1;
    const ladyVoice = pickLadyVoice();
    if (ladyVoice) utterance.voice = ladyVoice;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
  } catch {
    onEnd?.();
  }
};
