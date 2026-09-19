import React, { useState, useMemo } from 'react';
import { Fuel as FuelIcon, Copy, Save } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcFuel } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';

export default function Fuel() {
  const [distance, setDistance] = useState('');
  const [consumption, setConsumption] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('metric');
  const { settings } = useSettings();
  const result = useMemo(() => (distance && consumption && price ? calcFuel({ distance, consumption, price, unit }) : null), [distance, consumption, price, unit]);

  return (
    <ToolLayout title="Fuel Cost" icon={FuelIcon}>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setUnit('metric')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${unit === 'metric' ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'}`}>Metric (L/100km)</button>
        <button onClick={() => setUnit('imperial')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${unit === 'imperial' ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'}`}>Imperial (mpg)</button>
      </div>
      <div className="space-y-3 mb-5">
        <NumberInput label="Distance" value={distance} onChange={setDistance} suffix={unit === 'metric' ? ' km' : ' mi'} />
        <NumberInput label={unit === 'metric' ? 'Fuel consumption' : 'Fuel economy'} value={consumption} onChange={setConsumption} suffix={unit === 'metric' ? ' L/100km' : ' mpg'} />
        <NumberInput label="Fuel price" value={price} onChange={setPrice} prefix="$" suffix={unit === 'metric' ? '/L' : '/gal'} />
      </div>
      {result && !result.error && (
        <ResultCard
          label="Trip cost"
          value={result.result}
          breakdown={result.breakdown}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatCurrency(result.result, settings.currency, settings.decimalPrecision)) },
            { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Automotive', expression: `Fuel: ${distance} ${unit === 'metric' ? 'km' : 'mi'}`, result: formatCurrency(result.result, settings.currency, settings.decimalPrecision) }); addFavorite({ type: 'calculation', title: 'Fuel Cost', subtitle: formatCurrency(result.result, settings.currency, settings.decimalPrecision), category: 'Automotive' }); } },
          ]}
        />
      )}
    </ToolLayout>
  );
}