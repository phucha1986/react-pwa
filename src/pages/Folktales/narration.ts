import { NARRATOR_PRESET } from './stories';

/** Voice AI backend. Override with VITE_VOICE_AI_API if it runs elsewhere. */
export const API_BASE = import.meta.env.VITE_VOICE_AI_API ?? 'http://localhost:8000';

export type VoiceJob = {
  id: string;
  text: string;
  voice_id: string;
  voice_preset: string | null;
  status: string;
  duration_seconds: number | null;
};

/** Newest finished Mỹ Duyên narration whose text contains `marker`, or null. */
export async function loadNarration(marker: string): Promise<VoiceJob | null> {
  try {
    const res = await fetch(`${API_BASE}/jobs?limit=50`);
    if (!res.ok) return null;
    const jobs = (await res.json()) as VoiceJob[];
    return (
      jobs.find(
        (j) => j.status === 'done' && j.voice_preset === NARRATOR_PRESET && j.text.includes(marker),
      ) ?? null
    );
  } catch {
    return null;
  }
}
