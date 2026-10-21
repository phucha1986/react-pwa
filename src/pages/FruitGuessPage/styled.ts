import { styled } from '@mui/material/styles';

const Stage = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 24,
  width: '100%',
});

const StageGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gridTemplateRows: 'repeat(2, auto)',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  width: '100%',
  maxWidth: 560,
  minWidth: 0,
});

// The pastel circle is a background layer *behind* the emoji (via ::before),
// so the fruit is never clipped or overlapped by the circle.
const FruitPhoto = styled('button')<{
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
  userSelect: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: $color ?? '#fff',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    zIndex: 0,
  },
  '& img': {
    position: 'relative',
    zIndex: 1,
    width: 'clamp(72px, 20vw, 144px)',
    height: 'auto',
    display: 'block',
  },
  '&:hover': $disabled ? undefined : { transform: 'scale(1.05)' },
  '&:active': $disabled ? undefined : { transform: 'scale(0.95)' },
  ...($wrong && { animation: 'shake 0.4s ease' }),
  ...($correct && {
    '&::before': {
      boxShadow: '0 0 0 6px rgba(107, 203, 119, 0.5), 0 8px 24px rgba(0, 0, 0, 0.12)',
    },
  }),
  ...($disabled && { opacity: 0.4 }),
}));

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

export { Stage, StageGrid, FruitPhoto, ConfettiPiece };
