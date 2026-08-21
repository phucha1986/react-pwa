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

const playTone = (
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  endFreq?: number,
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + start + duration);
  }
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

/** Descending "ahh oh" sigh for a wrong answer. */
export const playWrongSound = () => {
  try {
    const ctx = getCtx();
    playTone(ctx, 330, 0, 0.3, 'sine', 220);
    playTone(ctx, 220, 0.3, 0.45, 'sine', 147);
  } catch {
    /* audio not available */
  }
};

/** Known female voices, tried in order for each language. */
const PREFERRED_FEMALE_VOICES: Record<string, string[]> = {
  en: [
    'Microsoft Hazel',
    'Microsoft Susan',
    'Microsoft Aria',
    'Microsoft Jenny',
    'Microsoft Zira',
    'Microsoft Samantha',
    'Microsoft Ana',
    'Google US English',
  ],
  vi: [
    'Microsoft An',
    'Microsoft My',
    'Microsoft Linh',
    'Microsoft Thu',
    'Microsoft Trang',
    'Microsoft Mai',
  ],
};

const FEMALE_VOICE_HINTS =
  /\b(female|woman|hazel|susan|libby|sonia|maisie|emma|abi|jenny|aria|ana|mia|zira|samantha|salli|amy|an|my|linh|thu|trang|mai)\b/i;
const MALE_VOICE_HINTS =
  /\b(male|man|george|ryan|thomas|brian|david|james|guy|eric|christopher|huy|daniel|mark|paul)\b/i;

let cachedVoices: SpeechSynthesisVoice[] = [];

/** Resolve once the browser has finished loading its voice list. */
const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  const synth = window.speechSynthesis;
  cachedVoices = synth.getVoices();
  if (cachedVoices.length) return Promise.resolve(cachedVoices);
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(cachedVoices), 1500);
    synth.addEventListener(
      'voiceschanged',
      () => {
        cachedVoices = synth.getVoices();
        clearTimeout(timeout);
        resolve(cachedVoices);
      },
      { once: true },
    );
  });
};

/** Pick a friendly female ("lady") voice, preferring the requested language. */
const pickLadyVoice = (lang: string): SpeechSynthesisVoice | null => {
  const preferred = cachedVoices.filter((v) => v.lang.toLowerCase().startsWith(lang));
  const pool = preferred.length ? preferred : cachedVoices;
  for (const name of PREFERRED_FEMALE_VOICES[lang] ?? []) {
    const match = pool.find((v) => v.name.toLowerCase() === name.toLowerCase());
    if (match) return match;
  }
  return (
    pool.find((v) => FEMALE_VOICE_HINTS.test(v.name) && !MALE_VOICE_HINTS.test(v.name)) ||
    pool[0] ||
    null
  );
};

/**
 * Speak a phrase with a slow, friendly female voice.
 * `lang` (e.g. 'en' or 'vi') selects the matching voice when available.
 * Calls `onEnd` when the speech finishes (or immediately if speech is unavailable).
 */
export const speak = (text: string, onEnd?: () => void, lang = 'en') => {
  try {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    void loadVoices().then(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
      utterance.pitch = 1.1;
      utterance.rate = 0.85; // slow, clear delivery
      utterance.volume = 1;
      const ladyVoice = pickLadyVoice(lang);
      if (ladyVoice) utterance.voice = ladyVoice;
      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onEnd?.();
      window.speechSynthesis.speak(utterance);
    });
  } catch {
    onEnd?.();
  }
};
