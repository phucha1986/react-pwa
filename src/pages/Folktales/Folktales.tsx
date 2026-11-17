import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, Container, Grid, IconButton, Paper, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import { API_BASE, type VoiceJob, loadNarration } from './narration';
import { STORIES } from './stories';

/** Story tiles that open a chapter screen instead of playing inline. */
const CHAPTER_ROUTES: Record<string, string> = {
  'de-men': '/Folktales/DemenChapters',
};

export default function Folktales() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  // Story id -> narration job (undefined = still loading, null = none).
  const [jobs, setJobs] = useState<Record<string, VoiceJob | null>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  // Story id -> play button revealed after the tile's first press.
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
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

  const openStory = (id: string) => {
    const route = CHAPTER_ROUTES[id];
    if (route) {
      navigate(route);
      return;
    }
    if (!revealed[id]) {
      setRevealed((prev) => ({ ...prev, [id]: true }));
      return;
    }
    togglePlay(id);
  };

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
                onClick={() => job && openStory(story.id)}
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
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{story.emoji}</span>
                    <Typography
                      data-pw={`folktales-title-${story.id}`}
                      sx={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#3E2723',
                        textAlign: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      {story.title?.vi ?? story.alt.vi}
                    </Typography>
                    {revealed[story.id] && (
                      <IconButton
                        data-pw={`folktales-play-${story.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay(story.id);
                        }}
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'rgba(255,255,255,0.85)',
                          opacity: 0.5,
                          '&:hover': { opacity: 0.75 },
                        }}
                      >
                        {playingId === story.id ? (
                          <PauseIcon sx={{ fontSize: 48, color: '#2E7D32' }} />
                        ) : (
                          <PlayArrowIcon sx={{ fontSize: 48, color: '#2E7D32' }} />
                        )}
                      </IconButton>
                    )}
                  </Box>
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
