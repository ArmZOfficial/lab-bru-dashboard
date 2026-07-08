import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Sprout } from 'lucide-react';
import { formatNumber } from '../../utils/dateParser';

export const CROP_COLORS = {
  'ข้าวเจ้า': '#10b981',      // Emerald
  'มันสำปะหลัง': '#f59e0b',   // Amber
  'อ้อยโรงงาน': '#8b5cf6',    // Violet
  'ยางพารา': '#3b82f6',       // Blue
  'ข้าวเหนียว': '#ec4899',    // Pink
  'อื่นๆ': '#64748b'          // Slate
};

export default function CropShareChart({ records, onSelectCrop }) {
  const { data, totalPlots } = useMemo(() => {
    const counts = {};
    records.forEach(r => {
      const crop = r.crop.type || 'อื่นๆ';
      counts[crop] = (counts[crop] || 0) + 1;
    });

    const formatted = Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        color: CROP_COLORS[name] || '#64748b'
      }))
      .sort((a, b) => b.value - a.value);

    return { data: formatted, totalPlots: records.length };
  }, [records]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100">สัดส่วนชนิดพืชหลัก (5 ชนิด)</h4>
            <p className="text-xs text-slate-400">คลิกที่สัดส่วนเพื่อกรองพืชชนิดนั้น</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 flex-1">
        <div className="h-56 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                onClick={(entry) => onSelectCrop && onSelectCrop(entry.name)}
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                formatter={(val) => [`${val.toLocaleString()} แปลง (${formatNumber((val / (totalPlots || 1)) * 100, 1)}%)`, 'จำนวน']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-bold text-slate-100">{totalPlots.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400">รวมทั้งหมด</span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
          {data.map((item) => {
            const percent = totalPlots > 0 ? (item.value / totalPlots) * 100 : 0;
            return (
              <div
                key={item.name}
                onClick={() => onSelectCrop && onSelectCrop(item.name)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-xs font-medium text-slate-200">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-100">{item.value.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 ml-1.5">({percent.toFixed(1)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
