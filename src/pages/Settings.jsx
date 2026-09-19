import React from 'react';
import { useSettings } from '@/lib/SettingsContext';
import { Moon, Sun, Monitor, Check, Shield, Info, Download, Upload } from 'lucide-react';

const CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP', 'AUD', 'JPY', 'INR', 'CNY', 'MXN', 'BRL'];
const PRECISIONS = [0, 1, 2, 3, 4];

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-4">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-5">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</h2>
      <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { settings, update, accentPresets } = useSettings();

  const exportData = () => {
    const data = {
      settings,
      history: JSON.parse(localStorage.getItem('calcflow_history') || '[]'),
      favorites: JSON.parse(localStorage.getItem('calcflow_favorites') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'calcflow-data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.history) localStorage.setItem('calcflow_history', JSON.stringify(data.history));
        if (data.favorites) localStorage.setItem('calcflow_favorites', JSON.stringify(data.favorites));
        if (data.settings) localStorage.setItem('calcflow_settings', JSON.stringify(data.settings));
        window.location.reload();
      } catch { alert('Could not import this file.'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-5">Settings</h1>

      <Section title="Appearance">
        <Row label="Theme">
          <div className="flex gap-1.5">
            {[
              { id: 'light', icon: Sun },
              { id: 'dark', icon: Moon },
              { id: 'system', icon: Monitor },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => update('theme', id)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  settings.theme === id ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </Row>
        <Row label="Accent color">
          <div className="flex gap-2 flex-wrap justify-end">
            {accentPresets.map((c) => (
              <button
                key={c.value}
                onClick={() => update('accentColor', c.value)}
                className="w-7 h-7 rounded-full transition active:scale-90"
                style={{ backgroundColor: c.value, boxShadow: settings.accentColor === c.value ? '0 0 0 2px hsl(var(--background)), 0 0 0 4px ' + c.value : 'none' }}
              />
            ))}
          </div>
        </Row>
      </Section>

      <Section title="Calculations">
        <Row label="Default currency">
          <select
            value={settings.currency}
            onChange={(e) => update('currency', e.target.value)}
            className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium focus:outline-none"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Row>
        <Row label="Unit system">
          <select
            value={settings.unitSystem}
            onChange={(e) => update('unitSystem', e.target.value)}
            className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium focus:outline-none"
          >
            <option value="metric">Metric</option>
            <option value="imperial">Imperial</option>
            <option value="auto">Automatic</option>
          </select>
        </Row>
        <Row label="Decimal precision">
          <div className="flex gap-1">
            {PRECISIONS.map((p) => (
              <button
                key={p}
                onClick={() => update('decimalPrecision', p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                  settings.decimalPrecision === p ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section title="Feedback">
        <Row label="Haptic feedback">
          <button
            onClick={() => update('hapticFeedback', !settings.hapticFeedback)}
            className={`w-11 h-6 rounded-full transition ${settings.hapticFeedback ? 'bg-brand' : 'bg-secondary'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.hapticFeedback ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </Row>
        <Row label="Sound">
          <button
            onClick={() => update('sound', !settings.sound)}
            className={`w-11 h-6 rounded-full transition ${settings.sound ? 'bg-brand' : 'bg-secondary'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.sound ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </Row>
      </Section>

      <Section title="Data">
        <button onClick={exportData} className="w-full">
          <Row label="Export data"><Download size={18} className="text-muted-foreground" /></Row>
        </button>
        <label className="w-full cursor-pointer">
          <Row label="Import data"><Upload size={18} className="text-muted-foreground" /></Row>
          <input type="file" accept="application/json" className="hidden" onChange={importData} />
        </label>
      </Section>

      <Section title="About">
        <Row label="Privacy"><Shield size={18} className="text-muted-foreground" /></Row>
        <div className="px-4 py-3.5 text-xs text-muted-foreground">
          CalcFlow stores your history and favorites locally on your device. The Smart Calculator sends your text to an AI service to interpret your request. No account needed for basic features.
        </div>
        <Row label="Version"><span className="text-sm text-muted-foreground">1.0.0</span></Row>
      </Section>
    </div>
  );
}