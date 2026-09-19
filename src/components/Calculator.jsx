import React, { useState, useEffect, useRef, useCallback } from 'react';
import { evaluateExpression } from '@/lib/calcEngine';
import { formatNumber } from '@/lib/format';
import { addHistory } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { Copy, Undo2, Redo2, Check } from 'lucide-react';

const KEYS = [
  { label: 'AC', action: 'clear', variant: 'fn' },
  { label: '±', action: 'negate', variant: 'fn' },
  { label: '%', action: 'op', value: '%', variant: 'fn' },
  { label: '÷', action: 'op', value: '/', variant: 'op' },
  { label: '7', action: 'num', value: '7' },
  { label: '8', action: 'num', value: '8' },
  { label: '9', action: 'num', value: '9' },
  { label: '×', action: 'op', value: '*', variant: 'op' },
  { label: '4', action: 'num', value: '4' },
  { label: '5', action: 'num', value: '5' },
  { label: '6', action: 'num', value: '6' },
  { label: '−', action: 'op', value: '-', variant: 'op' },
  { label: '1', action: 'num', value: '1' },
  { label: '2', action: 'num', value: '2' },
  { label: '3', action: 'num', value: '3' },
  { label: '+', action: 'op', value: '+', variant: 'op' },
  { label: '0', action: 'num', value: '0', wide: true },
  { label: '.', action: 'num', value: '.' },
  { label: '=', action: 'equals', variant: 'brand' },
];

export default function Calculator() {
  const { settings } = useSettings();
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [memory, setMemory] = useState(0);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const displayRef = useRef(null);

  const pushUndo = useCallback((val) => {
    setUndoStack((s) => [...s.slice(-30), val]);
    setRedoStack([]);
  }, []);

  const handleInput = useCallback((key) => {
    if (key.action === 'clear') {
      pushUndo(expr);
      setExpr('');
      setResult(null);
      setError(null);
      setJustEvaluated(false);
      return;
    }
    if (key.action === 'equals') {
      const { value, error } = evaluateExpression(expr);
      if (error) { setError(error); return; }
      pushUndo(expr);
      setResult(value);
      setError(null);
      setJustEvaluated(true);
      addHistory({
        type: 'basic',
        category: 'Basic',
        expression: expr,
        result: formatNumber(value, settings.decimalPrecision),
      });
      return;
    }
    if (key.action === 'negate') {
      pushUndo(expr);
      setExpr((e) => (e.startsWith('-') ? e.slice(1) : '-' + e));
      return;
    }
    pushUndo(expr);
    if (justEvaluated && key.action === 'num') {
      setExpr(key.value);
      setJustEvaluated(false);
      setResult(null);
      return;
    }
    if (justEvaluated && key.action === 'op') {
      setExpr(String(result ?? ''));
      setJustEvaluated(false);
    }
    setError(null);
    setExpr((e) => e + key.value);
  }, [expr, justEvaluated, result, settings.decimalPrecision, pushUndo]);

  // keyboard support
  useEffect(() => {
    const handler = (e) => {
      const k = e.key;
      if (/[0-9.]/.test(k)) { handleInput({ action: 'num', value: k }); e.preventDefault(); }
      else if (k === '+' || k === '-') { handleInput({ action: 'op', value: k }); e.preventDefault(); }
      else if (k === '*') { handleInput({ action: 'op', value: '*' }); e.preventDefault(); }
      else if (k === '/') { handleInput({ action: 'op', value: '/' }); e.preventDefault(); }
      else if (k === '%') { handleInput({ action: 'op', value: '%' }); e.preventDefault(); }
      else if (k === '(' || k === ')') { handleInput({ action: 'num', value: k }); e.preventDefault(); }
      else if (k === 'Enter' || k === '=') { handleInput({ action: 'equals' }); e.preventDefault(); }
      else if (k === 'Backspace') { setExpr((e) => e.slice(0, -1)); e.preventDefault(); }
      else if (k === 'Escape') { handleInput({ action: 'clear' }); e.preventDefault(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleInput]);

  // live preview
  useEffect(() => {
    if (!expr) { setResult(null); setError(null); return; }
    const { value, error } = evaluateExpression(expr);
    if (error) { setError(null); setResult(null); }
    else setResult(value);
  }, [expr]);

  const undo = () => {
    setUndoStack((s) => {
      if (!s.length) return s;
      const prev = s[s.length - 1];
      setRedoStack((r) => [...r, expr]);
      setExpr(prev);
      return s.slice(0, -1);
    });
  };
  const redo = () => {
    setRedoStack((r) => {
      if (!r.length) return r;
      const next = r[r.length - 1];
      setUndoStack((s) => [...s, expr]);
      setExpr(next);
      return r.slice(0, -1);
    });
  };

  const copyResult = () => {
    if (result === null) return;
    navigator.clipboard?.writeText(String(formatNumber(result, settings.decimalPrecision)));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const memAdd = () => setMemory((m) => m + (result || 0));
  const memSub = () => setMemory((m) => m - (result || 0));
  const memRecall = () => { pushUndo(expr); setExpr((e) => e + String(memory)); };
  const memClear = () => setMemory(0);

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Display */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{memory !== 0 ? `M = ${formatNumber(memory, 2)}` : ''}</span>
          <div className="flex gap-2">
            <button onClick={undo} disabled={!undoStack.length} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition"><Undo2 size={16} /></button>
            <button onClick={redo} disabled={!redoStack.length} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition"><Redo2 size={16} /></button>
            <button onClick={copyResult} disabled={result === null} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition">
              {copied ? <Check size={16} className="text-brand" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        <div ref={displayRef} className="min-h-[2.5rem] text-right text-2xl font-semibold text-muted-foreground break-all">
          {expr || '0'}
        </div>
        <div className="text-right text-4xl font-bold mt-1 break-all min-h-[3rem]">
          {error ? <span className="text-destructive text-lg">{error}</span> : result !== null ? formatNumber(result, settings.decimalPrecision) : ''}
        </div>
      </div>

      {/* Memory row */}
      <div className="flex gap-1 px-3 pb-2">
        {[
          { label: 'MC', fn: memClear },
          { label: 'MR', fn: memRecall },
          { label: 'M+', fn: memAdd },
          { label: 'M−', fn: memSub },
        ].map((m) => (
          <button key={m.label} onClick={m.fn} className="flex-1 py-2 text-xs font-medium text-muted-foreground rounded-lg hover:bg-muted transition no-tap-highlight">
            {m.label}
          </button>
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1.5 p-3 pt-1">
        {KEYS.map((key) => (
          <button
            key={key.label}
            onClick={() => handleInput(key)}
            className={[
              'touch-target rounded-2xl text-xl font-semibold transition active:scale-95 no-tap-highlight',
              key.wide ? 'col-span-2' : '',
              key.variant === 'fn' ? 'bg-muted text-foreground' : '',
              key.variant === 'op' ? 'bg-brand/10 text-brand' : '',
              key.variant === 'brand' ? 'bg-brand text-brand-foreground' : '',
              !key.variant ? 'bg-secondary text-foreground' : '',
            ].join(' ')}
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  );
}