import React, { useState, useMemo } from 'react';
import { PiggyBank, Copy, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcSavings } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';

export default function Savings() {
  const [starting, setStarting] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const { settings } = useSettings();
  const result = useMemo(() => (years ? calcSavings({ starting, monthly, annualRate: rate, years }) : null), [starting, monthly, rate, years]);

  return (
    <ToolLayout title="Savings" icon={PiggyBank}>
      <div className="space-y-3 mb-5">
        <NumberInput label="Starting balance" value={starting} onChange={setStarting} prefix="$" />
        <NumberInput label="Monthly contribution" value={monthly} onChange={setMonthly} prefix="$" />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="Interest rate" value={rate} onChange={setRate} suffix="%" />
          <NumberInput label="Duration" value={years} onChange={setYears} suffix=" yr" />
        </div>
      </div>
      {result && !result.error && (
        <>
          <ResultCard
            label="Final balance"
            value={result.result}
            breakdown={result.breakdown}
            actions={[
              { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatCurrency(result.result, settings.currency, settings.decimalPrecision)) },
              { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Money', expression: `Savings: ${monthly}/mo for ${years}yr`, result: formatCurrency(result.result, settings.currency, settings.decimalPrecision) }); addFavorite({ type: 'calculation', title: 'Savings', subtitle: formatCurrency(result.result, settings.currency, settings.decimalPrecision), category: 'Money' }); } },
            ]}
          />
          {result.values.chartData.length > 1 && (
            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              <div className="text-xs font-medium text-muted-foreground mb-2">Growth over time</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={result.values.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="m" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v, settings.currency, 0)} labelFormatter={(l) => `Month ${l}`} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                  <Line type="monotone" dataKey="balance" stroke="hsl(var(--brand))" strokeWidth={2.5} dot={false} name="Balance" />
                  <Line type="monotone" dataKey="contributions" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Contributions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </ToolLayout>
  );
}