import { styled } from '@mui/material/styles';

const Stage = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 24,
  width: '100%',
});

const StageGrid = styled('div')<{ $cols?: number; $rows?: number }>(({ $cols = 2, $rows = 2 }) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${$cols}, minmax(0, 1fr))`,
  gridTemplateRows: `repeat(${$rows}, auto)`,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  width: '100%',
  maxWidth: 720,
  minWidth: 0,
}));

// The colored tile is a background layer *behind* the image (via ::before),
// so the animal art is never clipped or overlapped. Mirrors the Number game:
// a rounded square with a vivid fill, a light rim and a soft gradient sheen.
const AnimalPhoto = styled('button')<{
  $wrong?: boolean;
  $correct?: boolean;
  $disabled?: boolean;
  $color?: string;
}>(({ $wrong, $correct, $disabled, $color }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: $disabled ? 'default' : 'pointer',
  animation: $correct ? 'bounce 0.8s ease infinite' : 'pop-in 0.5s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '1.5rem',
    background: $color ?? '#fff',
    backgroundImage:
      'linear-gradient(160deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.12) 100%)',
    border: '4px solid rgba(255,255,255,0.85)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    zIndex: 0,
  },
  // Keep the animal smaller than the tile so the colored square reads clearly.
  '& img': {
    position: 'relative',
    zIndex: 1,
    width: '68%',
    height: '68%',
    objectFit: 'contain',
  },
  '&:hover': $disabled ? undefined : { transform: 'scale(1.05)' },
  '&:active': $disabled ? undefined : { transform: 'scale(0.95)' },
  ...($wrong && { animation: 'shake 0.4s ease' }),
  ...($correct && {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: '1.5rem',
      background: $color ?? '#fff',
      backgroundImage:
        'linear-gradient(160deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.12) 100%)',
      border: '5px solid #2E7D32',
      boxShadow: '0 0 0 6px rgba(46, 125, 50, 0.25), 0 10px 22px rgba(46, 125, 50, 0.45)',
      zIndex: 0,
    },
  }),
  ...($disabled && { opacity: 0.4 }),
}));

// The prompt: a big picture of the animal to find, replacing the question
// text so the kid matches the target picture against the option tiles.
const QuestionImage = styled('img')({
  width: 'clamp(120px, 22vw, 180px)',
  height: 'clamp(120px, 22vw, 180px)',
  objectFit: 'contain',
  marginBottom: 8,
  animation: 'pulse 1.6s ease-in-out infinite',
});

// Green check badge shown on a correctly answered animal, mirroring the
// Number game's found tiles so the kid can see which pick was right.
const CheckBadge = styled('span')({
  position: 'absolute',
  top: '8%',
  right: '8%',
  width: 44,
  height: 44,
  borderRadius: '50%',
  background: '#2E7D32',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35)',
  animation: 'badge-pop 0.45s ease-out both',
  zIndex: 2,
});

const ConfettiPiece = styled('span')({
  position: 'fixed',
  top: -20,
  borderRadius: 2,
  zIndex: 1000,
  pointerEvents: 'none',
  animationName: 'confetti-fall',
  animationTimingFunction: 'linear',
  animationFillMode: 'forwards',
});

export { Stage, StageGrid, AnimalPhoto, ConfettiPiece, QuestionImage, CheckBadge };
