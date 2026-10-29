import { useCallback, useState } from 'react';

import { Box, Button, Container, Stack, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import PanelArt from './art';
import { ACCENT, INK, PAPER, TOUCH_TARGET } from './palette';
import { playPageTurnSound, speak } from './sound';
import { COMIC_PAGES, pageText } from './story';

const COMIC_FONT = "'Fredoka', 'Comic Sans MS', cursive";

/** Panel coordinates are 0-400 x 0-300; keep bubbles clear of the panel edges. */
const clampLeft = (x: number) => Math.min(68, Math.max(32, (x / 400) * 100));
const clampTop = (y: number) => Math.max(45, (y / 300) * 100);

/** Speech bubble anchored by its tail, positioned from the story data. */
function Bubble({ who, text, x, y }: { who: string; text: string; x: number; y: number }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${clampLeft(x)}%`,
        top: `${clampTop(y)}%`,
        transform: 'translate(-50%, -100%)',
        bgcolor: '#ffffff',
        color: INK,
        border: `2px solid ${INK}`,
        borderRadius: 12,
        px: 1.25,
        py: 0.75,
        maxWidth: '46%',
        fontFamily: COMIC_FONT,
        fontSize: '0.8rem',
        lineHeight: 1.3,
        boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
        '& > span': { position: 'relative', zIndex: 1 },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '50%',
          bottom: -10,
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `10px solid ${INK}`,
        },
      }}
    >
      <span>
        <strong>{who}:</strong> {text}
      </span>
    </Box>
  );
}

export default function ComicBook() {
  const { t, lang } = useLanguage();
  const [index, setIndex] = useState(0);
  const [reading, setReading] = useState(false);

  const page = COMIC_PAGES[index];
  const total = COMIC_PAGES.length;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setIndex(clamped);
      playPageTurnSound();
    },
    [total],
  );

  const readAloud = useCallback(() => {
    if (reading) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setReading(false);
      return;
    }
    setReading(true);
    speak(pageText(page, lang), () => setReading(false), lang);
  }, [lang, page, reading]);

  return (
    <Container data-pw="comic-book" sx={{ minHeight: '100vh', py: 3, px: { xs: 2, md: 4 } }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: COMIC_FONT }}>
            📖 {t.comicTitle}
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
            {t.comicHint}
          </Typography>
        </Stack>

        <Box
          data-pw="comic-panel"
          sx={{
            position: 'relative',
            bgcolor: PAPER,
            border: `3px solid ${INK}`,
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
          }}
        >
          <Box sx={{ aspectRatio: '4 / 3' }}>
            <PanelArt scene={page.scene} />
          </Box>
          {page.bubbles.map((bubble, i) => (
            <Box key={i} data-pw={`comic-bubble-${i}`}>
              <Bubble who={bubble.who} text={bubble[lang]} x={bubble.x} y={bubble.y} />
            </Box>
          ))}
        </Box>

        <Box
          data-pw="comic-caption"
          sx={{ bgcolor: PAPER, border: `2px solid ${INK}`, borderRadius: 14, p: 2 }}
        >
          <Typography
            sx={{ fontFamily: COMIC_FONT, fontSize: '1rem', lineHeight: 1.5, color: INK }}
          >
            {page.caption[lang]}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            data-pw="comic-prev"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            sx={{
              ...TOUCH_TARGET,
              borderRadius: 999,
              fontWeight: 700,
              fontFamily: COMIC_FONT,
              bgcolor: INK,
            }}
          >
            ‹ {t.comicPrevPage}
          </Button>
          <Button
            variant="contained"
            data-pw="comic-next"
            disabled={index === total - 1}
            onClick={() => goTo(index + 1)}
            sx={{
              ...TOUCH_TARGET,
              borderRadius: 999,
              fontWeight: 700,
              fontFamily: COMIC_FONT,
              bgcolor: ACCENT,
            }}
          >
            {t.comicNextPage} ›
          </Button>
          <Button
            variant="outlined"
            data-pw="comic-read"
            onClick={readAloud}
            sx={{
              ...TOUCH_TARGET,
              borderRadius: 999,
              fontWeight: 700,
              fontFamily: COMIC_FONT,
              color: INK,
              borderColor: INK,
              bgcolor: reading ? '#ffe9c9' : 'transparent',
            }}
          >
            {reading ? t.comicStopReading : `🔊 ${t.comicReadAloud}`}
          </Button>
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {COMIC_PAGES.map((p, i) => (
            <Box
              key={p.id}
              data-pw={`comic-page-dot-${i}`}
              role="button"
              aria-label={t.comicPageLabel(i + 1, total)}
              onClick={() => goTo(i)}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontFamily: COMIC_FONT,
                fontSize: '0.8rem',
                fontWeight: 700,
                bgcolor: i === index ? ACCENT : PAPER,
                color: i === index ? '#fff' : INK,
                border: `2px solid ${INK}`,
              }}
            >
              {i + 1}
            </Box>
          ))}
        </Stack>

        <Typography color="text.secondary" sx={{ fontFamily: COMIC_FONT, fontSize: '0.95rem' }}>
          {t.comicPageLabel(index + 1, total)}
        </Typography>
      </Stack>
    </Container>
  );
}
