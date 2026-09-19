import React from 'react';
import { Link } from 'react-router-dom';

export default function ToolCard({ to, icon: Icon, title, subtitle, accent }) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3.5 shadow-sm hover:shadow-md hover:border-brand/30 transition active:scale-[0.97] no-tap-highlight"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand">
        <Icon size={20} />
      </div>
      <div>
        <div className="text-sm font-semibold leading-tight">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
    </Link>
  );
}