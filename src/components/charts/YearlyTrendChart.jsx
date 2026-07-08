import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

export default function YearlyTrendChart({ allRecords }) {
  const data = useMemo(() => {
    const years = ['2565', '2566', '2567'];
    return years.map(year => {
      const yearRecords = allRecords.filter(r => r.year === year);
      const uniqueFarmers = new Set(yearRecords.map(r => r.farmerName)).size;
      const totalPlots = yearRecords.length;
      const totalArea = yearRecords.reduce((acc, r) => acc + (r.area.totalRai || 0), 0);

      return {
        year: `ปี ${year}`,
        เกษตรกร: uniqueFarmers,
        จำนวนแปลง: totalPlots,
        พื้นที่รวม_พันไร่: Number((totalArea / 1000).toFixed(2))
      };
    });
  }, [allRecords]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100">แนวโน้มรายปี (2565–2567)</h4>
            <p className="text-xs text-slate-400">เปรียบเทียบจำนวนเกษตรกร แปลงปลูก และพื้นที่รวม (หน่วย: พันไร่)</p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
              formatter={(value, name) => [value.toLocaleString(), name === 'พื้นที่รวม_พันไร่' ? 'พื้นที่รวม (พันไร่)' : name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            <Bar dataKey="เกษตรกร" name="เกษตรกร (ราย)" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="จำนวนแปลง" name="จำนวนแปลง" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="พื้นที่รวม_พันไร่" name="พื้นที่ปลูก (พันไร่)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
