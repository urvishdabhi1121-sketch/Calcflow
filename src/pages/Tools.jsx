import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { TOOLS, CATEGORIES } from '@/lib/toolRegistry';
import ToolCard from '@/components/ToolCard';

export default function Tools() {
  const [search, setSearch] = useState('');
  const filtered = TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Tools</h1>
      <div className="relative mb-5">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="w-full rounded-2xl bg-card border border-input pl-10 pr-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
        />
      </div>
      {search ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((t) => (
            <ToolCard key={t.id} to={`/tools/${t.id}`} icon={t.icon} title={t.name} subtitle={t.subtitle} />
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No tools found.</p>}
        </div>
      ) : (
        CATEGORIES.map((cat) => {
          const tools = TOOLS.filter((t) => t.category === cat);
          if (!tools.length) return null;
          return (
            <section key={cat} className="mb-6">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{cat}</h2>
              <div className="grid grid-cols-2 gap-3">
                {tools.map((t) => (
                  <ToolCard key={t.id} to={`/tools/${t.id}`} icon={t.icon} title={t.name} subtitle={t.subtitle} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}