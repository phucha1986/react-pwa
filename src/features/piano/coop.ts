import { buildKeyLayout } from './keyboard';
import type { Song, SongNote } from './types';

/**
 * Co-op (two devices, one song) — fully client-side, no server.
 *
 * The invite code is derived deterministically from the song id, so a guest who
 * types the host's code can resolve the exact same song on their own device.
 * Both devices then run the identical deterministic engine and start together
 * via a shared countdown. The single piano is split by pitch range: the host
 * device shows the lower register (left half of the keyboard) and the guest the
 * upper register (right half), so placing the two devices side by side forms one
 * continuous keyboard and each device only ever sees the notes in its own range.
 */

export type CoopSide = 'host' | 'guest';

/**
 * Pitch ranges each side owns. The full song keyboard is C4..C5 (midi 60..72);
 * the host owns the lower register and the guest the upper register, split at
 * the octave so the two halves line up into one keyboard when the devices sit
 * next to each other (host on the left, guest on the right).
 */
export const COOP_HOST_RANGE = { low: 60, high: 65 }; // C4..F4
export const COOP_GUEST_RANGE = { low: 66, high: 72 }; // F#4..C5

export function coopRange(side: CoopSide): { low: number; high: number } {
  return side === 'host' ? COOP_HOST_RANGE : COOP_GUEST_RANGE;
}

/** Whether a note belongs to the given side's half of the keyboard. */
export function inCoopRange(midi: number, side: CoopSide): boolean {
  const { low, high } = coopRange(side);
  return midi >= low && midi <= high;
}

/**
 * The song as seen by one side: same id/title/tempo, but only the notes that
 * fall in that side's range. Feeding this to the engine means it tracks, scores
 * and sounds exactly the notes this device is responsible for.
 */
export function songForSide(song: Song, side: CoopSide): Song {
  return { ...song, notes: song.notes.filter((note) => inCoopRange(note.midi, side)) };
}

/** The visible keyboard for one side — its own half of the keys. */
export function coopKeyLayout(side: CoopSide): ReturnType<typeof buildKeyLayout> {
  const { low, high } = coopRange(side);
  return buildKeyLayout(low, high);
}

/**
 * Deterministic short invite code from a song id. Uses a stable FNV-1a hash
 * mapped onto an unambiguous alphabet (no 0/O/1/I) so a child can read and
 * retype it. The same song always yields the same code, and the guest resolves
 * the code back to the song by matching it against the known song ids.
 */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;

function hashSongId(songId: string): number {
  let hash = 0x811c9dc5; // FNV-1a 32-bit offset basis
  for (let i = 0; i < songId.length; i += 1) {
    hash ^= songId.charCodeAt(i);
    hash = (hash * 0x01000193) & 0xffffffff;
  }
  return hash >>> 0;
}

export function encodeCoopCode(songId: string): string {
  let hash = hashSongId(songId);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[hash % CODE_ALPHABET.length];
    hash = Math.floor(hash / CODE_ALPHABET.length);
  }
  return code;
}

/**
 * Resolve a typed code to a song id by matching it against the codes of the
 * known songs. Returns null when no song produces that code (typo / unknown).
 * Codes are case-insensitive to be forgiving for small fingers.
 */
export function decodeCoopCode(code: string, songIds: string[]): string | null {
  const normalized = code.trim().toUpperCase();
  for (const id of songIds) {
    if (encodeCoopCode(id) === normalized) return id;
  }
  return null;
}

/**
 * Countdown seconds before the song starts, shared by both sides so they begin
 * at the same logical moment. The host hits Start once the guest is ready; both
 * devices run this countdown and call engine.start on "GO".
 */
export const COOP_COUNTDOWN_SECONDS = 3;

/** Countdown label for a remaining-seconds value, shown on both devices. */
export function coopCountdownLabel(remainingSeconds: number): string {
  return remainingSeconds <= 0 ? 'GO' : String(Math.ceil(remainingSeconds));
}

export type CoopPhase = 'idle' | 'waiting' | 'countdown' | 'running' | 'finished';

export interface CoopState {
  side: CoopSide;
  code: string;
  songId: string;
  phase: CoopPhase;
}

/** A note is only ever handled by the side that owns its pitch. */
export function noteSide(note: SongNote): CoopSide {
  return inCoopRange(note.midi, 'host') ? 'host' : 'guest';
}
