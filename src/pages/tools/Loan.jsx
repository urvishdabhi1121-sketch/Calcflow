import React, { useState, useMemo } from 'react';
import { Landmark, Copy, Save, ChevronDown, ChevronUp } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import NumberInput from '@/components/NumberInput';
import ResultCard from '@/components/ResultCard';
import { calcLoan, calcExtraPayment } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';

export default function Loan() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [extra, setExtra] = useState('');
  const [showExtra, setShowExtra] = useState(false);
  const { settings } = useSettings();

  const loan = useMemo(() => (principal && rate && years ? calcLoan({ principal, annualRate: rate, years, frequency }) : null), [principal, rate, years, frequency]);
  const extraResult = useMemo(() => (loan && extra ? calcExtraPayment({ principal, annualRate: rate, years, frequency }, extra) : null), [loan, extra, principal, rate, years, frequency]);

  return (
    <ToolLayout title="Loan" icon={Landmark}>
      <div className="space-y-3 mb-5">
        <NumberInput label="Loan amount" value={principal} onChange={setPrincipal} prefix="$" />
        <NumberInput label="Interest rate" value={rate} onChange={setRate} suffix="%" />
        <NumberInput label="Term" value={years} onChange={setYears} suffix=" years" />
        <div>
          <label className="text-sm font-medium text-foreground/80 block mb-1.5">Payment frequency</label>
          <div className="flex gap-2">
            <button onClick={() => setFrequency('monthly')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${frequency === 'monthly' ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'}`}>Monthly</button>
            <button onClick={() => setFrequency('biweekly')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${frequency === 'biweekly' ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'}`}>Biweekly</button>
          </div>
        </div>
      </div>
      {loan && !loan.error && (
        <>
          <ResultCard
            label={`Payment (${frequency})`}
            value={loan.result}
            breakdown={loan.breakdown}
            actions={[
              { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatCurrency(loan.result, settings.currency, settings.decimalPrecision)) },
              { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Money', expression: `Loan: ${principal} at ${rate}% / ${years}yr`, result: formatCurrency(loan.result, settings.currency, settings.decimalPrecision) }); addFavorite({ type: 'calculation', title: 'Loan', subtitle: formatCurrency(loan.result, settings.currency, settings.decimalPrecision), category: 'Money' }); } },
            ]}
          />
          <button onClick={() => setShowExtra(!showExtra)} className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-sm font-medium transition">
            Extra payment simulator {showExtra ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showExtra && (
            <div className="mt-3 animate-fade-in">
              <NumberInput label="Extra payment per month" value={extra} onChange={setExtra} prefix="$" />
              {extraResult && !extraResult.error && (
                <div className="mt-4">
                  <ResultCard
                    label="Time saved"
                    value={extraResult.result}
                    isCurrency={false}
                    breakdown={extraResult.breakdown}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </ToolLayout>
  );
}