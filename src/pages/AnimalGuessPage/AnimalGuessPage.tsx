import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Container, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import antIcon from '../AnimalGame/logos/ant.png';
import catIcon from '../AnimalGame/logos/cat.png';
import cowIcon from '../AnimalGame/logos/cow.png';
import crocodileIcon from '../AnimalGame/logos/crocodile.png';
import dogIcon from '../AnimalGame/logos/dog.png';
import eagleIcon from '../AnimalGame/logos/eagle.png';
import elephantIcon from '../AnimalGame/logos/elephant.png';
import flamingoIcon from '../AnimalGame/logos/flamingo.png';
import frogIcon from '../AnimalGame/logos/frog.png';
import giraffeIcon from '../AnimalGame/logos/giraffe.png';
import goatIcon from '../AnimalGame/logos/goat.png';
import horseIcon from '../AnimalGame/logos/horse.png';
import hummingbirdIcon from '../AnimalGame/logos/hummingbird.png';
import leopardIcon from '../AnimalGame/logos/leopard.png';
import lionIcon from '../AnimalGame/logos/lion.png';
import monkeyIcon from '../AnimalGame/logos/monkey.png';
import octopusIcon from '../AnimalGame/logos/octopus.png';
import orangutanIcon from '../AnimalGame/logos/orangutan.png';
import ostrichIcon from '../AnimalGame/logos/ostrich.png';
import parrotIcon from '../AnimalGame/logos/parrot.png';
import penguinIcon from '../AnimalGame/logos/penguin.png';
import rabbitIcon from '../AnimalGame/logos/rabbit.png';
import reindeerIcon from '../AnimalGame/logos/reindeer.png';
import sealIcon from '../AnimalGame/logos/seal.png';
import squirrelIcon from '../AnimalGame/logos/squirrel.png';
import tigerIcon from '../AnimalGame/logos/tiger.png';
import turtleIcon from '../AnimalGame/logos/turtle.png';
import whaleIcon from '../AnimalGame/logos/whale.png';
import yakIcon from '../AnimalGame/logos/yak.png';
import zebraIcon from '../AnimalGame/logos/zebra.png';
import { playSuccessSound, playWrongSound, speak } from './sound';
import { AnimalPhoto, ConfettiPiece, Stage, StageGrid } from './styled';

// Animal data map
const animalData: Record<string, { word: string; icon: string }> = {
  lion: { word: 'Lion', icon: lionIcon },
  elephant: { word: 'Elephant', icon: elephantIcon },
  monkey: { word: 'Monkey', icon: monkeyIcon },
  giraffe: { word: 'Giraffe', icon: giraffeIcon },
  parrot: { word: 'Parrot', icon: parrotIcon },
  turtle: { word: 'Turtle', icon: turtleIcon },
  dog: { word: 'Dog', icon: dogIcon },
  cat: { word: 'Cat', icon: catIcon },
  cow: { word: 'Cow', icon: cowIcon },
  horse: { word: 'Horse', icon: horseIcon },
  goat: { word: 'Goat', icon: goatIcon },
  whale: { word: 'Whale', icon: whaleIcon },
  tiger: { word: 'Tiger', icon: tigerIcon },
  rabbit: { word: 'Rabbit', icon: rabbitIcon },
  octopus: { word: 'Octopus', icon: octopusIcon },
  zebra: { word: 'Zebra', icon: zebraIcon },
  eagle: { word: 'Eagle', icon: eagleIcon },
  crocodile: { word: 'Crocodile', icon: crocodileIcon },
  penguin: { word: 'Penguin', icon: penguinIcon },
  ostrich: { word: 'Ostrich', icon: ostrichIcon },
  seal: { word: 'Seal', icon: sealIcon },
  flamingo: { word: 'Flamingo', icon: flamingoIcon },
  leopard: { word: 'Leopard', icon: leopardIcon },
  ant: { word: 'Ant', icon: antIcon },
  squirrel: { word: 'Squirrel', icon: squirrelIcon },
  frog: { word: 'Frog', icon: frogIcon },
  hummingbird: { word: 'Hummingbird', icon: hummingbirdIcon },
  orangutan: { word: 'Orangutan', icon: orangutanIcon },
  yak: { word: 'Yak', icon: yakIcon },
  reindeer: { word: 'Reindeer', icon: reindeerIcon },
};

const CONFETTI_COLORS = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#FFADAD', '#A0E7E5'];

// Pastel palette for the answer circles — the 4 options always get 4 unique colors
const PASTEL_PALETTE = ['#FFD6E0', '#D6E9FF', '#FFF3C4', '#D9F2E3', '#E8D6FF', '#FFE5CC'];

// Each animal's own dominant color (in palette terms) — its circle avoids it
// (e.g. the blue whale never gets a blue circle, the pink flamingo never pink)
const ANIMAL_AVOID_COLORS: Record<string, string> = {
  lion: '#FFF3C4', // gold
  monkey: '#FFE5CC', // brown
  giraffe: '#FFF3C4', // yellow
  parrot: '#D9F2E3', // green
  turtle: '#D9F2E3', // green
  dog: '#FFE5CC', // brown
  horse: '#FFE5CC', // brown
  whale: '#D6E9FF', // blue
  tiger: '#FFE5CC', // orange
  octopus: '#FFD6E0', // red
  eagle: '#FFE5CC', // brown
  crocodile: '#D9F2E3', // green
  flamingo: '#FFD6E0', // pink
  leopard: '#FFF3C4', // gold
  squirrel: '#FFE5CC', // orange
  frog: '#D9F2E3', // green
  hummingbird: '#D9F2E3', // green
  orangutan: '#FFE5CC', // orange
  yak: '#FFE5CC', // brown
  reindeer: '#FFE5CC', // brown
};

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
    speak(t.question(animal?.word ?? ''), undefined, lang);
  }, [animalKey, animal?.word, t, lang]);

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

  // The target animal plus 3 random other animals, shuffled into a 2x2 grid
  const options = useMemo(() => {
    const keys = Object.keys(animalData);
    const others = keys.filter((k) => k !== animalKey);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const picked = [animalKey, ...shuffledOthers].sort(() => Math.random() - 0.5);
    // Give each option a unique pastel that isn't the animal's own color
    const used = new Set<string>();
    return picked.map((key) => {
      const avoid = ANIMAL_AVOID_COLORS[key];
      const color = PASTEL_PALETTE.find((c) => !used.has(c) && c !== avoid) ?? '#fff';
      used.add(color);
      return {
        key,
        word: t.animals[key] ?? animalData[key]?.word ?? key,
        icon: animalData[key]?.icon,
        isCorrect: key === animalKey,
        color,
      };
    });
  }, [animalKey, t]);

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
      answeredKeyRef.current = animalKey;
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
        {success ? `🎉 ${t.greatJob(animal?.word ?? '')}` : t.question(animal?.word ?? '')}
      </Typography>

      <Stage>
        <StageGrid>
          {options.map((opt) => (
            <AnimalPhoto
              key={opt.key}
              $wrong={wrongPick === opt.key}
              $correct={success && opt.isCorrect}
              $disabled={success && !opt.isCorrect}
              $color={opt.color}
              onClick={() => handleClick(opt.key, opt.isCorrect)}
            >
              <img src={opt.icon} alt={opt.word} />
            </AnimalPhoto>
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
