import { mergeRepeatedNotes } from './songs';
import { songEndBeat } from './timing';
import type { Song, SongNote } from './types';

/**
 * Co-op (two devices, one song) — fully client-side, no server.
 *
 * The invite code is derived deterministically from the song id, so a guest who
 * types the host's code can resolve the exact same song on their own device.
 * Both devices then run the identical deterministic engine and start together
 * via a shared countdown.
 *
 * The two devices form ONE two-octave piano: the host shows the lower octave
 * (C4..C5) and the guest the upper octave (C5..C6). Put side by side they line
 * up into a single continuous keyboard, so a child can play across both devices
 * exactly like one bigger instrument. Each device keeps its own full octave of
 * keys (8 white + 5 black), never a half keyboard.
 *
 * The melodies are written for one octave, so for co-op each song is arranged
 * across two octaves: phrases alternate between the lower and upper octave,
 * which keeps the tune recognisable while giving both devices notes to play
 * throughout the song. A note is owned by whichever device shows its key.
 */

export type CoopSide = 'host' | 'guest';

/**
 * The octave each side owns. The host is the lower octave C4..C5 (midi 60..72)
 * and the guest the upper octave C5..C6 (midi 72..84). They share the seam note
 * C5 (72), so side by side the two keyboards read as one C4..C6 piano.
 */
export const COOP_HOST_RANGE = { low: 60, high: 72 }; // C4..C5
export const COOP_GUEST_RANGE = { low: 72, high: 84 }; // C5..C6

export function coopRange(side: CoopSide): { low: number; high: number } {
  return side === 'host' ? COOP_HOST_RANGE : COOP_GUEST_RANGE;
}

/** The pitch where the lower octave hands over to the upper one (C5). */
const COOP_SEAM_MIDI = 72;

/** Which device owns a pitch: the lower device below the seam, upper at/above it. */
export function noteOwner(midi: number): CoopSide {
  return midi < COOP_SEAM_MIDI ? 'host' : 'guest';
}

/**
 * The song arranged across two octaves for co-op. The original melody sits in
 * one octave; here every other bar is lifted an octave so the tune alternates
 * between the host's lower keys and the guest's upper keys. This is fully
 * deterministic (same song -> same arrangement on both devices) and keeps every
 * pitch inside C4..C6.
 */
export function coopArrangement(song: Song): Song {
  const barBeats = Math.max(1, song.timeSignature.beats);
  const lifted: SongNote[] = song.notes.map((note) => {
    const bar = Math.floor(note.startBeat / barBeats);
    return bar % 2 === 1 ? { ...note, midi: note.midi + 12 } : { ...note };
  });
  return { ...song, notes: mergeRepeatedNotes(lifted) };
}

/**
 * The song as seen by one side: the two-octave arrangement, filtered down to the
 * notes that fall on this device's octave. `endBeat` is pinned to the end of the
 * full arrangement so both devices run for the whole song and finish together,
 * even though each only tracks its own octave's notes.
 */
export function songForSide(song: Song, side: CoopSide): Song {
  const arrangement = coopArrangement(song);
  const owned = (midi: number) => (side === 'host' ? midi < COOP_SEAM_MIDI : midi >= COOP_SEAM_MIDI);
  return {
    ...arrangement,
    notes: arrangement.notes.filter((note) => owned(note.midi)),
    endBeat: songEndBeat(arrangement),
  };
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
