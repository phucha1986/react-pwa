import { Fragment } from 'react';
import { BrowserRouter } from 'react-router';

import { CssBaseline } from '@mui/material';

import { withErrorHandler } from '@/error-handling';
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App';
import { LanguageProvider } from '@/i18n';

import Pages from './routes/Pages';
import BottomBar from './sections/BottomBar';
import HotKeys from './sections/HotKeys';
import Sidebar from './sections/Sidebar';

function AppContent() {
  return (
    <Fragment>
      <CssBaseline />
      <HotKeys />
      <Sidebar />
      <Pages />
      <BottomBar />
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
