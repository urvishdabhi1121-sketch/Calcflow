import React, { useState, useMemo } from 'react';
import { Utensils, Copy, Save } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcTip } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';

const TIP_PRESETS = [10, 15, 18, 20];

export default function Tip() {
  const [amount, setAmount] = useState('');
  const [tip, setTip] = useState('15');
  const [split, setSplit] = useState('1');
  const { settings } = useSettings();
  const result = useMemo(() => (amount ? calcTip(amount, tip, split) : null), [amount, tip, split]);

  return (
    <ToolLayout title="Tip" icon={Utensils}>
      <div className="space-y-3 mb-3">
        <NumberInput label="Bill amount" value={amount} onChange={setAmount} prefix="$" />
      </div>
      <div className="mb-3">
        <label className="text-sm font-medium text-foreground/80 block mb-1.5">Tip percentage</label>
        <div className="flex gap-2">
          {TIP_PRESETS.map((p) => (
            <button key={p} onClick={() => setTip(String(p))} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${tip === String(p) ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {p}%
            </button>
          ))}
          <NumberInput value={tip} onChange={setTip} suffix="%" />
        </div>
      </div>
      <div className="mb-5">
        <NumberInput label="Split between (people)" value={split} onChange={setSplit} />
      </div>
      {result && !result.error && (
        <ResultCard
          label="Total per person"
          value={result.result}
          breakdown={result.breakdown}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatCurrency(result.result, settings.currency, settings.decimalPrecision)) },
            { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Everyday', expression: `Tip: ${amount} + ${tip}% / ${split}`, result: formatCurrency(result.result, settings.currency, settings.decimalPrecision) }); addFavorite({ type: 'calculation', title: 'Tip', subtitle: formatCurrency(result.result, settings.currency, settings.decimalPrecision), category: 'Everyday' }); } },
          ]}
        />
      )}
    </ToolLayout>
  );
}