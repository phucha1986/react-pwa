import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Container, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import elephantIcon from '../AnimalGame/logos/elephant.png';
import giraffeIcon from '../AnimalGame/logos/giraffe.png';
import lionIcon from '../AnimalGame/logos/lion.png';
import monkeyIcon from '../AnimalGame/logos/monkey.png';
import parrotIcon from '../AnimalGame/logos/parrot.png';
import turtleIcon from '../AnimalGame/logos/turtle.png';
import { playSuccessSound, playWrongSound, speak } from './sound';
import { AnimalPhoto, ConfettiPiece, NameButton, Stage, StageGrid } from './styled';

// Animal data map
const animalData: Record<string, { word: string; icon: string }> = {
  lion: { word: 'Lion', icon: lionIcon },
  elephant: { word: 'Elephant', icon: elephantIcon },
  monkey: { word: 'Monkey', icon: monkeyIcon },
  giraffe: { word: 'Giraffe', icon: giraffeIcon },
  parrot: { word: 'Parrot', icon: parrotIcon },
  turtle: { word: 'Turtle', icon: turtleIcon },
};

const NAME_COLORS = ['#FF6B6B', '#4D96FF', '#FFAD33', '#6BCB77'];
const NAME_AREAS = ['top', 'left', 'right', 'bottom'];
const CONFETTI_COLORS = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#FFADAD', '#A0E7E5'];

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

export default function AnimalGuessPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const animalKey = query.get('animal')?.toLowerCase() || 'lion';

  const animal = useMemo(
    () => ({
      word: t.animals[animalKey] ?? animalData[animalKey]?.word ?? animalKey,
      icon: animalData[animalKey]?.icon,
    }),
    [animalKey, t],
  );

  const [success, setSuccess] = useState(false);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  // Tracks which animal was actually answered, so the success effect never
  // re-fires for the *next* animal after navigation (which would announce
  // "Great job" a second time and advance again).
  const answeredKeyRef = useRef<string | null>(null);

  // Reset state when the animal changes and announce the question
  useEffect(() => {
    setSuccess(false);
    setWrongPick(null);
    setConfetti([]);
    answeredKeyRef.current = null;
    speak(t.question, undefined, lang);
  }, [animalKey, t.question, lang]);

  // Announce the correct answer, then advance to the next animal once the
  // speech finishes (so the "Great job" line is never cut off).
  useEffect(() => {
    if (!success || answeredKeyRef.current !== animalKey) return;
    const keys = Object.keys(animalData);
    const currentIndex = keys.indexOf(animalKey);
    const nextKey = keys[(currentIndex + 1) % keys.length];
    let done = false;
    const advance = () => {
      if (done) return;
      done = true;
      navigate(`/AnimalGuessPage?animal=${nextKey}`);
    };
    speak(t.greatJob(animal?.word ?? ''), advance, lang);
    // Safety net in case the speech engine never fires onend.
    const fallback = window.setTimeout(advance, 6000);
    return () => window.clearTimeout(fallback);
  }, [success, animalKey, animal?.word, t, lang, navigate]);

  const options = useMemo(() => {
    const correct = animal?.word || t.animals.lion;
    const others = Object.keys(t.animals)
      .map((key) => t.animals[key])
      .filter((w) => w !== correct);
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const names = [correct, ...shuffled].sort(() => Math.random() - 0.5);
    return names.map((name, i) => ({
      name,
      color: NAME_COLORS[i],
      area: NAME_AREAS[i],
      isCorrect: name === correct,
    }));
  }, [animal, t]);

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

  const handleClick = (name: string, isCorrect: boolean) => {
    if (success) return;
    if (isCorrect) {
      answeredKeyRef.current = animalKey;
      setSuccess(true);
      playSuccessSound();
      spawnConfetti();
    } else {
      setWrongPick(name);
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
        {success ? `🎉 ${t.greatJob(animal?.word ?? '')}` : t.question}
      </Typography>

      <Stage>
        <StageGrid>
          <AnimalPhoto $bounce={success}>
            <img src={animal?.icon} alt={animalKey} />
          </AnimalPhoto>
          {options.map((opt) => (
            <NameButton
              key={opt.name}
              $area={opt.area}
              $color={opt.color}
              $wrong={wrongPick === opt.name}
              $correct={success && opt.isCorrect}
              $disabled={success && !opt.isCorrect}
              onClick={() => handleClick(opt.name, opt.isCorrect)}
            >
              {opt.name}
            </NameButton>
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
