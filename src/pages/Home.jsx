import React from 'react';
import { Link } from 'react-router-dom';
import { Percent, Tag, Receipt, Utensils, Users, Wallet, Fuel, Ruler } from 'lucide-react';
import SmartInput from '@/components/SmartInput';
import Calculator from '@/components/Calculator';

const QUICK_ACTIONS = [
  { to: '/tools/percentage', icon: Percent, title: 'Percentage' },
  { to: '/tools/discount', icon: Tag, title: 'Discount' },
  { to: '/tools/tax', icon: Receipt, title: 'Tax' },
  { to: '/tools/tip', icon: Utensils, title: 'Tip' },
  { to: '/tools/split-bill', icon: Users, title: 'Split Bill' },
  { to: '/tools/salary', icon: Wallet, title: 'Salary' },
  { to: '/tools/fuel', icon: Fuel, title: 'Fuel' },
  { to: '/tools/unit-converter', icon: Ruler, title: 'Converter' },
];

export default function Home() {
  return (
    <div className="px-4 py-6 pb-24">
      <div className="mb-5">
        <h1 className="text-3xl font-bold tracking-tight">CalcFlow</h1>
        <p className="text-muted-foreground mt-0.5">Calculate anything. Simply.</p>
      </div>
      <SmartInput />
      <section className="mt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.to} to={a.to} className="flex flex-col items-center gap-1.5 active:scale-95 transition no-tap-highlight">
              <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-brand shadow-sm">
                <a.icon size={22} />
              </div>
              <span className="text-[11px] font-medium text-center leading-tight">{a.title}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Calculator</h2>
        <Calculator />
      </section>
    </div>
  );
}