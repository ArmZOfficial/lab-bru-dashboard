import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ShieldAlert } from 'lucide-react';

export const STATUS_COLORS = {
  'ผ่าน': '#10b981',              // Emerald
  'รอประชาคม': '#f59e0b',         // Amber
  'อยู่ระหว่างตรวจสอบ': '#3b82f6', // Blue
  'ยกเลิกไม่ให้จัดชุดได้อีก': '#ef4444' // Red
};

export default function StatusWorkflowChart({ allRecords }) {
  const data = useMemo(() => {
    const years = ['2565', '2566', '2567'];
    return years.map(year => {
      const yearRecords = allRecords.filter(r => r.year === year);
      const counts = { year: `ปี ${year}`, ผ่าน: 0, รอประชาคม: 0, อยู่ระหว่างตรวจสอบ: 0, ยกเลิกไม่ให้จัดชุดได้อีก: 0 };
      
      yearRecords.forEach(r => {
        const st = r.workflow.status || 'รอประชาคม';
        if (counts[st] !== undefined) {
          counts[st] += 1;
        } else {
          counts['รอประชาคม'] += 1;
        }
      });
      return counts;
    });
  }, [allRecords]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100">สถานะการประชาคมแยกตามปี</h4>
            <p className="text-xs text-slate-400">เน้นย้ำงานค้างดำเนินการ (รอประชาคม / ตรวจสอบ) ในปีล่าสุด 2567</p>
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
              formatter={(val, name) => [`${val.toLocaleString()} แปลง`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            <Bar dataKey="ผ่าน" name="ผ่าน" stackId="a" fill={STATUS_COLORS['ผ่าน']} radius={[0, 0, 0, 0]} />
            <Bar dataKey="รอประชาคม" name="รอประชาคม (ค้าง)" stackId="a" fill={STATUS_COLORS['รอประชาคม']} radius={[0, 0, 0, 0]} />
            <Bar dataKey="อยู่ระหว่างตรวจสอบ" name="อยู่ระหว่างตรวจสอบ (ค้าง)" stackId="a" fill={STATUS_COLORS['อยู่ระหว่างตรวจสอบ']} radius={[0, 0, 0, 0]} />
            <Bar dataKey="ยกเลิกไม่ให้จัดชุดได้อีก" name="ยกเลิกฯ" stackId="a" fill={STATUS_COLORS['ยกเลิกไม่ให้จัดชุดได้อีก']} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
