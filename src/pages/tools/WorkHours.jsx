import React, { useState, useMemo } from 'react';
import { Clock, Copy, Save, Plus, Trash2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import ResultCard from '@/components/ResultCard';
import { calcWorkHours } from '@/lib/calcEngine';
import { addHistory, addFavorite } from '@/lib/storage';
import { useSettings } from '@/lib/SettingsContext';
import { formatNumber } from '@/lib/format';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkHours() {
  const [shifts, setShifts] = useState([{ day: 'Monday', start: '09:00', end: '17:00', break: '30' }]);
  const { settings } = useSettings();

  const result = useMemo(() => calcWorkHours(shifts), [shifts]);

  const update = (i, field, val) => setShifts((s) => s.map((sh, idx) => idx === i ? { ...sh, [field]: val } : sh));
  const addShift = () => setShifts((s) => [...s, { day: DAYS[s.length % 7], start: '09:00', end: '17:00', break: '30' }]);
  const removeShift = (i) => setShifts((s) => s.filter((_, idx) => idx !== i));

  return (
    <ToolLayout title="Work Hours" icon={Clock}>
      <div className="space-y-3 mb-4">
        {shifts.map((sh, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <select value={sh.day} onChange={(e) => update(i, 'day', e.target.value)} className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium focus:outline-none">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <button onClick={() => removeShift(i)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition"><Trash2 size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Start</label>
                <input type="time" value={sh.start} onChange={(e) => update(i, 'start', e.target.value)} className="w-full rounded-lg bg-secondary px-2 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">End</label>
                <input type="time" value={sh.end} onChange={(e) => update(i, 'end', e.target.value)} className="w-full rounded-lg bg-secondary px-2 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Break</label>
                <input type="number" value={sh.break} onChange={(e) => update(i, 'break', e.target.value)} className="w-full rounded-lg bg-secondary px-2 py-2 text-sm focus:outline-none" placeholder="min" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addShift} className="flex items-center gap-2 text-sm font-medium text-brand mb-5"><Plus size={18} /> Add shift</button>
      {result && !result.error && (
        <ResultCard
          label="Total hours"
          value={result.result}
          isCurrency={false}
          breakdown={result.breakdown}
          actions={[
            { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard?.writeText(formatNumber(result.result, 2)) },
            { label: 'Save', icon: Save, onClick: () => { addHistory({ type: 'tool', category: 'Time', expression: `Work hours: ${shifts.length} shifts`, result: formatNumber(result.result, 2) }); addFavorite({ type: 'calculation', title: 'Work Hours', subtitle: `${formatNumber(result.result, 2)} h`, category: 'Time' }); } },
          ]}
        />
      )}
    </ToolLayout>
  );
}