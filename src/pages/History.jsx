import React, { useState, useMemo } from 'react';
import { History as HistoryIcon, Search, Trash2, Copy, Star } from 'lucide-react';
import { getHistory, deleteHistory, clearHistory, addFavorite } from '@/lib/storage';
import EmptyState from '@/components/EmptyState';

const FILTERS = ['All', 'Basic', 'Smart', 'Money', 'Time', 'Other'];

export default function History() {
  const [history, setHistory] = useState(getHistory());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    return history.filter((h) => {
      const matchSearch = !search || h.expression?.toLowerCase().includes(search.toLowerCase()) || String(h.result).includes(search);
      const matchFilter = filter === 'All' || h.category === filter;
      return matchSearch && matchFilter;
    });
  }, [history, search, filter]);

  const handleDelete = (id) => { deleteHistory(id); setHistory(getHistory()); };
  const handleClear = () => { clearHistory(); setHistory([]); };
  const handleCopy = (text) => navigator.clipboard?.writeText(String(text));
  const handleFavorite = (h) => {
    addFavorite({ type: 'calculation', refId: h.id, title: h.expression, subtitle: h.result, category: h.category });
    setHistory(getHistory());
  };

  return (
    <div className="px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">History</h1>
        {history.length > 0 && (
          <button onClick={handleClear} className="text-sm text-destructive font-medium">Clear all</button>
        )}
      </div>
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search calculations..."
          className="w-full rounded-2xl bg-card border border-input pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
        />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === f ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="No calculations yet" subtitle="Your recent calculations will appear here." />
      ) : (
        <div className="space-y-2">
          {filtered.map((h) => (
            <div key={h.id} className="rounded-2xl border border-border bg-card p-4 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-muted-foreground truncate">{h.expression}</div>
                  <div className="text-xl font-semibold mt-0.5 tabular-nums">{h.result}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(h.created_date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleCopy(h.result)} className="p-2 rounded-lg hover:bg-muted transition"><Copy size={16} /></button>
                  <button onClick={() => handleFavorite(h)} className="p-2 rounded-lg hover:bg-muted transition"><Star size={16} /></button>
                  <button onClick={() => handleDelete(h.id)} className="p-2 rounded-lg hover:bg-muted transition text-destructive"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}