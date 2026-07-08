import React, { useMemo } from 'react';
import { Users, Layers, Maximize2, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { formatNumber } from '../utils/dateParser';

export default function KpiSection({ records, selectedYear, allRecords }) {
  const stats = useMemo(() => {
    const uniqueFarmers = new Set(records.map(r => r.farmerName)).size;
    const totalPlots = records.length;
    const totalArea = records.reduce((acc, r) => acc + (r.area.totalRai || 0), 0);
    const avgArea = totalPlots > 0 ? totalArea / totalPlots : 0;

    const passCount = records.filter(r => r.workflow.status === 'ผ่าน').length;
    const passRate = totalPlots > 0 ? (passCount / totalPlots) * 100 : 0;

    const pendingCount = records.filter(r => 
      r.workflow.status === 'รอประชาคม' || r.workflow.status === 'อยู่ระหว่างตรวจสอบ'
    ).length;

    // Calculate YoY comparison if single year is selected (2566 vs 2565 or 2567 vs 2566)
    let yoyFarmerChange = null;
    let yoyPlotChange = null;
    let yoyAreaChange = null;

    if (selectedYear && selectedYear !== 'ทั้งหมด') {
      const prevYear = String(Number(selectedYear) - 1);
      const prevRecords = allRecords.filter(r => r.year === prevYear);
      if (prevRecords.length > 0) {
        const prevUniqueFarmers = new Set(prevRecords.map(r => r.farmerName)).size;
        const prevTotalPlots = prevRecords.length;
        const prevTotalArea = prevRecords.reduce((acc, r) => acc + (r.area.totalRai || 0), 0);

        yoyFarmerChange = prevUniqueFarmers > 0 ? ((uniqueFarmers - prevUniqueFarmers) / prevUniqueFarmers) * 100 : null;
        yoyPlotChange = prevTotalPlots > 0 ? ((totalPlots - prevTotalPlots) / prevTotalPlots) * 100 : null;
        yoyAreaChange = prevTotalArea > 0 ? ((totalArea - prevTotalArea) / prevTotalArea) * 100 : null;
      }
    }

    return {
      uniqueFarmers,
      totalPlots,
      totalArea,
      avgArea,
      passRate,
      pendingCount,
      yoyFarmerChange,
      yoyPlotChange,
      yoyAreaChange
    };
  }, [records, selectedYear, allRecords]);

  const renderYoY = (change) => {
    if (change === null || change === undefined) return null;
    const isPositive = change >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
        isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
      }`}>
        <TrendingUp className={`w-3 h-3 ${!isPositive ? 'rotate-180' : ''}`} />
        {isPositive ? '+' : ''}{change.toFixed(1)}% เทียบปีก่อน
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Unique Farmers */}
      <div className="glass-card glass-card-hover rounded-2xl p-4 lg:p-5 flex flex-col justify-between border-l-4 border-l-emerald-500">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-slate-400 block">จำนวนเกษตรกร (ไม่ซ้ำ)</span>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-100 mt-1">
              {stats.uniqueFarmers.toLocaleString()} <span className="text-sm font-normal text-slate-400">ราย</span>
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>นับเฉพาะชื่อ-นามสกุล</span>
          {renderYoY(stats.yoyFarmerChange)}
        </div>
      </div>

      {/* Card 2: Total Plots */}
      <div className="glass-card glass-card-hover rounded-2xl p-4 lg:p-5 flex flex-col justify-between border-l-4 border-l-teal-500">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-slate-400 block">จำนวนแปลง/รอบกิจกรรม</span>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-100 mt-1">
              {stats.totalPlots.toLocaleString()} <span className="text-sm font-normal text-slate-400">แปลง</span>
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>ค่าเฉลี่ย {formatNumber(stats.totalPlots / (stats.uniqueFarmers || 1), 1)} แปลง/ราย</span>
          {renderYoY(stats.yoyPlotChange)}
        </div>
      </div>

      {/* Card 3: Total Area */}
      <div className="glass-card glass-card-hover rounded-2xl p-4 lg:p-5 flex flex-col justify-between border-l-4 border-l-amber-500">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-slate-400 block">พื้นที่เพาะปลูกรวม</span>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-100 mt-1">
              {formatNumber(stats.totalArea, 1)} <span className="text-sm font-normal text-slate-400">ไร่</span>
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Maximize2 className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>เฉลี่ย {formatNumber(stats.avgArea, 2)} ไร่/แปลง</span>
          {renderYoY(stats.yoyAreaChange)}
        </div>
      </div>

      {/* Card 4: Community Status Pass Rate */}
      <div className="glass-card glass-card-hover rounded-2xl p-4 lg:p-5 flex flex-col justify-between border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-slate-400 block">สถานะการประชาคม "ผ่าน"</span>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-100 mt-1">
              {formatNumber(stats.passRate, 1)}% <span className="text-xs font-normal text-slate-400">ของแปลงทั้งหมด</span>
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {stats.pendingCount > 0 ? (
            <span className="text-amber-400 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              ค้างพิจารณา {stats.pendingCount.toLocaleString()} แปลง
            </span>
          ) : (
            <span className="text-emerald-400">ประชาคมผ่านครบถ้วน</span>
          )}
        </div>
      </div>
    </div>
  );
}
