import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from '@/components/Layout';
import {
  SettingsProvider,
} from '@/lib/SettingsContext';

const pageModules = import.meta.glob('./pages/**/*.{jsx,tsx,js}', {
  eager: true,
});

function getRoutes() {
  const routes = [];

  for (const path in pageModules) {
    const Component = pageModules[path].default;

    if (!Component) continue;

    let routePath = path
      .replace('./pages', '')
      .replace(/\.(jsx|tsx|js)$/, '')
      .toLowerCase();

    if (routePath.endsWith('/index') || routePath === '/index') {
      routePath = routePath.replace(/\/index$/, '') || '/';
    }

    routes.push({
      path: routePath,
      Component,
    });
  }

  return routes;
}

export default function App() {
  const routes = getRoutes();

  return (
    <SettingsProvider>
      <HashRouter>
        <Routes>

          {/* Main application layout */}
          <Route element={<Layout />}>

            {routes
              .filter(({ path }) =>
                ![
                  '/login',
                  '/register',
                  '/forgotpassword',
                  '/resetpassword',
                  '/oauthconsent',
                  '/onboarding',
                ].includes(path)
              )
              .map(({ path, Component }) => (
                <Route
                  key={path}
                  path={path}
                  element={<Component />}
                />
              ))}

            <Route
              path="/"
              element={<Navigate to="/home" replace />}
            />

          </Route>

          {/* Pages that should NOT show bottom navigation */}
          {routes
            .filter(({ path }) =>
              [
                '/login',
                '/register',
                '/forgotpassword',
                '/resetpassword',
                '/oauthconsent',
                '/onboarding',
              ].includes(path)
            )
            .map(({ path, Component }) => (
              <Route
                key={path}
                path={path}
                element={<Component />}
              />
            ))}

          {/* Unknown page */}
          <Route
            path="*"
            element={<Navigate to="/home" replace />}
          />

        </Routes>
      </HashRouter>
    </SettingsProvider>
  );
}
