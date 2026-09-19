import React from 'react';
import { Copy, Save, Share2, Star } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/format';
import { useSettings } from '@/lib/SettingsContext';

export default function ResultCard({ label, value, isCurrency = true, breakdown = [], actions = [], assumptions = [], explanation }) {
  const { settings } = useSettings();
  const formatted = isCurrency
    ? formatCurrency(Number(value), settings.currency, settings.decimalPrecision)
    : formatNumber(Number(value), settings.decimalPrecision);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm animate-scale-in">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className="text-4xl font-bold mt-1 break-all">{formatted}</div>
      {breakdown.length > 0 && (
        <div className="mt-4 space-y-2.5 border-t border-border pt-4">
          {breakdown.map((row, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium tabular-nums">
                {row.suffix
                  ? `${formatNumber(row.value, settings.decimalPrecision)}${row.suffix}`
                  : isCurrency
                    ? formatCurrency(Number(row.value), settings.currency, settings.decimalPrecision)
                    : formatNumber(Number(row.value), settings.decimalPrecision)}
              </span>
            </div>
          ))}
        </div>
      )}
      {explanation && (
        <p className="mt-4 text-xs text-muted-foreground bg-muted rounded-xl p-3">{explanation}</p>
      )}
      {assumptions.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-medium text-muted-foreground mb-1.5">Assumptions</div>
          <ul className="space-y-1">
            {assumptions.map((a, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                <span>•</span><span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {actions.length > 0 && (
        <div className="mt-4 flex gap-2 flex-wrap border-t border-border pt-4">
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-sm font-medium hover:bg-accent transition active:scale-95 no-tap-highlight"
            >
              {a.icon && <a.icon size={15} />}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}