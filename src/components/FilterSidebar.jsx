import React, { useMemo } from 'react';
import { Search, Filter, MapPin, Sprout, ShieldCheck, FileText, Database, AlertTriangle, X } from 'lucide-react';

export default function FilterSidebar({
  filters,
  onChange,
  availableOptions,
  totalRecords,
  filteredCount
}) {
  const years = ['ทั้งหมด', '2565', '2566', '2567'];

  // Dependent variety list based on selected crop
  const availableVarieties = useMemo(() => {
    if (!filters.crop || filters.crop === 'ทั้งหมด') {
      return availableOptions.varieties || [];
    }
    return availableOptions.cropVarietyMap?.[filters.crop] || [];
  }, [filters.crop, availableOptions]);

  const handleYearChange = (year) => {
    onChange('year', year);
  };

  return (
    <div className="glass-card rounded-2xl p-4 lg:p-5 flex flex-col gap-5 shadow-lg border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <Filter className="w-4 h-4" />
          <span>ตัวกรองข้อมูลวิเคราะห์</span>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          พบ {filteredCount.toLocaleString()} รายการ
        </span>
      </div>

      {/* 1. Year Filter Pills */}
      <div>
        <label className="text-xs font-medium text-slate-400 block mb-2">ปีทะเบียนเกษตรกร</label>
        <div className="grid grid-cols-4 gap-1.5">
          {years.map((y) => {
            const isActive = filters.year === y;
            return (
              <button
                key={y}
                onClick={() => handleYearChange(y)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-400/30'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Text Search */}
      <div>
        <label className="text-xs font-medium text-slate-400 block mb-1.5">ค้นหาชื่อเกษตรกร</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
            placeholder="ชื่อ หรือ นามสกุล..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {/* 3. Subdistrict */}
        <div>
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>ตำบลที่ตั้งแปลง</span>
          </label>
          <select
            value={filters.subdistrict || 'ทั้งหมด'}
            onChange={(e) => onChange('subdistrict', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ทั้งหมด">ทุกตำบลในห้วยราช ({availableOptions.subdistricts?.length || 7})</option>
            {availableOptions.subdistricts?.map((s) => (
              <option key={s} value={s}>ตำบล{s}</option>
            ))}
          </select>
        </div>

        {/* 4. Crop Type */}
        <div>
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>ชนิดพืช</span>
          </label>
          <select
            value={filters.crop || 'ทั้งหมด'}
            onChange={(e) => {
              onChange('crop', e.target.value);
              onChange('variety', 'ทั้งหมด'); // Reset variety when crop changes
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ทั้งหมด">ทุกชนิดพืช (5 ชนิดหลัก)</option>
            {availableOptions.crops?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* 5. Crop Variety (Dependent) */}
        <div>
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block ml-1"></span>
            <span>พันธุ์พืช</span>
          </label>
          <select
            value={filters.variety || 'ทั้งหมด'}
            onChange={(e) => onChange('variety', e.target.value)}
            disabled={!availableVarieties.length}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
          >
            <option value="ทั้งหมด">ทุกพันธุ์ ({availableVarieties.length})</option>
            {availableVarieties.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* 6. Community Hearing Status */}
        <div>
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>สถานะการประชาคม</span>
          </label>
          <select
            value={filters.status || 'ทั้งหมด'}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ทั้งหมด">ทุกสถานะ</option>
            {availableOptions.statuses?.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* 7. Land Deed Type */}
        <div>
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>ประเภทเอกสารสิทธิ์</span>
          </label>
          <select
            value={filters.landDeed || 'ทั้งหมด'}
            onChange={(e) => onChange('landDeed', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ทั้งหมด">ทุกประเภทเอกสารสิทธิ์</option>
            {availableOptions.landDeeds?.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* 8. Source System */}
        <div>
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>ระบบต้นทาง</span>
          </label>
          <select
            value={filters.sourceSystem || 'ทั้งหมด'}
            onChange={(e) => onChange('sourceSystem', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ทั้งหมด">ระบบทั้งหมด (ทบก / FARMBOOK)</option>
            {availableOptions.sources?.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Special Analytical Toggle: Cross-district residence */}
      <div className="pt-3 border-t border-slate-800">
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.outsideHuaiRach || false}
            onChange={(e) => onChange('outsideHuaiRach', e.target.checked)}
            className="mt-0.5 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-[11px] text-slate-300 group-hover:text-emerald-300 leading-snug transition-colors">
            <span className="font-medium text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 inline" /> แยกวิเคราะห์พิเศษ:
            </span>
            เฉพาะเกษตรกรที่มีทะเบียนบ้านอยู่นอกอำเภอห้วยราช (พบ 565 รายการ)
          </span>
        </label>
      </div>
    </div>
  );
}
