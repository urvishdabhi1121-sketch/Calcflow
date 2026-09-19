import React, { useState, useMemo } from 'react';
import { Users, Copy, Save, Plus, Trash2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcBillSplit } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';

export default function SplitBill() {
  const [items, setItems] = useState([{ person: '', amount: '' }]);
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [people, setPeople] = useState('2');
  const [mode, setMode] = useState('equal');
  const { settings } = useSettings();

  const result = useMemo(() => {
    const validItems = items.filter((i) => i.amount);
    if (!validItems.length) return null;
    return calcBillSplit(validItems.map((i) => ({ amount: Number(i.amount) || 0 })), tax, tip, mode, people);
  }, [items, tax, tip, mode, people]);

  const updateItem = (i, field, val) => setItems((its) => its.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
  const addItem = () => setItems([...items, { person: '', amount: '' }]);
  const removeItem = (i) => setItems(its => its.filter((_, idx) => idx !== i));

  return (
    <ToolLayout title="Split Bill" icon={Users}>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('equal')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${mode === 'equal' ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'}`}>Equal split</button>
        <button onClick={() => setMode('unequal')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${mode === 'unequal' ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'}`}>By item</button>
      </div>
      <div className="space-y-2 mb-4">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-center">
            <NumberInput value={it.amount} onChange={(v) => updateItem(i, 'amount', v)} prefix="$" placeholder="0.00" />
            <button onClick={() => removeItem(i)} className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:text-destructive transition"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
      <button onClick={addItem} className="flex items-center gap-2 text-sm font-medium text-brand mb-4"><Plus size={18} /> Add item</button>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <NumberInput label="Tax" value={tax} onChange={setTax} suffix="%" />
        <NumberInput label="Tip" value={tip} onChange={setTip} suffix="%" />
      </div>
      {mode === 'equal' && <div className="mb-5"><NumberInput label="Number of people" value={people} onChange={setPeople} /></div>}
      {result && !result.error && (
        <ResultCard
          label={mode === 'equal' ? 'Per person' : 'Total'}
          value={result.result}
          breakdown={result.breakdown}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatCurrency(result.result, settings.currency, settings.decimalPrecision)) },
            { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Everyday', expression: 'Split bill', result: formatCurrency(result.result, settings.currency, settings.decimalPrecision) }); addFavorite({ type: 'calculation', title: 'Split Bill', subtitle: formatCurrency(result.result, settings.currency, settings.decimalPrecision), category: 'Everyday' }); } },
          ]}
        />
      )}
    </ToolLayout>
  );
}