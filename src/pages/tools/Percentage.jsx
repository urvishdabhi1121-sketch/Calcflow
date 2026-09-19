import React, { useState, useMemo } from 'react';
import { Percent, Copy, Save } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcPercentage } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatNumber } from '@/lib/format';

const MODES = [
  { id: 'of', label: 'X% of Y', inputs: ['Percentage (%)', 'Value'] },
  { id: 'isWhatPct', label: 'X is what % of Y', inputs: ['Value X', 'Value Y'] },
  { id: 'increase', label: 'Increase by X%', inputs: ['Percentage (%)', 'Value'] },
  { id: 'decrease', label: 'Decrease by X%', inputs: ['Percentage (%)', 'Value'] },
  { id: 'change', label: '% change X→Y', inputs: ['Original', 'New'] },
];

export default function Percentage() {
  const [mode, setMode] = useState('of');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const { settings } = useSettings();
  const m = MODES.find((mo) => mo.id === mode);
  const isPct = mode === 'isWhatPct' || mode === 'change';

  const result = useMemo(() => {
    if (!x && !y) return null;
    return calcPercentage(mode, x, y);
  }, [mode, x, y]);

  return (
    <ToolLayout title="Percentage" icon={Percent}>
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {MODES.map((mo) => (
          <button
            key={mo.id}
            onClick={() => setMode(mo.id)}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              mode === mo.id ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {mo.label}
          </button>
        ))}
      </div>
      <div className="space-y-3 mb-5">
        <NumberInput label={m.inputs[0]} value={x} onChange={setX} />
        <NumberInput label={m.inputs[1]} value={y} onChange={setY} />
      </div>
      {result?.error && <p className="text-sm text-destructive mb-4">{result.error}</p>}
      {result && !result.error && result.result !== undefined && (
        <ResultCard
          label="Result"
          value={result.result}
          isCurrency={!isPct}
          breakdown={result.breakdown}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatNumber(result.result, settings.decimalPrecision)) },
            { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Everyday', expression: `${m.label}: ${x}, ${y}`, result: formatNumber(result.result, settings.decimalPrecision) }); addFavorite({ type: 'calculation', title: `Percentage: ${m.label}`, subtitle: formatNumber(result.result, settings.decimalPrecision), category: 'Everyday' }); } },
          ]}
        />
      )}
    </ToolLayout>
  );
}