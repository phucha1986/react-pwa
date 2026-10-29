const PREFERRED_VOICES: Record<string, string[]> = {
  en: ['Microsoft Hazel', 'Microsoft Aria', 'Microsoft Jenny', 'Google US English'],
  vi: ['Microsoft An', 'Microsoft My', 'Microsoft Linh', 'Microsoft Thu', 'Google Tiếng Việt'],
};

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

/**
 * Read a page out loud with a slow, friendly voice. `lang` picks the matching
 * voice when the browser has one. Calls `onEnd` when speech finishes (or
 * immediately if speech is unavailable).
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
      utterance.rate = 0.85;
      utterance.volume = 1;
      const pool = cachedVoices.filter((v) => v.lang.toLowerCase().startsWith(lang));
      const preferred = pool.length ? pool : cachedVoices;
      const match = (PREFERRED_VOICES[lang] ?? [])
        .map((name) => preferred.find((v) => v.name.toLowerCase() === name.toLowerCase()))
        .find(Boolean);
      if (match) utterance.voice = match;
      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onEnd?.();
      window.speechSynthesis.speak(utterance);
    });
  } catch {
    onEnd?.();
  }
};

/** Soft "page turn" blip played when the reader moves to the next panel. */
export const playPageTurnSound = () => {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    /* audio not available */
  }
};
