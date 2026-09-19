import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auto-import all page components present in your pages directory
const pageModules = import.meta.glob('./pages/**/*.{jsx,tsx,js}', { eager: true });

function getPages() {
  const routes = [];
  for (const path in pageModules) {
    const Component = pageModules[path].default;
    if (!Component) continue;

    // Convert file paths like ./pages/Home.jsx or ./pages/index.jsx to routes
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
  const pages = getPages();
  const DefaultComponent = pages.length > 0 ? pages[0].Component : () => (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Calcflow</h1>
      <p>App mounted successfully. Add or check your pages in <code>src/pages/</code>.</p>
    </div>
  );

  return (
    <HashRouter>
      <Routes>
        {pages.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        {/* Default / fallback route */}
        <Route path="/" element={<DefaultComponent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
