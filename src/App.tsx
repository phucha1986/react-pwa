import { Fragment } from 'react';
import { BrowserRouter, useLocation } from 'react-router';

import { CssBaseline } from '@mui/material';

import LanguageToggle from '@/components/LanguageToggle';
import { withErrorHandler } from '@/error-handling';
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App';
import { LanguageProvider } from '@/i18n';

import Pages from './routes/Pages';
import Header from './sections/Header';
import HotKeys from './sections/HotKeys';
import Sidebar from './sections/Sidebar';

function AppContent() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <Fragment>
      <CssBaseline />
      <HotKeys />
      <Header />
      <Sidebar />
      <Pages />
      {isHome && <LanguageToggle />}
    </Fragment>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  );
}

const AppWithErrorHandler = withErrorHandler(App, AppErrorBoundaryFallback);
export default AppWithErrorHandler;
