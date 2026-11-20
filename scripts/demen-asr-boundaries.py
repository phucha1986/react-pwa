"""Locate Dế Mèn narration paragraph boundaries in the new audio via ASR.

Transcribes tmp-demen-audio.wav (24 kHz, from the "Giong vo" job) with
faster-whisper word timestamps, then matches the first word of each paragraph
of scripts/narration/de-men.txt to the transcript to get the spoken start time
of every paragraph. Also locates the Chapter 4 / Chapter 6 split inside
paragraph 10 ("Một buổi chiều bờ đầm").

Paragraph -> chapter mapping (same text as the old Mỹ Duyên narration):
  para 1 = title line; paras 2-6 = Chapter 1; para 7 = Chapter 2;
  paras 8-9 = Chapter 3; para 10 = Chapter 4 + Chapter 6 (split at
  "Một buổi chiều bờ đầm"); para 11 = Chapter 5.
"""
import json
import re
import unicodedata
from pathlib import Path

from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "tmp-demen-audio.wav"
TEXT = ROOT / "scripts" / "narration" / "de-men.txt"


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]", " ", s).strip()


def find_phrase(words, phrase, from_pos, slack=3):
    """Find `phrase` (list of normalized words) in `words` starting at from_pos.

    ASR may insert or drop words, so match the phrase words in order allowing
    up to `slack` intervening words between consecutive phrase words.
    """
    for start in range(from_pos, len(words)):
        if words[start][0] != phrase[0]:
            continue
        k = start
        ok = True
        for t in range(1, len(phrase)):
            limit = min(k + 1 + slack, len(words))
            nxt = None
            for j in range(k + 1, limit):
                if words[j][0] == phrase[t]:
                    nxt = j
                    break
            if nxt is None:
                ok = False
                break
            k = nxt
        if ok:
            return start
    return None


def main() -> None:
    paras = [p for p in TEXT.read_text(encoding="utf-8").splitlines() if p.strip()]
    # faster-whisper needs CT2-converted weights; "large-v3-turbo" resolves to
    # the gazebo/whisper-large-v3-turbo CT2 snapshot (downloads ~1.5GB once).
    model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
    segments, info = model.transcribe(str(AUDIO), language="vi", word_timestamps=True)
    words = []
    for seg in segments:
        for w in seg.words:
            t = norm(w.word)
            if t:
                words.append((t, w.start, w.end))
    print(f"transcript words: {len(words)}, audio: {info.duration:.2f}s")

    boundaries = []
    pos = 0
    for i, para in enumerate(paras):
        phrase = norm(para).split()[:5]
        idx = find_phrase(words, phrase, pos)
        if idx is None:
            phrase = norm(para).split()[:3]
            idx = find_phrase(words, phrase, pos)
        if idx is None:
            print(f"para {i + 1}: NOT FOUND ({para[:40]!r})")
            boundaries.append(None)
            continue
        pos = idx + 1
        boundaries.append(words[idx][1])
        print(f"para {i + 1} ({len(para)} chars): start {words[idx][1]:.2f}s")

    # Chapter 4/6 split inside paragraph 10: "Một buổi chiều bờ đầm"
    split_words = norm("Một buổi chiều bờ đầm").split()
    p10_start = boundaries[9]
    p11_start = boundaries[10]
    split_t = None
    lo = next((k for k, w in enumerate(words) if w[1] >= p10_start), 0)
    hi = next((k for k, w in enumerate(words) if w[1] >= p11_start), len(words))
    idx = find_phrase(words, split_words, lo, slack=2)
    if idx is not None and idx < hi:
        split_t = words[idx][1]
    print(f"ch4/ch6 split at: {split_t:.2f}s" if split_t else "ch4/ch6 split: NOT FOUND")

    print(json.dumps({
        "para_starts": [round(b, 2) if b else None for b in boundaries],
        "total": round(info.duration, 2),
        "split": round(split_t, 2) if split_t else None,
    }))


if __name__ == "__main__":
    main()
