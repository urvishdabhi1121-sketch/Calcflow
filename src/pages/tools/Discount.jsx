import React, { useState, useMemo } from 'react';
import { Tag, Copy, Save } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcDiscount } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';

export default function Discount() {
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState('');
  const { settings } = useSettings();
  const result = useMemo(() => (price ? calcDiscount(price, discount, tax) : null), [price, discount, tax]);

  return (
    <ToolLayout title="Discount" icon={Tag}>
      <div className="space-y-3 mb-5">
        <NumberInput label="Original price" value={price} onChange={setPrice} prefix="$" />
        <NumberInput label="Discount" value={discount} onChange={setDiscount} suffix="%" />
        <NumberInput label="Sales tax (optional)" value={tax} onChange={setTax} suffix="%" />
      </div>
      {result?.error && <p className="text-sm text-destructive mb-4">{result.error}</p>}
      {result && !result.error && (
        <ResultCard
          label="Final price"
          value={result.result}
          breakdown={result.breakdown}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatCurrency(result.result, settings.currency, settings.decimalPrecision)) },
            { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Everyday', expression: `${price} - ${discount}% + ${tax}% tax`, result: formatCurrency(result.result, settings.currency, settings.decimalPrecision) }); addFavorite({ type: 'calculation', title: 'Discount', subtitle: formatCurrency(result.result, settings.currency, settings.decimalPrecision), category: 'Everyday' }); } },
          ]}
        />
      )}
    </ToolLayout>
  );
}