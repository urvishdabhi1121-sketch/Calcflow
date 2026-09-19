import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const SettingsContext = createContext(null);

const DEFAULTS = {
  theme: 'system',
  accentColor: '#2563eb',
  currency: 'USD',
  unitSystem: 'metric',
  decimalPrecision: 2,
  hapticFeedback: true,
  sound: false,
  startScreen: 'home',
  onboarded: false,
};

const ACCENT_PRESETS = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Amber', value: '#d97706' },
];

function hexToHslChannels(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('calcflow_settings') || '{}') };
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('calcflow_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark) => {
      if (dark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    if (settings.theme === 'dark') apply(true);
    else if (settings.theme === 'light') apply(false);
    else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const handler = (e) => apply(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand', hexToHslChannels(settings.accentColor));
  }, [settings.accentColor]);

  const update = useCallback((key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, update, accentPresets: ACCENT_PRESETS }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}