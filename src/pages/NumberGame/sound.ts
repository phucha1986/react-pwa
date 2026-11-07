let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  const ac = getCtx();
  const now = ac.currentTime + start;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(vol, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  gain.connect(ac.destination);

  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

/** Soft, friendly click when a tile is tapped. */
export function playTap() {
  tone(500, 0, 0.07, 'sine', 0.14);
}

/** Bright, happy rising arpeggio when the right number is touched. */
export function playCorrect() {
  tone(523.25, 0, 0.16, 'triangle', 0.32);
  tone(659.25, 0.1, 0.16, 'triangle', 0.32);
  tone(783.99, 0.2, 0.16, 'triangle', 0.34);
  tone(1046.5, 0.3, 0.3, 'triangle', 0.34);
}

/** Gentle, non-scary "oops" when the wrong number is touched. */
export function playWrong() {
  tone(300, 0, 0.16, 'sine', 0.22);
  tone(240, 0.14, 0.22, 'sine', 0.22);
}

/** Little sparkle chime that plays alongside a correct tap. */
export function playSparkle() {
  tone(1318.5, 0.05, 0.12, 'sine', 0.18);
  tone(1567.98, 0.12, 0.12, 'sine', 0.16);
}

/** Celebratory fanfare when a kid clears a round milestone. */
export function playWin() {
  const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => tone(n, i * 0.12, 0.32, 'triangle', 0.3));
}

/** Speak a phrase aloud for the kid (Web Speech API). No-op if unsupported. */
const voiceCache: Record<string, SpeechSynthesisUtterance['voice'] | null> = {};

function pickVoice(lang: 'en' | 'vi'): SpeechSynthesisUtterance['voice'] | null {
  if (lang in voiceCache) return voiceCache[lang];
  const voices = window.speechSynthesis.getVoices();
  // Prefer a voice tagged with the language, then fall back to any available voice.
  const wanted = lang === 'vi' ? /^vi/i : /^en/i;
  const match = voices.find((v) => wanted.test(v.lang)) ?? voices[0] ?? null;
  voiceCache[lang] = match;
  return match;
}

export function speak(text: string, lang: 'en' | 'vi') {
  const synth = window.speechSynthesis;
  if (!synth) return;
  // Drop anything still queued so rounds don't stack up.
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;
  utter.lang = lang;
  utter.rate = 0.85;
  utter.pitch = 1.15;
  utter.volume = 1;
  synth.speak(utter);
}
