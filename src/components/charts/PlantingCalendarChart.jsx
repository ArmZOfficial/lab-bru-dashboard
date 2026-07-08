import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { CalendarDays } from 'lucide-react';
import { THAI_MONTH_SHORT_NAMES } from '../../utils/dateParser';

export default function PlantingCalendarChart({ records }) {
  const data = useMemo(() => {
    const monthly = THAI_MONTH_SHORT_NAMES.map((monthName, idx) => ({
      month: monthName,
      monthIndex: idx + 1,
      เริ่มปลูก: 0,
      เก็บเกี่ยว: 0
    }));

    records.forEach(r => {
      const pm = r.dates.plantMonth;
      const hm = r.dates.harvestMonth;
      
      if (pm >= 1 && pm <= 12) {
        monthly[pm - 1].เริ่มปลูก += 1;
      }
      if (hm >= 1 && hm <= 12) {
        monthly[hm - 1].เก็บเกี่ยว += 1;
      }
    });

    return monthly;
  }, [records]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100">ปฏิทินฤดูกาลเพาะปลูกและเก็บเกี่ยว (รายเดือน)</h4>
            <p className="text-xs text-slate-400">วิเคราะห์จากวันที่ปลูก และวันที่เก็บเกี่ยวจริงในแปลง</p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPlant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorHarvest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
              formatter={(val, name) => [`${val.toLocaleString()} แปลง`, name === 'เริ่มปลูก' ? 'ช่วงเวลาปลูก' : 'ช่วงเวลาเก็บเกี่ยว']}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            <Area type="monotone" dataKey="เริ่มปลูก" name="เริ่มปลูก (แปลง)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPlant)" />
            <Area type="monotone" dataKey="เก็บเกี่ยว" name="เก็บเกี่ยว (แปลง)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorHarvest)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
