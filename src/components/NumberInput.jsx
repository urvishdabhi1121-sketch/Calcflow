import React from 'react';

export default function NumberInput({ label, value, onChange, placeholder = '0', prefix, suffix, step, min }) {
  return (
    <div>
      {label && <label className="text-sm font-medium text-foreground/80 block mb-1.5">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">{prefix}</span>
        )}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          className={[
            'w-full rounded-xl border border-input bg-background py-3 text-base font-medium tabular-nums',
            'focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition',
            prefix ? 'pl-8' : 'pl-3.5',
            suffix ? 'pr-12' : 'pr-3.5',
          ].join(' ')}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}