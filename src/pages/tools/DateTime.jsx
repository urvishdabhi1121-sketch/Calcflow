import React, { useState, useMemo } from 'react';
import { Calendar, Copy, Save } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcDateDiff, calcDateAdd } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { formatNumber } from '@/lib/format';

const MODES = [
  { id: 'diff', label: 'Date difference' },
  { id: 'add', label: 'Add / subtract days' },
];

export default function DateTime() {
  const [mode, setMode] = useState('diff');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [base, setBase] = useState('');
  const [days, setDays] = useState('');
  const result = useMemo(() => {
    if (mode === 'diff') return start && end ? calcDateDiff(start, end) : null;
    return base ? calcDateAdd(base, days) : null;
  }, [mode, start, end, base, days]);

  return (
    <ToolLayout title="Date & Time" icon={Calendar}>
      <div className="flex gap-2 mb-4">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${mode === m.id ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'}`}>
            {m.label}
          </button>
        ))}
      </div>
      {mode === 'diff' ? (
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-sm font-medium text-foreground/80 block mb-1.5">Start date</label>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-xl bg-card border border-input px-3.5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80 block mb-1.5">End date</label>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full rounded-xl bg-card border border-input px-3.5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition" />
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-sm font-medium text-foreground/80 block mb-1.5">Base date</label>
            <input type="date" value={base} onChange={(e) => setBase(e.target.value)} className="w-full rounded-xl bg-card border border-input px-3.5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition" />
          </div>
          <NumberInput label="Days to add (use negative to subtract)" value={days} onChange={setDays} />
        </div>
      )}
      {result?.error && <p className="text-sm text-destructive mb-4">{result.error}</p>}
      {result && !result.error && (
        <ResultCard
          label={mode === 'diff' ? 'Days between' : 'Resulting date'}
          value={result.result}
          isCurrency={false}
          breakdown={result.breakdown}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(String(result.result)) },
            { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Time', expression: mode === 'diff' ? `${start} to ${end}` : `${base} + ${days}d`, result: String(result.result) }); addFavorite({ type: 'calculation', title: 'Date Calculation', subtitle: String(result.result), category: 'Time' }); } },
          ]}
        />
      )}
    </ToolLayout>
  );
}