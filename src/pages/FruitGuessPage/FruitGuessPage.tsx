import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Container, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import appleImg from '../FruitGame/logos/apple.png';
import avocadoImg from '../FruitGame/logos/avocado.png';
import bananaImg from '../FruitGame/logos/banana.png';
import blueberryImg from '../FruitGame/logos/blueberry.png';
import cherryImg from '../FruitGame/logos/cherry.png';
import coconutImg from '../FruitGame/logos/coconut.png';
import grapeImg from '../FruitGame/logos/grape.png';
import kiwiImg from '../FruitGame/logos/kiwi.png';
import lemonImg from '../FruitGame/logos/lemon.png';
import mangoImg from '../FruitGame/logos/mango.png';
import melonImg from '../FruitGame/logos/melon.png';
import oliveImg from '../FruitGame/logos/olive.png';
import orangeImg from '../FruitGame/logos/orange.png';
import peachImg from '../FruitGame/logos/peach.png';
import pearImg from '../FruitGame/logos/pear.png';
import pineappleImg from '../FruitGame/logos/pineapple.png';
import strawberryImg from '../FruitGame/logos/strawberry.png';
import watermelonImg from '../FruitGame/logos/watermelon.png';
import { playSuccessSound, playWrongSound, speak } from './sound';
import { ConfettiPiece, FruitPhoto, Stage, StageGrid } from './styled';

// Fruit data map — keyed by lowercase fruit name (matches the `fruits` i18n dict)
const fruitData: Record<string, { icon: string; color: string }> = {
  apple: { icon: appleImg, color: '#FFADAD' },
  banana: { icon: bananaImg, color: '#FFD93D' },
  cherry: { icon: cherryImg, color: '#FFD6E0' },
  grape: { icon: grapeImg, color: '#E8D6FF' },
  lemon: { icon: lemonImg, color: '#FFF3C4' },
  mango: { icon: mangoImg, color: '#FFE5CC' },
  orange: { icon: orangeImg, color: '#FFE5CC' },
  peach: { icon: peachImg, color: '#FFD6E0' },
  pear: { icon: pearImg, color: '#D9F2E3' },
  pineapple: { icon: pineappleImg, color: '#FFD93D' },
  strawberry: { icon: strawberryImg, color: '#FFADAD' },
  watermelon: { icon: watermelonImg, color: '#A0E7E5' },
  kiwi: { icon: kiwiImg, color: '#D9F2E3' },
  coconut: { icon: coconutImg, color: '#FFE5CC' },
  blueberry: { icon: blueberryImg, color: '#D6E9FF' },
  melon: { icon: melonImg, color: '#D9F2E3' },
  avocado: { icon: avocadoImg, color: '#D9F2E3' },
  olive: { icon: oliveImg, color: '#E8D6FF' },
};

const CONFETTI_COLORS = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#FFADAD', '#A0E7E5'];

// Pastel palette for the answer circles — the 4 options always get 4 unique colors
const PASTEL_PALETTE = ['#FFD6E0', '#D6E9FF', '#FFF3C4', '#D9F2E3', '#E8D6FF', '#FFE5CC'];

