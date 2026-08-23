import { type PointerEvent as ReactPointerEvent, useMemo, useRef, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box, Button, Stack, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

import { type ColoringItem, ITEMS, type Region } from './items';
import { EMPTY_FILL, PALETTE } from './palette';

// Brush radius in SVG user units (viewBox is 0 0 200 200).
const BRUSH_R = 10;

// A single dab of paint at a touch position.
interface Dab {
  x: number;
  y: number;
  color: string;
}

// Renders one region as the matching SVG element with the given paint props.
function renderShape(region: Region, paint: Record<string, string | number>) {
  const { shape, props } = region;
  switch (shape) {
    case 'rect':
      return <rect {...(props as object)} {...paint} />;
    case 'circle':
      return <circle {...(props as object)} {...paint} />;
    case 'ellipse':
      return <ellipse {...(props as object)} {...paint} />;
    case 'polygon':
      return <polygon {...(props as object)} {...paint} />;
    case 'path':
      return <path {...(props as object)} {...paint} />;
    default:
      return null;
  }
}

// Renders an item's SVG. `dabs` maps region id -> list of paint dabs.
// Painting happens only at the touch position: each dab is a small circle
// clipped to its region, so color never fills the whole zone.
function ItemSvg({
  item,
  dabs,
  onPaint,
  interactive,
}: {
  item: ColoringItem;
  dabs: Record<string, Dab[]>;
  onPaint?: (regionId: string, x: number, y: number) => void;
  interactive?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const paintingRef = useRef(false);

  // Convert a pointer event to SVG user-space coordinates.
  const toSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  };

  // Find the region under a client point (hit targets carry data-region-id).
  const regionAt = (clientX: number, clientY: number): string | null => {
    const el = document.elementFromPoint(clientX, clientY);
    const regionEl = el?.closest?.('[data-region-id]') as HTMLElement | null;
    return regionEl?.dataset.regionId ?? null;
  };

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (!interactive || !onPaint) return;
    const regionId = regionAt(e.clientX, e.clientY);
    if (!regionId) return;
    paintingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = toSvgPoint(e.clientX, e.clientY);
    if (p) onPaint(regionId, p.x, p.y);
  };

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (!interactive || !onPaint || !paintingRef.current) return;
    const regionId = regionAt(e.clientX, e.clientY);
    if (!regionId) return;
    const p = toSvgPoint(e.clientX, e.clientY);
    if (p) onPaint(regionId, p.x, p.y);
  };

  const stopPainting = () => {
    paintingRef.current = false;
  };

  return (
    <svg
      ref={svgRef}
      viewBox={item.viewBox}
      width="100%"
      height="100%"
      role="img"
      aria-label={item.nameKey}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopPainting}
      onPointerLeave={stopPainting}
      onPointerCancel={stopPainting}
      style={{ touchAction: 'none', display: 'block' }}
    >
      <defs>
        {item.regions.map((region) => (
          <clipPath key={region.id} id={`clip-${item.id}-${region.id}`}>
            {renderShape(region, {})}
          </clipPath>
        ))}
      </defs>

      {/* Base + hit target + dabs, interleaved per region to preserve z-order. */}
      {item.regions.map((region) => (
        <g key={region.id}>
          <g style={{ pointerEvents: 'none' }}>{renderShape(region, { fill: EMPTY_FILL })}</g>
          {/* Invisible hit target carrying the region id for hit-testing. */}
          <g data-region-id={region.id} style={{ pointerEvents: interactive ? 'all' : 'none' }}>
            {renderShape(region, { fill: 'transparent', stroke: 'none' })}
          </g>
          {/* Dabs clipped to this region so paint stays inside its boundary. */}
          <g clipPath={`url(#clip-${item.id}-${region.id})`} style={{ pointerEvents: 'none' }}>
            {(dabs[region.id] ?? []).map((dab, i) => (
              <circle key={i} cx={dab.x} cy={dab.y} r={BRUSH_R} fill={dab.color} />
            ))}
          </g>
        </g>
      ))}

      {/* Outline layer on top so the picture's lines stay crisp. */}
      <g style={{ pointerEvents: 'none' }}>
        {item.regions.map((region) => (
          <g key={region.id}>
            {renderShape(region, {
              fill: 'none',
              stroke: '#343A40',
              strokeWidth: 3,
              strokeLinejoin: 'round',
            })}
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function ColoringGame() {
  const { t } = useLanguage();
  const [activeItem, setActiveItem] = useState<ColoringItem | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(PALETTE[0].color);
  const [dabs, setDabs] = useState<Record<string, Dab[]>>({});

  const totalRegions = activeItem?.regions.length ?? 0;
  const coloredCount = useMemo(
    () => Object.values(dabs).filter((list) => list.length > 0).length,
    [dabs],
  );
  const isComplete = activeItem !== null && coloredCount === totalRegions;

  const openItem = (item: ColoringItem) => {
    setActiveItem(item);
    setDabs({});
    setSelectedColor(PALETTE[0].color);
  };

  // Add a dab of the selected color at the touch position within a region.
  // Dabs closer than ~3 SVG units to the previous one are skipped so a long
  // drag doesn't create thousands of circles.
  const paint = (regionId: string, x: number, y: number) => {
    setDabs((prev) => {
      const list = prev[regionId] ?? [];
      const last = list[list.length - 1];
      if (last) {
        const dx = last.x - x;
        const dy = last.y - y;
        if (dx * dx + dy * dy < 9) return prev;
      }
      return { ...prev, [regionId]: [...list, { x, y, color: selectedColor }] };
    });
  };

  const resetDabs = () => setDabs({});

  // ---- Coloring screen (portrait, picture as large as possible) ----
  if (activeItem) {
    return (
      <Box
        sx={{
          height: '100vh',
          minHeight: '100dvh',
          bgcolor: '#FFFCEB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 1.5,
          pt: 1.5,
          pb: 1.5,
          overflow: 'hidden',
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#333" sx={{ mb: 1 }}>
          {t[activeItem.nameKey]}
        </Typography>

        {/* Picture fills the remaining vertical space, as big as it can be. */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              height: '100%',
              aspectRatio: '1 / 1',
              maxWidth: '100%',
              bgcolor: '#fff',
              borderRadius: '1.5rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              p: 1,
            }}
          >
            <ItemSvg item={activeItem} dabs={dabs} onPaint={paint} interactive />
          </Box>
        </Box>

        {isComplete && (
          <Typography variant="subtitle1" color="#2F9E44" fontWeight="bold" sx={{ my: 0.5 }}>
            {t.coloringComplete}
          </Typography>
        )}

        {/* Palette */}
        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ my: 1 }}>
          {PALETTE.map((swatch) => {
            const selected = selectedColor === swatch.color;
            return (
              <Box
                key={swatch.color}
                onClick={() => setSelectedColor(swatch.color)}
                aria-label={swatch.name}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: swatch.color,
                  border: selected ? '4px solid #343A40' : '3px solid rgba(0,0,0,0.15)',
                  transform: selected ? 'scale(1.12)' : 'scale(1)',
                  transition: 'transform 0.15s ease, border 0.15s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                {selected && <CheckIcon fontSize="small" />}
              </Box>
            );
          })}
        </Stack>

        <Typography variant="body2" color="#666" sx={{ mb: 1, textAlign: 'center' }}>
          {t.coloringHint}
        </Typography>

        <Button
          startIcon={<RestartAltIcon />}
          onClick={resetDabs}
          variant="outlined"
          color="primary"
          sx={{ borderRadius: 3, px: 3, py: 0.8, fontWeight: 'bold' }}
        >
          {t.coloringReset}
        </Button>
      </Box>
    );
  }

  // ---- Home grid ----
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#FFFCEB',
        px: 2,
        pt: 3,
        pb: 12,
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="#333" align="center" sx={{ mb: 1 }}>
        {t.coloringTitle}
      </Typography>
      <Typography variant="body1" color="#666" align="center" sx={{ mb: 3 }}>
        {t.coloringChoose}
      </Typography>

      <Stack
        direction="row"
        spacing={3}
        flexWrap="wrap"
        justifyContent="center"
        sx={{ maxWidth: 560, mx: 'auto' }}
      >
        {ITEMS.map((item) => (
          <Box
            key={item.id}
            onClick={() => openItem(item)}
            sx={{
              width: 150,
              bgcolor: '#fff',
              borderRadius: '1.5rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              p: 1.5,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <Box sx={{ width: '100%', aspectRatio: '1 / 1' }}>
              <ItemSvg item={item} dabs={{}} />
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" color="#333" sx={{ mt: 1 }}>
              {t[item.nameKey]}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
