import { Route } from 'react-router';

import type { Theme } from '@mui/material';

import { objectInsertIf } from '@/utils/insertIf';

import { Routes } from '../types';

function getPageHeight(theme: Theme) {
  const bottomSpacing = 76 + parseInt(theme.spacing(1));

  return `calc(100vh - ${bottomSpacing}px)`;
}

function renderRoutes(routes: Routes) {
  return routes.map(({ path, component: Component, routes: nestedRoutes }) => {
    return (
      <Route
        key={path}
        path={path}
        element={<Component />}
        {...objectInsertIf(nestedRoutes, {
          children: nestedRoutes && renderRoutes(nestedRoutes as Routes),
        })}
      />
    );
  });
}

export { getPageHeight, renderRoutes };
