import React, { useState, useMemo } from 'react';
import { Ruler, ArrowDownUp, Star, Copy } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { UNIT_CATEGORIES, convertUnit, convertTemperature } from '@/lib/calcEngine';
import { addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatNumber } from '@/lib/format';

export default function UnitConverter() {
  const categories = Object.keys(UNIT_CATEGORIES);
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [value, setValue] = useState('1');
  const { settings } = useSettings();

  const cat = UNIT_CATEGORIES[category];
  const units = Object.keys(cat.units);

  const result = useMemo(() => {
    if (category === 'temperature') return convertTemperature(fromUnit, toUnit, value);
    return convertUnit(category, fromUnit, toUnit, value);
  }, [category, fromUnit, toUnit, value]);

  const selectCategory = (c) => {
    const u = Object.keys(UNIT_CATEGORIES[c].units);
    setCategory(c);
    setFromUnit(u[0]);
    setToUnit(u[1] || u[0]);
  };

  const swap = () => { setFromUnit(toUnit); setToUnit(fromUnit); };

  return (
    <ToolLayout title="Unit Converter" icon={Ruler}>
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {categories.map((c) => (
          <button key={c} onClick={() => selectCategory(c)} className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${category === c ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'}`}>
            {UNIT_CATEGORIES[c].label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 mb-4">
        <div className="mb-3">
          <NumberInput label="From" value={value} onChange={setValue} />
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full mt-2 rounded-xl bg-secondary px-3 py-2.5 text-sm font-medium focus:outline-none">
            {units.map((u) => <option key={u} value={u}>{cat.units[u].label}</option>)}
          </select>
        </div>
        <button onClick={swap} className="w-full py-2 mb-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowDownUp size={16} /> Swap
        </button>
        <div>
          <label className="text-sm font-medium text-foreground/80 block mb-1.5">To</label>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full rounded-xl bg-secondary px-3 py-2.5 text-sm font-medium focus:outline-none">
            {units.map((u) => <option key={u} value={u}>{cat.units[u].label}</option>)}
          </select>
        </div>
      </div>
      {result && !result.error && (
        <ResultCard
          label="Converted"
          value={result.result}
          isCurrency={false}
          breakdown={[{ label: 'Result', value: result.result, suffix: ` ${cat.units[toUnit]?.label || ''}` }]}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatNumber(result.result, settings.decimalPrecision)) },
            { label: 'Favorite', icon: Star, onClick: () => addFavorite({ type: 'conversion', title: `${value} ${fromUnit} → ${toUnit}`, subtitle: formatNumber(result.result, settings.decimalPrecision), category: 'Conversions' }) },
          ]}
        />
      )}
    </ToolLayout>
  );
}