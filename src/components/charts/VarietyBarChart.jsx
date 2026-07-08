import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Award } from 'lucide-react';
import { formatNumber } from '../../utils/dateParser';

export default function VarietyBarChart({ records }) {
  const data = useMemo(() => {
    const counts = {};
    records.forEach(r => {
      const variety = r.crop.variety || 'ไม่ระบุ';
      if (!counts[variety]) {
        counts[variety] = { name: variety, plots: 0, area: 0 };
      }
      counts[variety].plots += 1;
      counts[variety].area += (r.area.totalRai || 0);
    });

    return Object.values(counts)
      .sort((a, b) => b.plots - a.plots)
      .slice(0, 8); // Top 8 varieties
  }, [records]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100">8 พันธุ์พืชยอดนิยม</h4>
            <p className="text-xs text-slate-400">จัดอันดับตามจำนวนแปลงที่ขึ้นทะเบียน</p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} width={100} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
              formatter={(value, name) => [
                name === 'plots' ? `${value.toLocaleString()} แปลง` : `${formatNumber(value, 1)} ไร่`,
                name === 'plots' ? 'จำนวนแปลง' : 'พื้นที่รวม'
              ]}
            />
            <Bar dataKey="plots" name="plots" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
