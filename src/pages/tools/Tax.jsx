import React, { useState, useMemo } from 'react';
import { Receipt, Copy, Save } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcTax } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';

export default function Tax() {
  const [price, setPrice] = useState('');
  const [rate, setRate] = useState('');
  const { settings } = useSettings();
  const result = useMemo(() => (price && rate ? calcTax(price, rate) : null), [price, rate]);

  return (
    <ToolLayout title="Tax" icon={Receipt}>
      <div className="space-y-3 mb-5">
        <NumberInput label="Price" value={price} onChange={setPrice} prefix="$" />
        <NumberInput label="Tax rate" value={rate} onChange={setRate} suffix="%" />
      </div>
      {result && !result.error && (
        <ResultCard
          label="Total with tax"
          value={result.result}
          breakdown={result.breakdown}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatCurrency(result.result, settings.currency, settings.decimalPrecision)) },
            { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Everyday', expression: `${price} + ${rate}% tax`, result: formatCurrency(result.result, settings.currency, settings.decimalPrecision) }); addFavorite({ type: 'calculation', title: 'Tax', subtitle: formatCurrency(result.result, settings.currency, settings.decimalPrecision), category: 'Everyday' }); } },
          ]}
        />
      )}
    </ToolLayout>
  );
}