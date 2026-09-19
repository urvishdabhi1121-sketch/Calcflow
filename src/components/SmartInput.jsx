import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Mic, ArrowRight } from 'lucide-react';

const PLACEHOLDERS = [
  '20% off $89.99 plus tax',
  '42 hours at $24/hour with overtime',
  '12 ft × 15 ft flooring with 10% waste',
  '$5.99 for 750g vs $8.99 for 1.2kg',
  '$5000 loan at 6.5% for 5 years',
  '500 km trip at 7L/100km and $1.60/L',
];

export default function SmartInput() {
  const [value, setValue] = useState('');
  const [phIndex, setPhIndex] = useState(0);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPhIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, []);

  const submit = () => {
    if (!value.trim()) return;
    navigate('/smart', { state: { query: value } });
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="text-sm font-medium text-muted-foreground mb-2">What do you want to calculate?</div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Calculator size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder={PLACEHOLDERS[phIndex]}
            className="w-full rounded-2xl bg-background border border-input pl-10 pr-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition placeholder:text-muted-foreground/60"
          />
        </div>
        <button onClick={submit} className="w-12 h-12 rounded-2xl bg-brand text-brand-foreground flex items-center justify-center active:scale-95 transition no-tap-highlight">
          <ArrowRight size={20} />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
          <Mic size={14} /> Voice input
        </button>
      </div>
    </div>
  );
}