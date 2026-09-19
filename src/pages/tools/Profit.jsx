import React, { useState, useMemo } from 'react';
import { TrendingUp, Copy, Save } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcProfit } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';

export default function Profit() {
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const { settings } = useSettings();
  const result = useMemo(() => (cost && price ? calcProfit({ cost, sellingPrice: price }) : null), [cost, price]);

  return (
    <ToolLayout title="Profit / Margin" icon={TrendingUp}>
      <div className="space-y-3 mb-5">
        <NumberInput label="Cost" value={cost} onChange={setCost} prefix="$" />
        <NumberInput label="Selling price" value={price} onChange={setPrice} prefix="$" />
      </div>
      {result?.error && <p className="text-sm text-destructive mb-4">{result.error}</p>}
      {result && !result.error && (
        <ResultCard
          label="Profit"
          value={result.result}
          breakdown={result.breakdown}
          explanation={result.explanation}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatCurrency(result.result, settings.currency, settings.decimalPrecision)) },
            { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Money', expression: `Profit: cost ${cost}, price ${price}`, result: formatCurrency(result.result, settings.currency, settings.decimalPrecision) }); addFavorite({ type: 'calculation', title: 'Profit / Margin', subtitle: formatCurrency(result.result, settings.currency, settings.decimalPrecision), category: 'Money' }); } },
          ]}
        />
      )}
    </ToolLayout>
  );
}