import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { FileText } from 'lucide-react';

export default function LandDeedChart({ records }) {
  const data = useMemo(() => {
    const topDeeds = ['โฉนด/น.ส.4จ', 'น.ส.3ก', 'ส.ค.1', 'ไม่มีเอกสารสิทธิ์'];
    const counts = {};
    topDeeds.forEach(d => counts[d] = { name: d, ครัวเรือน: 0, เช่า: 0, อื่นๆ: 0 });

    records.forEach(r => {
      const deed = r.landDeed.type || 'ไม่มีเอกสารสิทธิ์';
      const key = topDeeds.includes(deed) ? deed : 'ไม่มีเอกสารสิทธิ์';
      const own = r.landDeed.ownership || 'อื่นๆ';
      
      if (!counts[key]) counts[key] = { name: key, ครัวเรือน: 0, เช่า: 0, อื่นๆ: 0 };
      if (counts[key][own] !== undefined) {
        counts[key][own] += 1;
      } else {
        counts[key]['อื่นๆ'] += 1;
      }
    });

    return Object.values(counts);
  }, [records]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100">เอกสารสิทธิ์ vs รูปแบบการถือครอง</h4>
            <p className="text-xs text-slate-400">เปรียบเทียบการครอบครอง (ครัวเรือน / เช่า / อื่นๆ) ในแต่ละประเภทที่ดิน</p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
              formatter={(val, name) => [`${val.toLocaleString()} แปลง`, `การถือครอง: ${name}`]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            <Bar dataKey="ครัวเรือน" name="ครัวเรือน" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="เช่า" name="เช่า" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="อื่นๆ" name="อื่นๆ/ไม่ระบุ" fill="#64748b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