type Confetti = {
  id: number;
  left: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function normalizeKey(name: string): string {
  return name.trim().toLowerCase();
}

export default function FruitGuessPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  // The incoming query value is the fruit *name* (e.g. "Apple"); resolve it to a key.
  const incoming = query.get('fruit') ?? '';
  const fruitKey = useMemo(() => {
    const lower = normalizeKey(incoming);
    const direct = fruitData[lower] ? lower : undefined;
    if (direct) return direct;
    // Fall back to matching a known English name.
    const found = Object.keys(fruitData).find(
      (key) => fruitData[key] && (t.fruits[key] ?? '').toLowerCase() === lower,
    );
    return found ?? 'apple';
  }, [incoming, t]);

  const fruit = useMemo(
    () => ({
      word: t.fruits[fruitKey] ?? fruitKey,
      icon: fruitData[fruitKey]?.icon,
      color: fruitData[fruitKey]?.color,
    }),
    [fruitKey, t],
  );

  const [success, setSuccess] = useState(false);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  // Tracks which fruit was actually answered, so the success effect never
  // re-fires for the *next* fruit after navigation.
  const answeredKeyRef = useRef<string | null>(null);

  // Reset state when the fruit changes and announce the question
  useEffect(() => {
    setSuccess(false);
    setWrongPick(null);
    setConfetti([]);
    answeredKeyRef.current = null;
    speak(t.question(fruit?.word ?? ''), undefined, lang);
  }, [fruitKey, fruit?.word, t, lang]);

  // Announce the correct answer, then advance to the next fruit once the
  // speech finishes (so the "Great job" line is never cut off).
  useEffect(() => {
    if (!success || answeredKeyRef.current !== fruitKey) return;
    const keys = Object.keys(fruitData);
    const currentIndex = keys.indexOf(fruitKey);
    const nextKey = keys[(currentIndex + 1) % keys.length];
    let done = false;
    const advance = () => {
      if (done) return;
      done = true;
      navigate(`/FruitGuessPage?fruit=${encodeURIComponent(nextKey)}`);
    };
    speak(t.greatJob(fruit?.word ?? ''), advance, lang);
    // Safety net in case the speech engine never fires onend.
    const fallback = window.setTimeout(advance, 6000);
    return () => window.clearTimeout(fallback);
  }, [success, fruitKey, fruit?.word, t, lang, navigate]);

  // The target fruit plus 3 random other fruits, shuffled into a 2x2 grid
  const options = useMemo(() => {
    const keys = Object.keys(fruitData);
    const others = keys.filter((k) => k !== fruitKey);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const picked = [fruitKey, ...shuffledOthers].sort(() => Math.random() - 0.5);
    // Give each option a unique pastel
    const used = new Set<string>();
    return picked.map((key) => {
      const color = PASTEL_PALETTE.find((c) => !used.has(c)) ?? '#fff';
      used.add(color);
      return {
        key,
        word: t.fruits[key] ?? key,
        icon: fruitData[key]?.icon,
        isCorrect: key === fruitKey,
        color,
      };
    });
  }, [fruitKey, t]);

  const spawnConfetti = () => {
    const pieces: Confetti[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 0.5,
    }));
    setConfetti(pieces);
  };

  const handleClick = (key: string, isCorrect: boolean) => {
    if (success) return;
    if (isCorrect) {
      answeredKeyRef.current = fruitKey;
      setSuccess(true);
      playSuccessSound();
      spawnConfetti();
    } else {
      setWrongPick(key);
      playWrongSound();
      window.setTimeout(() => setWrongPick(null), 450);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: 'calc(100vh - 64px)',
        '@supports (height: 100dvh)': {
          minHeight: 'calc(100dvh - 64px)',
        },
        bgcolor: '#FFFCEB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: { xs: 3, sm: 6 },
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
        @keyframes confetti-fall {
          to { transform: translateY(110vh) rotate(720deg); }
        }
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

      <Typography
        sx={{
          fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
          fontSize: 'clamp(24px, 5vw, 36px)',
          fontWeight: 700,
          color: '#FF8C42',
          mb: 2,
        }}
      >
        {success ? `🎉 ${t.greatJob(fruit?.word ?? '')}` : t.question(fruit?.word ?? '')}
      </Typography>

      <Stage>
        <StageGrid>
          {options.map((opt) => (
            <FruitPhoto
              key={opt.key}
              $wrong={wrongPick === opt.key}
              $correct={success && opt.isCorrect}
              $disabled={success && !opt.isCorrect}
              $color={opt.color}
              onClick={() => handleClick(opt.key, opt.isCorrect)}
            >
              <img src={opt.icon} alt={opt.word} />
            </FruitPhoto>
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
    </Container>
  );
}
