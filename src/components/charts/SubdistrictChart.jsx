import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MapPin } from 'lucide-react';
import { formatNumber } from '../../utils/dateParser';

export default function SubdistrictChart({ records }) {
  const [metric, setMetric] = useState('plots'); // 'plots' or 'area'

  const data = useMemo(() => {
    const subdistricts = ['ตาเสา', 'สนวน', 'บ้านตะโก', 'สามแวง', 'ห้วยราชา', 'เมืองโพธิ์', 'โคกเหล็ก'];
    const counts = {};
    subdistricts.forEach(s => counts[s] = { name: `ต.${s}`, plots: 0, area: 0 });

    records.forEach(r => {
      const tambon = r.location.tambon;
      const key = subdistricts.find(s => tambon?.includes(s)) || 'อื่นๆ';
      if (!counts[key]) counts[key] = { name: `ต.${tambon}`, plots: 0, area: 0 };
      counts[key].plots += 1;
      counts[key].area += (r.area.totalRai || 0);
    });

    return Object.values(counts)
      .filter(d => d.plots > 0)
      .sort((a, b) => b[metric] - a[metric]);
  }, [records, metric]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100">การกระจายตัวตามตำบล (7 ตำบล)</h4>
            <p className="text-xs text-slate-400">ในพื้นที่อำเภอห้วยราช จังหวัดบุรีรัมย์</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
          <button
            onClick={() => setMetric('plots')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              metric === 'plots' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            จำนวนแปลง
          </button>
          <button
            onClick={() => setMetric('area')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              metric === 'area' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            พื้นที่ปลูก (ไร่)
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
              formatter={(value) => [
                metric === 'plots' ? `${value.toLocaleString()} แปลง` : `${formatNumber(value, 1)} ไร่`,
                metric === 'plots' ? 'จำนวนแปลง' : 'พื้นที่ปลูก'
              ]}
            />
            <Bar
              dataKey={metric}
              fill={metric === 'plots' ? '#10b981' : '#f59e0b'}
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
