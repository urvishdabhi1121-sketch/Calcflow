import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, Copy, Save, Star, RefreshCw, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResultCard from '@/components/ResultCard';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatNumber, formatCurrency } from '@/lib/format';

const SAMPLES = [
  '20% off $100',
  '$5.99 for 750g vs $8.99 for 1.2kg',
  'I worked 42 hours at $24/hour with 2 hours overtime at 1.5x',
  '12 ft × 15 ft flooring with 10% waste at $4.20/sqft',
  '$5000 loan at 6.5% for 5 years',
  '500 km trip at 7L/100km and $1.60/L',
  'Convert 25 psi to kPa',
  'Calculate 15% increase from $80',
];

export default function SmartCalculator() {
  const location = useLocation();
  const { settings } = useSettings();
  const [query, setQuery] = useState(location.state?.query || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const calculate = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('smartCalculate', { query: q });
      const data = res.data;
      if (data?.error) { setError(data.error); }
      else {
        setResult(data);
        addHistory({
          type: 'smart',
          category: 'Smart',
          expression: q,
          result: data.understood === false ? 'Clarification needed' : String(data.result_value ?? ''),
        });
      }
    } catch (e) {
      setError('Could not process that calculation right now. Please try rephrasing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.query) {
      setQuery(location.state.query);
      calculate(location.state.query);
    }
  }, []);

  const fmtVal = (v, isCurrency) =>
    isCurrency ? formatCurrency(v, settings.currency, settings.decimalPrecision) : formatNumber(v, settings.decimalPrecision);

  return (
    <div className="px-4 py-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition no-tap-highlight">
          <ChevronLeft size={22} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
          <Sparkles size={20} />
        </div>
        <h1 className="text-xl font-semibold">Smart Calculator</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 mb-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you want to calculate..."
          rows={3}
          className="w-full bg-transparent resize-none focus:outline-none text-base placeholder:text-muted-foreground/60"
        />
        <button
          onClick={() => calculate(query)}
          disabled={loading || !query.trim()}
          className="w-full mt-2 py-2.5 rounded-xl bg-brand text-brand-foreground font-medium disabled:opacity-50 active:scale-[0.98] transition no-tap-highlight flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Calculating...</> : <><Sparkles size={18} /> Calculate</>}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}

      {result && (
        result.understood === false ? (
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm animate-scale-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="font-medium mb-1">Let me clarify</div>
                <p className="text-sm text-muted-foreground">{result.clarification}</p>
              </div>
            </div>
          </div>
        ) : (
          <ResultCard
            label={result.result_label || 'Result'}
            value={result.result_value}
            isCurrency={result.result_is_currency}
            breakdown={(result.breakdown || []).map((b) => ({ label: b.label, value: b.value }))}
            assumptions={result.assumptions || []}
            explanation={result.explanation}
            actions={[
              { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(fmtVal(result.result_value, result.result_is_currency)) },
              { label: 'Save', icon: Save, onClick: () => addFavorite({ type: 'smart', title: query, subtitle: fmtVal(result.result_value, result.result_is_currency), category: 'Smart' }) },
              { label: 'Recalculate', icon: RefreshCw, onClick: () => calculate(query) },
            ]}
          />
        )
      )}

      {!result && !loading && !error && (
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Try an example</h2>
          <div className="space-y-2">
            {SAMPLES.map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); calculate(s); }}
                className="w-full text-left rounded-2xl border border-border bg-card px-4 py-3 text-sm hover:border-brand/30 hover:bg-accent/50 transition active:scale-[0.98] no-tap-highlight"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}