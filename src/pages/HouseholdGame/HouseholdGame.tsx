import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { useLanguage } from '@/i18n/useLanguage';

import { playSuccessSound, playWrongSound, speak } from '../FruitGuessPage/sound';
import { householdItems } from './items';
import { ConfettiPiece, ItemPhoto, Stage, StageGrid } from './styled';

const CONFETTI_COLORS = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#FFADAD', '#A0E7E5'];
// Pastel palette for the 2x2 answer grid — always 4 unique colors.
const PASTEL_PALETTE = ['#FFD6E0', '#D6E9FF', '#FFF3C4', '#D9F2E3', '#E8D6FF', '#FFE5CC'];

type Mode = 'gallery' | 'quiz';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useConfetti() {
  const [confetti, setConfetti] = useState<{
    id: number;
    left: number;
    size: number;
    color: string;
    duration: number;
    delay: number;
  }[]>([]);
  const spawn = () => {
    setConfetti(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 8 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 0.5,
      })),
    );
  };
  return { confetti, spawn, clear: () => setConfetti([]) };
}

export default function HouseholdGame() {
  const { lang, t } = useLanguage();
  const [mode, setMode] = useState<Mode>('gallery');
  const [currentKey, setCurrentKey] = useState<string>(() => householdItems[0].key);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const answeredRef = useRef<string | null>(null);
  const { confetti, spawn, clear } = useConfetti();

  const items = useMemo(() => householdItems, []);
  const current = items.find((i) => i.key === currentKey) ?? items[0];
  const word = t.household[current.key] ?? current.key;

  // Reset the quiz state + announce the question when the item changes.
  useEffect(() => {
    if (mode !== 'quiz') return;
    setSuccess(false);
    setWrongPick(null);
    clear();
    answeredRef.current = null;
    speak(t.question(word), undefined, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, mode, word, t, lang]);

  // Announce the answer and advance to the next item once speech finishes.
  useEffect(() => {
    if (!success || mode !== 'quiz' || answeredRef.current !== currentKey) return;
    const index = items.findIndex((i) => i.key === currentKey);
    const next = items[(index + 1) % items.length];
    let done = false;
    const advance = () => {
      if (done) return;
      done = true;
      setCurrentKey(next.key);
    };
    speak(t.greatJob(t.household[next.key] ?? next.key), advance, lang);
    const fallback = window.setTimeout(advance, 6000);
    return () => window.clearTimeout(fallback);
  }, [success, currentKey, mode, t, lang, items]);

  // 2x2 quiz options: the current item + 3 random others, shuffled, each
  // assigned a unique pastel color.
  const options = useMemo(() => {
    const others = items.filter((i) => i.key !== currentKey);
    const picked = [current, ...shuffle(others).slice(0, 3)];
    const shuffled = shuffle(picked);
    const used = new Set<string>();
    return shuffled.map((item) => {
      const color = PASTEL_PALETTE.find((c) => !used.has(c)) ?? '#fff';
      used.add(color);
      return {
        key: item.key,
        word: t.household[item.key] ?? item.key,
        icon: item.icon,
        isCorrect: item.key === currentKey,
        color,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, t, items]);

  const handleAnswer = (key: string, isCorrect: boolean) => {
    if (success) return;
    if (isCorrect) {
      answeredRef.current = currentKey;
      setSuccess(true);
      playSuccessSound();
      spawn();
    } else {
      setWrongPick(key);
      playWrongSound();
      window.setTimeout(() => setWrongPick(null), 450);
    }
  };

  const startQuiz = (key: string) => {
    setCurrentKey(key);
    setMode('quiz');
  };

  const backToGallery = () => {
    setMode('gallery');
    clear();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
        @keyframes confetti-fall { to { transform: translateY(110vh) rotate(720deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        @keyframes pop-in {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
      `}</style>

      <Container maxWidth="lg" sx={{ minHeight: '100vh', bgcolor: '#FFFCEB', py: 4 }}>
        {mode === 'gallery' ? (
          <>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Typography
                sx={{
                  fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
                  fontSize: { xs: 24, sm: 32 },
                  fontWeight: 700,
                  color: '#2F7FAE',
                }}
              >
                🏠 {t.householdTitle}
              </Typography>
              <Button
                startIcon={<PlayArrowIcon />}
                variant="outlined"
                onClick={() => startQuiz(householdItems[0].key)}
                sx={{ borderRadius: 3, textTransform: 'none', color: '#2F7FAE', borderColor: '#2F7FAE' }}
              >
                {t.householdPlay}
              </Button>
            </Stack>

            <Grid container spacing={3} justifyContent="center">
              {items.map((item) => (
                <Grid item xs={6} sm={4} md={3} key={item.key}>
                  <Paper
                    elevation={6}
                    sx={{
                      bgcolor: item.bg,
                      borderRadius: '2rem',
                      p: 2,
                      aspectRatio: '1 / 1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.05)' },
                      userSelect: 'none',
                      '& img': { width: 'clamp(64px, 16vw, 110px)', height: 'auto', display: 'block', objectFit: 'contain' },
                    }}
                    onClick={() => startQuiz(item.key)}
                  >
                    <img src={item.icon} alt={t.household[item.key] ?? item.key} />
                    <Typography
                      sx={{
                        fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
                        fontSize: { xs: 14, sm: 16 },
                        fontWeight: 600,
                        color: '#4A5B68',
                      }}
                    >
                      {t.household[item.key] ?? item.key}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Stack alignItems="center" sx={{ minHeight: 'calc(100vh - 64px)' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={backToGallery}
              sx={{
                mb: 1,
                color: '#4A5B68',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              {t.householdBack}
            </Button>

            <Typography
              sx={{
                fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
                fontSize: 'clamp(24px, 5vw, 36px)',
                fontWeight: 700,
                color: '#FF8C42',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {success ? (
                <>
                  <CheckIcon color="success" />
                  {t.greatJob(word)}
                </>
              ) : (
                t.question(word)
              )}
            </Typography>

            <Stage>
              <StageGrid>
                {options.map((opt) => (
                  <ItemPhoto
                    key={opt.key}
                    $wrong={wrongPick === opt.key}
                    $correct={success && opt.isCorrect}
                    $disabled={success && !opt.isCorrect}
                    $color={opt.color}
                    onClick={() => handleAnswer(opt.key, opt.isCorrect)}
                  >
                    <img src={opt.icon} alt={opt.word} />
                  </ItemPhoto>
                ))}
              </StageGrid>
            </Stage>

            {confetti.map((piece) => (
              <ConfettiPiece
                key={piece.id}
                style={{
                  left: `${piece.left}%`,
                  width: piece.size,
                  height: piece.size * 0.6,
                  background: piece.color,
                  animationDuration: `${piece.duration}s`,
                  animationDelay: `${piece.delay}s`,
                }}
              />
            ))}
          </Stack>
        )}
      </Container>
    </>
  );
}
