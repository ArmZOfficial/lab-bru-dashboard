import React, { useState, useMemo } from 'react';
import { AlertTriangle, Download, X, MapPin, AlertCircle, Maximize2, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatNumber } from '../utils/dateParser';

export default function DataAuditModal({ isOpen, onClose, records, onSelectRecord }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'utm', 'status', 'area'

  const { utmAnomalies, statusAnomalies, areaAnomalies, allAnomalies } = useMemo(() => {
    const utm = [];
    const status = [];
    const area = [];
    const allSet = new Set();

    records.forEach(r => {
      let isAnomaly = false;
      const x = Number(r.location?.utmX) || 0;
      const y = Number(r.location?.utmY) || 0;

      // 1. UTM Anomaly: 0, missing, or outside Huai Ratch typical bounds (Zone 47/48 rough bounds)
      if (x === 0 || y === 0 || x < 100000 || y < 1000000) {
        utm.push(r);
        isAnomaly = true;
      }

      // 2. Status Anomaly: Not 'ผ่าน'
      if (r.workflow?.status !== 'ผ่าน') {
        status.push(r);
        isAnomaly = true;
      }

      // 3. Area Anomaly: > 30 rai for a single plot
      if ((r.area?.totalRai || 0) > 30) {
        area.push(r);
        isAnomaly = true;
      }

      if (isAnomaly) {
        allSet.add(r);
      }
    });

    return {
      utmAnomalies: utm,
      statusAnomalies: status,
      areaAnomalies: area,
      allAnomalies: Array.from(allSet)
    };
  }, [records]);

  const displayedRecords = useMemo(() => {
    if (activeFilter === 'utm') return utmAnomalies;
    if (activeFilter === 'status') return statusAnomalies;
    if (activeFilter === 'area') return areaAnomalies;
    return allAnomalies;
  }, [activeFilter, utmAnomalies, statusAnomalies, areaAnomalies, allAnomalies]);

  const exportAuditCSV = () => {
    if (!displayedRecords.length) return;
    const headers = ['รหัสแปลง', 'ชื่อเกษตรกร', 'ตำบล', 'หมู่บ้าน', 'พืชที่ปลูก', 'เนื้อที่ (ไร่)', 'สถานะประชาคม', 'UTM X', 'UTM Y', 'ประเภทความผิดปกติ'];
    const rows = displayedRecords.map(r => {
      const x = Number(r.location?.utmX) || 0;
      const y = Number(r.location?.utmY) || 0;
      const issues = [];
      if (x === 0 || y === 0 || x < 100000 || y < 1000000) issues.push('พิกัด UTM ผิดพลาด/นอกเขต');
      if (r.workflow?.status !== 'ผ่าน') issues.push(`รอตรวจสอบ (${r.workflow?.status})`);
      if ((r.area?.totalRai || 0) > 30) issues.push('เนื้อที่ใหญ่ผิดปกติ');

      return [
        r.id || '',
        `"${r.farmerName || ''}"`,
        r.location?.tambon || '',
        `"หมู่ ${r.location?.moo || ''} ${r.location?.villageName || ''}"`,
        `${r.crop?.type || ''} (${r.crop?.variety || ''})`,
        r.area?.totalRai || 0,
        r.workflow?.status || '',
        x,
        y,
        `"${issues.join(' | ')}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `รายการแปลงเกษตรที่ต้องตรวจสอบ_อ.ห้วยราช_${displayedRecords.length}รายการ.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>ระบบคัดกรองข้อมูลผิดปกติและตรวจสอบสิทธิ์ (Data Anomaly Audit)</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                  พบข้อสังเกต {allAnomalies.length.toLocaleString()} แปลง
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                สำหรับเกษตรอำเภอและเกษตรตำบลใช้ตรวจสอบแปลงที่พิกัดผิดพลาด รอประชาคม หรือขนาดที่ดินผิดปกติ ก่อนปิดบัญชีทะเบียนเกษตรกร
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportAuditCSV}
              disabled={!displayedRecords.length}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก CSV รายชื่อลงพื้นที่</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFilter === 'all' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🚨 ทั้งหมดที่พบปัญหา</span>
            <span className="px-2 py-0.5 rounded-full bg-black/20 text-[11px]">{allAnomalies.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('utm')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFilter === 'utm' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>พิกัด UTM ผิดพลาด / ขาดพิกัด</span>
            <span className="px-2 py-0.5 rounded-full bg-black/20 text-[11px]">{utmAnomalies.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('status')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFilter === 'status' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>รอทำประชาคม / รอตรวจสอบ</span>
            <span className="px-2 py-0.5 rounded-full bg-black/20 text-[11px]">{statusAnomalies.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('area')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeFilter === 'area' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>เนื้อที่ใหญ่ผิดปกติ (&gt; 30 ไร่)</span>
            <span className="px-2 py-0.5 rounded-full bg-black/20 text-[11px]">{areaAnomalies.length}</span>
          </button>
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-y-auto p-6">
          {displayedRecords.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-300">ไม่พบข้อมูลผิดปกติในหมวดหมู่นี้</h3>
              <p className="text-xs text-slate-400 mt-1">ข้อมูลในระบบผ่านเกณฑ์การตรวจสอบสมบูรณ์</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800 text-slate-400 font-bold sticky top-0 z-10">
                <tr>
                  <th class="py-3 px-3 rounded-l-xl">รหัสแปลง</th>
                  <th class="py-3 px-4">ชื่อเกษตรกร</th>
                  <th class="py-3 px-3">ที่ตั้งแปลง (ตำบล)</th>
                  <th class="py-3 px-3">พืชและพันธุ์</th>
                  <th class="py-3 px-3 text-right">เนื้อที่ (ไร่)</th>
                  <th class="py-3 px-3">สถานะประชาคม</th>
                  <th class="py-3 px-3">พิกัด UTM</th>
                  <th class="py-3 px-4">ข้อสังเกต / สาเหตุที่ต้องตรวจ</th>
                  <th class="py-3 px-3 text-center rounded-r-xl">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
                {displayedRecords.map((r, idx) => {
                  const x = Number(r.location?.utmX) || 0;
                  const y = Number(r.location?.utmY) || 0;
                  const isUtmBad = x === 0 || y === 0 || x < 100000 || y < 1000000;
                  const isStatusBad = r.workflow?.status !== 'ผ่าน';
                  const isAreaBad = (r.area?.totalRai || 0) > 30;

                  return (
                    <tr key={r.id || idx} className="hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400">{r.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-100">{r.farmerName}</td>
                      <td className="py-3 px-3">ต.{r.location?.tambon} (ม.{r.location?.moo})</td>
                      <td className="py-3 px-3 text-emerald-400">{r.crop?.type}</td>
                      <td className={`py-3 px-3 text-right font-bold ${isAreaBad ? 'text-purple-400 bg-purple-500/10 rounded' : ''}`}>
                        {formatNumber(r.area?.totalRai, 1)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isStatusBad ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {r.workflow?.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {isUtmBad ? (
                          <span className="text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                            {x === 0 ? 'ไม่มีพิกัด' : `${x}, ${y}`}
                          </span>
                        ) : (
                          <span className="text-slate-400">{x}, {y}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {isUtmBad && <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] border border-red-800">พิกัด UTM นอกเขต/ขาดหาย</span>}
                          {isStatusBad && <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] border border-amber-800">รอประชาคมยืนยัน</span>}
                          {isAreaBad && <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] border border-purple-800">ที่ดินใหญ่เกิน 30 ไร่</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            onSelectRecord(r);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 mx-auto transition-all"
                          title="ดูรายละเอียดฉบับเต็ม"
                        >
                          <span>ตรวจสอบ</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>* เกณฑ์การคัดกรอง: พิกัด UTM อยู่นอกเขต Zone 47/48, สถานะยังไม่ผ่านประชาคม, หรือที่ดินต่อแปลงใหญ่กว่า 30 ไร่</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
