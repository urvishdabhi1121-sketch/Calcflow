import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function ToolLayout({ title, icon: Icon, children }) {
  return (
    <div className="px-4 py-4 pb-24 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/tools" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition no-tap-highlight">
          <ChevronLeft size={22} />
        </Link>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Icon size={20} />
          </div>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {children}
    </div>
  );
}