import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Safe Settings Context Fallback to resolve "useSettings must be used within SettingsProvider"
export const SettingsContext = createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    // Provide safe defaults if no context is found
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
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

// 2. Dynamically load your pages
const pageModules = import.meta.glob('./pages/**/*.{jsx,tsx,js}', { eager: true });

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

    routes.push({ path: routePath, Component });
  }
  return routes;
}

export default function App() {
  const routes = getRoutes();
  const FallbackComponent = routes.length > 0 ? routes[0].Component : () => (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans">
      <p>Loading Calcflow...</p>
    </div>
  );

  return (
    <SettingsProvider>
      <HashRouter>
        <Routes>
          {routes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="/" element={<FallbackComponent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </SettingsProvider>
  );
}
