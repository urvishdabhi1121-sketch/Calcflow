import React, { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { getFavorites, deleteFavorite } from '@/lib/storage';
import EmptyState from '@/components/EmptyState';

export default function Favorites() {
  const [favorites, setFavorites] = useState(getFavorites());

  const handleDelete = (id) => { deleteFavorite(id); setFavorites(getFavorites()); };

  return (
    <div className="px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Favorites</h1>
      {favorites.length === 0 ? (
        <EmptyState icon={Star} title="Nothing saved yet" subtitle="Save calculations and tools you use frequently." />
      ) : (
        <div className="space-y-2">
          {favorites.map((f) => (
            <div key={f.id} className="rounded-2xl border border-border bg-card p-4 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{f.title || f.expression}</div>
                  {f.subtitle && <div className="text-lg font-semibold mt-0.5 tabular-nums">{f.subtitle}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{f.category}</div>
                </div>
                <button onClick={() => handleDelete(f.id)} className="p-2 rounded-lg hover:bg-muted transition text-destructive shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}