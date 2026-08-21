import TranslateIcon from '@mui/icons-material/Translate';
import { Button } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';

/**
 * Floating button (bottom-right) that switches the app between English and
 * Vietnamese. It affects both the on-screen text and the spoken voice.
 */
export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const next = lang === 'en' ? 'vi' : 'en';

  return (
    <Button
      variant="contained"
      startIcon={<TranslateIcon />}
      onClick={() => setLang(next)}
      aria-label={next === 'vi' ? 'Chuyển sang tiếng Việt' : 'Switch to English'}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1300,
        borderRadius: '2rem',
        px: 2.5,
        py: 1.2,
        fontWeight: 700,
        fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        bgcolor: next === 'vi' ? '#4D96FF' : '#6BCB77',
        '&:hover': { bgcolor: next === 'vi' ? '#3B7FE0' : '#57B866' },
      }}
    >
      {next === 'vi' ? 'Tiếng Việt' : 'English'}
    </Button>
  );
}
