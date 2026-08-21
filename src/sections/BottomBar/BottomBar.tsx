import { Link, useLocation, useNavigate } from 'react-router';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { AppBar, Box, IconButton, Toolbar } from '@mui/material';

import LanguageToggle from '@/components/LanguageToggle';

// Maps each route to its parent route so the Back button can navigate up the tree.
const PARENT_ROUTES: Record<string, string> = {
  '/AnimalGuessPage': '/AnimalGame',
  '/AnimalGame': '/',
  '/page-3': '/',
  '/page-4': '/',
};

function BottomBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/';
  const parentRoute = PARENT_ROUTES[pathname];

  return (
    <AppBar position="fixed" color="default" elevation={3} sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar disableGutters sx={{ minHeight: 76, justifyContent: 'center', gap: 2, px: 2 }}>
        {parentRoute && (
          <IconButton
            onClick={() => navigate(parentRoute)}
            aria-label="back"
            data-pw="bottom-bar-back"
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#4D96FF',
              color: '#fff',
              boxShadow: '0 4px 0 rgba(0, 0, 0, 0.18)',
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'scale(1.08)' },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 36 }} />
          </IconButton>
        )}
        <IconButton
          component={Link}
          to="/"
          aria-label="home"
          data-pw="bottom-bar-home"
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FFAD33',
            color: '#fff',
            boxShadow: '0 4px 0 rgba(0, 0, 0, 0.18)',
            transition: 'transform 0.15s ease',
            '&:hover': { transform: 'scale(1.08)' },
            '&:active': { transform: 'scale(0.95)' },
          }}
        >
          <HomeIcon sx={{ fontSize: 36 }} />
        </IconButton>
        {isHome && (
          <Box data-pw="bottom-bar-language">
            <LanguageToggle />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default BottomBar;
