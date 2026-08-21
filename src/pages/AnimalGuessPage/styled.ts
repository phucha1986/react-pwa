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
  gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
  gridTemplateRows: 'auto auto auto',
  gridTemplateAreas: `
    ". top ."
    "left photo right"
    ". bottom ."
  `,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  width: '100%',
  maxWidth: 640,
  minWidth: 0,
});

// The white circle is a background layer *behind* the image (via ::before),
// so the animal art is never clipped or overlapped by the circle.
const AnimalPhoto = styled('div')<{ $bounce?: boolean }>(({ $bounce }) => ({
  gridArea: 'photo',
  position: 'relative',
  width: 'min(220px, 42vw)',
  height: 'min(220px, 42vw)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: $bounce ? 'bounce 0.8s ease infinite' : 'pop-in 0.5s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    zIndex: 0,
  },
  '& img': {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
}));

const NameButton = styled('button')<{
  $area: string;
  $color: string;
  $wrong?: boolean;
  $correct?: boolean;
  $disabled?: boolean;
}>(({ $area, $color, $wrong, $correct, $disabled }) => ({
  gridArea: $area,
  fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
  fontSize: 'clamp(20px, 4.5vw, 32px)',
  fontWeight: 600,
  color: '#fff',
  background: $color,
  border: 'none',
  borderRadius: 999,
  padding: '14px 26px',
  maxWidth: '100%',
  cursor: 'pointer',
  boxShadow: '0 4px 0 rgba(0, 0, 0, 0.18)',
  transition: 'transform 0.15s ease, opacity 0.3s ease',
  '&:hover': $disabled ? undefined : { transform: 'scale(1.08)' },
  '&:active': $disabled ? undefined : { transform: 'scale(0.95)' },
  ...($wrong && { animation: 'shake 0.4s ease' }),
  ...($correct && {
    animation: 'pop-in 0.5s ease',
    boxShadow: '0 0 0 6px rgba(107, 203, 119, 0.5), 0 4px 0 rgba(0, 0, 0, 0.18)',
  }),
  ...($disabled && { opacity: 0.4, cursor: 'default' }),
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

export { Stage, StageGrid, AnimalPhoto, NameButton, ConfettiPiece };
