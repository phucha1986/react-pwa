import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, Button, Container, Stack, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import { DE_MEN_CHAPTERS } from './chapters';
import { API_BASE, loadNarration } from './narration';

/**
 * Chapter screen for "Dế Mèn Phiêu Lưu Ký". Each button plays/pauses that
 * chapter of the single narrator clip by seeking to its boundaries.
 * Chapters the abridged narration does not cover are listed but not playable.
 */
export default function DemenChapters() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [job, setJob] = useState<Awaited<ReturnType<typeof loadNarration>>>(null);
  const [playingChapter, setPlayingChapter] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let alive = true;
    loadNarration('Dế Mèn').then((j) => {
      if (alive) setJob(j);
    });
    return () => {
      alive = false;
    };
  }, []);

  const stop = () => {
    audioRef.current?.pause();
    setPlayingChapter(null);
  };

  const pendingStart = useRef<number | null>(null);

  const toggleChapter = (n: number) => {
    const audio = audioRef.current;
    if (!audio || !job) return;
    if (playingChapter === n) {
      stop();
      return;
    }
    const chapter = DE_MEN_CHAPTERS.find((c) => c.n === n);
    if (!chapter || chapter.start === undefined) return;
    // Seeking needs the duration; if metadata isn't loaded yet, defer the seek.
    if (audio.duration > 0) {
      audio.currentTime = chapter.start;
    } else {
      pendingStart.current = chapter.start;
    }
    audio.play().catch(() => {
      /* playback can be blocked until a user gesture — ignore */
    });
    setPlayingChapter(n);
  };

  // Stop at the chapter's end boundary.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playingChapter === null) return;
    const chapter = DE_MEN_CHAPTERS.find((c) => c.n === playingChapter);
    if (!chapter || chapter.end === undefined) return;
    const end = chapter.end;
    const onTime = () => {
      if (audio.currentTime >= end) stop();
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', stop);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', stop);
    };
  }, [playingChapter]);

  return (
    <Container
      data-pw="demen-chapters-page"
      maxWidth="sm"
      sx={{ minHeight: '100vh', bgcolor: '#FFFCEB', py: 4 }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography
          data-pw="demen-chapters-title"
          sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#3E2723' }}
        >
          Dế Mèn Phiêu Lưu Ký
        </Typography>
        {!job && (
          <Typography sx={{ color: '#8D6E63' }}>Đang tải bài đọc… / Loading narration…</Typography>
        )}
        {job &&
          DE_MEN_CHAPTERS.map((chapter) => {
            const playable = chapter.start !== undefined;
            const playing = playingChapter === chapter.n;
            return (
              <Button
                key={chapter.n}
                data-pw={`demen-chapter-${chapter.n}`}
                onClick={() => toggleChapter(chapter.n)}
                disabled={!playable}
                variant="contained"
                sx={{
                  width: '100%',
                  maxWidth: 420,
                  bgcolor: playing ? '#2E7D32' : playable ? '#FFADAD' : '#E8E3D9',
                  color: playing ? '#fff' : playable ? '#3E2723' : '#8D6E63',
                  borderRadius: '1.5rem',
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                }}
              >
                {playing ? (
                  <PauseIcon data-pw={`demen-chapter-playing-${chapter.n}`} sx={{ fontSize: 28 }} />
                ) : playable ? (
                  <PlayArrowIcon sx={{ fontSize: 28, color: '#2E7D32' }} />
                ) : null}
                <Box sx={{ textAlign: 'left' }}>
                  <Typography data-pw={`demen-chapter-label-${chapter.n}`} sx={{ fontWeight: 700 }}>
                    Chương {chapter.n}
                  </Typography>
                  <Typography
                    data-pw={`demen-chapter-title-${chapter.n}`}
                    sx={{ fontSize: '0.9rem', opacity: 0.85 }}
                  >
                    {chapter.title.vi}
                  </Typography>
                  {!playable && (
                    <Typography
                      data-pw={`demen-chapter-no-audio-${chapter.n}`}
                      sx={{ fontSize: '0.8rem', opacity: 0.7 }}
                    >
                      {lang === 'vi' ? 'Chưa có bài đọc' : 'No narration yet'}
                    </Typography>
                  )}
                </Box>
              </Button>
            );
          })}
        <Button
          data-pw="demen-chapters-back"
          onClick={() => navigate('/Folktales')}
          sx={{ color: '#2E7D32', textTransform: 'none' }}
        >
          <ArrowBackIcon />
          {lang === 'vi' ? 'Quay lại' : 'Back'}
        </Button>
        {job && (
          <audio
            ref={(el) => {
              audioRef.current = el;
            }}
            data-pw="demen-audio"
            src={`${API_BASE}/jobs/${job.id}/audio`}
            onLoadedMetadata={() => {
              if (pendingStart.current !== null && audioRef.current) {
                audioRef.current.currentTime = pendingStart.current;
                pendingStart.current = null;
              }
            }}
            style={{ display: 'none' }}
          />
        )}
      </Stack>
    </Container>
  );
}
