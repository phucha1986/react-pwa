import { Box } from '@mui/material';

import { GOLD } from './palette';

/** Simple star row (no rating widget needed — keeps the DOM test-friendly). */
export default function Stars({ count, size = 20 }: { count: number; size?: number }) {
  return (
    <Box data-pw="stars" sx={{ display: 'flex', gap: 0.5, fontSize: size, lineHeight: 1 }}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          data-pw={`star-${i}`}
          sx={{
            color: i <= count ? GOLD : '#3d4a6d',
            fontWeight: 700,
          }}
        >
          ★
        </Box>
      ))}
    </Box>
  );
}
