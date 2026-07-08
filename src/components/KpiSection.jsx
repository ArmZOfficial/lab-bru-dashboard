import React, { useMemo } from 'react';
import { Users, Layers, Maximize2, ShieldCheck, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { formatNumber } from '../utils/dateParser';

export default function KpiSection({ records, selectedYear, allRecords, onOpenAudit }) {
  const stats = useMemo(() => {
    const uniqueFarmers = new Set(records.map(r => r.farmerName)).size;
    const totalPlots = records.length;
    const totalArea = records.reduce((acc, r) => acc + (r.area.totalRai || 0), 0);
    const avgArea = totalPlots > 0 ? totalArea / totalPlots : 0;

    const passCount = records.filter(r => r.workflow?.status === 'ผ่าน').length;
    const passRate = totalPlots > 0 ? (passCount / totalPlots) * 100 : 0;

    const pendingCount = records.filter(r => 
      r.workflow?.status === 'รอประชาคม' || r.workflow?.status === 'อยู่ระหว่างตรวจสอบ'
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

    // Calculate Economic Value & Anomaly Count
    let totalEconomicValue = 0;
    let anomalyCount = 0;

    records.forEach(r => {
      const rai = r.area?.totalRai || 0;
      const crop = r.crop?.type || '';
      if (crop.includes('ข้าว')) totalEconomicValue += rai * 5580; // ~360 kg/rai @ 15.5 B/kg
      else if (crop.includes('มัน')) totalEconomicValue += rai * 11200; // ~3,500 kg/rai @ 3.2 B/kg
      else if (crop.includes('อ้อย')) totalEconomicValue += rai * 14000; // ~10,000 kg/rai @ 1.4 B/kg
      else totalEconomicValue += rai * 15000;

      const x = Number(r.location?.utmX) || 0;
      const y = Number(r.location?.utmY) || 0;
      if (x === 0 || y === 0 || x < 100000 || y < 1000000 || r.workflow?.status !== 'ผ่าน' || rai > 30) {
        anomalyCount++;
      }
    });

    return {
      uniqueFarmers,
      totalPlots,
      totalArea,
      avgArea,
      passRate,
      pendingCount,
      yoyFarmerChange,
      yoyPlotChange,
      yoyAreaChange,
      totalEconomicValue,
      anomalyCount
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
    <div className="space-y-4 animate-fadeIn">
      {/* Row 1: Standard 4 KPI Cards */}
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

      {/* Row 2: Economic Estimator & Data Anomaly Audit Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Economic Value Estimator Card (2 cols) */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-2 border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Economic Value Estimator
                </span>
                <h3 className="text-base lg:text-lg font-bold text-slate-100">ประเมินมูลค่าทางเศรษฐกิจและผลผลิตภาคเกษตร อ.ห้วยราช</h3>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-400 block">ประมาณการมูลค่าผลผลิตรวม</span>
              <span className="text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                ฿{(stats.totalEconomicValue / 1000000).toFixed(2)} <span className="text-sm font-normal text-slate-300">ล้านบาท</span>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] font-medium">🌾 ข้าวหอมมะลิ (นาปี)</span>
              <span className="font-bold text-emerald-300 text-sm mt-0.5 block">เฉลี่ย 360 กก./ไร่</span>
              <span className="text-[10px] text-slate-500">เกณฑ์คำนวณ 15.5 บาท/กก.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] font-medium">🍠 มันสำปะหลัง (โรงงาน)</span>
              <span className="font-bold text-amber-300 text-sm mt-0.5 block">เฉลี่ย 3,500 กก./ไร่</span>
              <span className="text-[10px] text-slate-500">เกณฑ์คำนวณ 3.20 บาท/กก.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] font-medium">🎋 อ้อยโรงงาน & พืชผัก</span>
              <span className="font-bold text-blue-300 text-sm mt-0.5 block">เฉลี่ย 10 ตัน/ไร่</span>
              <span className="text-[10px] text-slate-500">เกณฑ์คำนวณ 1.40 บาท/กก.</span>
            </div>
          </div>
        </div>

        {/* Data Anomaly Audit Callout Card (1 col) */}
        <div className="glass-card rounded-2xl p-5 border border-red-500/40 bg-gradient-to-br from-slate-900 via-red-950/30 to-slate-900 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3" /> Data Audit Alert
              </span>
              <span className="text-xs font-bold text-slate-400">พบปัญหา {stats.anomalyCount.toLocaleString()} แปลง</span>
            </div>
            <h4 className="text-base font-bold text-slate-100 mt-1">คัดกรองข้อมูลผิดปกติ & ตรวจสอบสิทธิ์</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              ตรวจสอบแปลงที่พิกัด UTM นอกเขตอำเภอห้วยราช, รอทำประชาคม, หรือที่ดินใหญ่ผิดปกติ เพื่อความถูกต้องของทะเบียน
            </p>
          </div>
          <button
            onClick={onOpenAudit}
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all active:scale-95 cursor-pointer"
          >
            <AlertCircle className="w-4 h-4" />
            <span>เปิดระบบคัดกรองแปลงมีปัญหา</span>
          </button>
        </div>
      </div>
    </div>
  );
}
