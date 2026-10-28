/** Difficulty levels change the timing window, hints and tempo. */
export type Difficulty = 'easy' | 'medium' | 'challenge';

/** A single note expressed in musical beats so tempo changes never break timing. */
export interface SongNote {
  /** MIDI note number (60 = C4). */
  midi: number;
  /** Beat offset from the start of the song (intro beats included). */
  startBeat: number;
  /** Duration in beats — drives note height on the canvas. */
  durationBeats: number;
}

export interface Song {
  id: string;
  /** i18n key used for the title. */
  titleKey: SongTitleKey;
  bpm: number;
  timeSignature: { beats: number; unit: number };
  difficulty: Difficulty;
  /** Lead-in beats before the first note, so the child can get ready. */
  introBeats: number;
  notes: SongNote[];
}

export type SongTitleKey =
  | 'songTwinkleTwinkle'
  | 'songMaryLamb'
  | 'songOdeToJoy'
  | 'songFrereJacques'
  | 'songRowYourBoat'
  | 'songHotCrossBuns'
  | 'songLondonBridge'
  | 'songFirstMelody';

export interface Settings {
  /** 0..1 master volume. */
  volume: number;
  muted: boolean;
  /** 1.0 = song tempo; lower values slow the song down without changing pitch. */
  tempoFactor: number;
  /** Player-selected difficulty mode (drives hit window + fall speed). */
  difficultyMode: Difficulty;
  showNoteNames: boolean;
  animations: boolean;
  /** When true the melody also sounds on its own, so a child can follow along. */
  autoPlayMelody: boolean;
}

export interface SongProgress {
  stars: number;
  bestAccuracy: number;
  completions: number;
  lastPlayedAt: number;
}

export type Progress = Record<string, SongProgress>;

export type NoteStatus = 'pending' | 'hit' | 'missed';

export interface TrackedNote {
  note: SongNote;
  status: NoteStatus;
  /** Whether the note has already sounded (auto-play or tap) — avoids double triggers. */
  played: boolean;
}

export interface Score {
  correct: number;
  incorrect: number;
  missed: number;
  total: number;
}

export type HitResult = 'correct' | 'incorrect' | 'free';

export type GamePhase = 'idle' | 'running' | 'paused' | 'finished';

export type EngineEvent =
  | { type: 'hit'; midi: number; noteIndex: number }
  | { type: 'missed'; midi: number; noteIndex: number }
  | { type: 'incorrect'; midi: number }
  | { type: 'free'; midi: number }
  | { type: 'finished'; stars: number };
