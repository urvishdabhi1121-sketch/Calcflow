import React, { useState, useMemo } from 'react';
import { Wallet, Copy, Save } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcSalary } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';

export default function Salary() {
  const [wage, setWage] = useState('');
  const [hours, setHours] = useState('40');
  const [ot, setOt] = useState('0');
  const [otMult, setOtMult] = useState('1.5');
  const { settings } = useSettings();
  const result = useMemo(() => (wage ? calcSalary({ hourlyWage: wage, hoursPerWeek: hours, overtimeHours: ot, overtimeMultiplier: otMult }) : null), [wage, hours, ot, otMult]);

  return (
    <ToolLayout title="Salary" icon={Wallet}>
      <div className="space-y-3 mb-5">
        <NumberInput label="Hourly wage" value={wage} onChange={setWage} prefix="$" />
        <NumberInput label="Hours per week" value={hours} onChange={setHours} />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="Overtime hours" value={ot} onChange={setOt} />
          <NumberInput label="OT multiplier" value={otMult} onChange={setOtMult} suffix="×" />
        </div>
      </div>
      {result && (
        <ResultCard
          label="Annual salary (gross)"
          value={result.result}
          breakdown={result.breakdown}
          assumptions={result.assumptions}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatCurrency(result.result, settings.currency, settings.decimalPrecision)) },
            { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Money', expression: `Salary: ${wage}/hr`, result: formatCurrency(result.result, settings.currency, settings.decimalPrecision) }); addFavorite({ type: 'calculation', title: 'My Work Rate', subtitle: `${formatCurrency(result.result, settings.currency, 0)}/year`, category: 'Money' }); } },
          ]}
        />
      )}
    </ToolLayout>
  );
}