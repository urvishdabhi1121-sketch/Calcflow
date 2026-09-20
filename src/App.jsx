import React, { createContext, useContext, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from '@/components/Layout';

export const SettingsContext = createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    return {
      theme: 'dark',
      decimalPlaces: 4,
      angleUnit: 'deg',
      history: [],
      setTheme: () => {},
      updateSettings: () => {},
    };
  }

  return context;
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    theme: 'dark',
    decimalPlaces: 4,
    angleUnit: 'deg',
    history: [],
  });

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

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

          {/* Main application layout with bottom navigation */}
          <Route element={<Layout />}>

            {routes.map(({ path, Component }) => (
              <Route
                key={path}
                path={path}
                element={<Component />}
              />
            ))}

            {/* Default page */}
            <Route path="/" element={<Navigate to="/home" replace />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />

        </Routes>
      </HashRouter>
    </SettingsProvider>
  );
}
