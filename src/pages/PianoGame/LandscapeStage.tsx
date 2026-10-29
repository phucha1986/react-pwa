import { useEffect, useRef, useState } from 'react';

import { Box } from '@mui/material';

import useOrientation from '@/hooks/useOrientation';

interface LandscapeStageProps {
  children: React.ReactNode;
  /** Height available to the stage (any CSS length). */
  height?: string;
}

/**
 * The piano game is always landscape. On a portrait phone the stage is rotated
 * 90 degrees so the falling-notes half stays on top and the keys stay under the
 * child's thumbs, instead of becoming a tall narrow column.
 *
 * The host keeps the real (unrotated) box so the page still fits the viewport;
 * the inner box is sized swapped (height x width) and rotated about its top-left
 * corner, which lands exactly back inside the host.
 */
export default function LandscapeStage({ children, height = '100%' }: LandscapeStageProps) {
  const isPortrait = useOrientation();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const measure = () => {
      const rect = host.getBoundingClientRect();
      setBox({ w: rect.width, h: rect.height });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const rotate = isPortrait && box.w > 0 && box.h > 0;

  return (
    <Box
      ref={hostRef}
      data-pw="piano-stage"
      sx={{ position: 'relative', width: '100%', height, minHeight: 240, overflow: 'hidden' }}
    >
      {rotate ? (
        <Box
          data-pw="piano-landscape"
          sx={{
            position: 'absolute',
            top: 0,
            left: box.w,
            width: box.h,
            height: box.w,
            transform: 'rotate(90deg)',
            transformOrigin: 'top left',
          }}
        >
          {children}
        </Box>
      ) : (
        <Box data-pw="piano-landscape" sx={{ width: '100%', height: '100%' }}>
          {children}
        </Box>
      )}
    </Box>
  );
}
