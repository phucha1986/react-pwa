import { useEffect, useRef, useState } from 'react';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Container, Grid, IconButton, Paper } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import { NARRATOR_PRESET, STORIES } from './stories';

/** Voice AI backend. Override with VITE_VOICE_AI_API if it runs elsewhere. */
const API_BASE = import.meta.env.VITE_VOICE_AI_API ?? 'http://localhost:8000';

type VoiceJob = {
  id: string;
  text: string;
  voice_id: string;
  voice_preset: string | null;
  status: string;
  duration_seconds: number | null;
};

/** Newest finished Mỹ Duyên narration whose text contains `marker`, or null. */
async function loadNarration(marker: string): Promise<VoiceJob | null> {
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

export default function Folktales() {
  const { lang } = useLanguage();
  // Story id -> narration job (undefined = still loading, null = none).
  const [jobs, setJobs] = useState<Record<string, VoiceJob | null>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  useEffect(() => {
    let alive = true;
    for (const story of STORIES) {
      if (!story.marker) continue;
      loadNarration(story.marker).then((job) => {
        if (alive) setJobs((prev) => ({ ...prev, [story.id]: job }));
      });
    }
    return () => {
      alive = false;
    };
  }, []);

  const togglePlay = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;
    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
      return;
    }
    for (const other of Object.values(audioRefs.current)) other?.pause();
    audio.play().catch(() => {
      /* playback can be blocked until a user gesture — ignore */
    });
    setPlayingId(id);
  };

  return (
    <Container
      data-pw="folktales-page"
      maxWidth="lg"
      sx={{ minHeight: '100vh', bgcolor: '#FFFCEB', py: 4 }}
    >
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        {STORIES.map((story) => {
          const job = story.marker ? jobs[story.id] : undefined;
          return (
            <Grid item xs={6} sm={4} md={3} key={story.id} data-pw={`folktales-story-${story.id}`}>
              <Paper
                elevation={6}
                aria-label={story.alt[lang]}
                onClick={() => job && togglePlay(story.id)}
                sx={{
                  bgcolor: story.bg,
                  borderRadius: '2rem',
                  p: 2,
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)', cursor: 'pointer' },
                }}
              >
                {job ? (
                  <IconButton
                    data-pw={`folktales-play-${story.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(story.id);
                    }}
                    sx={{ width: 96, height: 96, bgcolor: 'rgba(255,255,255,0.85)' }}
                  >
                    {playingId === story.id ? (
                      <PauseIcon sx={{ fontSize: 56, color: '#2E7D32' }} />
                    ) : (
                      <PlayArrowIcon sx={{ fontSize: 56, color: '#2E7D32' }} />
                    )}
                  </IconButton>
                ) : (
                  <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>{story.emoji}</span>
                )}
                {job && (
                  <audio
                    ref={(el) => {
                      audioRefs.current[story.id] = el;
                    }}
                    data-pw={`folktales-audio-${story.id}`}
                    src={`${API_BASE}/jobs/${job.id}/audio`}
                    onEnded={() => setPlayingId(null)}
                    style={{ display: 'none' }}
                  />
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
