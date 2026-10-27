import { useEffect, useState } from 'react';

import { Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';

// Archify's host-side stylesheet: defines the CSS variables + palette the
// rendered SVG references. The package's `exports` map exposes this as
// `@spexcode/archify/diagram.css`.
import '@spexcode/archify/diagram.css';

import { useLanguage } from '@/i18n/useLanguage';

// The SVG is authored as Archify JSON-IR (`architecture/react-pwa.architecture.json`)
// and rendered at Vite startup by `scripts/vite-plugin-archify.mjs` into
// `public/architecture/architecture.svg`. We fetch it here and inline it so
// the diagram scales to the container width and stays crisp.
const SVG_URL = 'architecture/architecture.svg';

function ArchitecturePage() {
  const { t } = useLanguage();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(SVG_URL)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((text) => !cancelled && setSvg(text))
      .catch((e) => !cancelled && setError(String(e.message ?? e)));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 6, px: { xs: 2, md: 4 } }}>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          🏛️ {t.architectureTitle}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
          {t.architectureHint}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            href="architecture/architecture.html"
            target="_blank"
            rel="noreferrer"
          >
            Open Archify interactive viewer ↗
          </Button>
          <Button
            variant="text"
            size="small"
            href="architecture/architecture.svg"
            target="_blank"
            rel="noreferrer"
          >
            Download SVG
          </Button>
          <Button
            variant="text"
            size="small"
            href="https://github.com/tt-a1i/archify"
            target="_blank"
            rel="noreferrer"
          >
            About Archify
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={2}
        sx={{
          p: { xs: 1, md: 2 },
          borderRadius: 3,
          overflow: 'auto',
          bgcolor: 'background.paper',
        }}
      >
        {error ? (
          <Typography color="error" sx={{ p: 3 }}>
            Failed to load diagram: {error}
          </Typography>
        ) : svg ? (
          // Host contract for @spexcode/archify: wrap the SVG in a
          // <div class="archify" data-detail-level="read"> so the runtime's
          // stylesheet (imported above) styles the CSS variables the SVG uses.
          <Box
            component="div"
            className="archify"
            data-detail-level="read"
            sx={{ width: '100%', overflow: 'auto' }}
            // The SVG is our own build output (not user input), so inlining
            // it as HTML is safe.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default ArchitecturePage;
