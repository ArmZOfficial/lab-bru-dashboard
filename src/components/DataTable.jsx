import React, { useState, useMemo } from 'react';
import { Table, ArrowUpDown, Download, ChevronLeft, ChevronRight, Eye, Search, FileSpreadsheet, MapPin } from 'lucide-react';
import { formatNumber } from '../utils/dateParser';
import { STATUS_COLORS } from './charts/StatusWorkflowChart';
import { CROP_COLORS } from './charts/CropShareChart';

export default function DataTable({ records, onSelectRecord }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState('year');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'area') {
        valA = a.area.totalRai || 0;
        valB = b.area.totalRai || 0;
      } else if (sortField === 'farmerName') {
        valA = a.farmerName || '';
        valB = b.farmerName || '';
      } else if (sortField === 'crop') {
        valA = a.crop.type || '';
        valB = b.crop.type || '';
      } else if (sortField === 'tambon') {
        valA = a.location.tambon || '';
        valB = b.location.tambon || '';
      } else if (sortField === 'status') {
        valA = a.workflow.status || '';
        valB = b.workflow.status || '';
      } else if (sortField === 'plantDate') {
        valA = a.dates.plantIso || '';
        valB = b.dates.plantIso || '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, sortField, sortOrder]);

  // Paginate records
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Export to CSV with UTF-8 BOM for Excel
  const handleExportCsv = () => {
    if (!sortedRecords.length) return;

    const headers = [
      'ACTIVITY_ID', 'ชื่อ-นามสกุล', 'หมู่ (ทะเบียนบ้าน)', 'ตำบล (ทะเบียนบ้าน)', 'อำเภอ (ทะเบียนบ้าน)', 'จังหวัด (ทะเบียนบ้าน)',
      'ประเภทเอกสารสิทธิ์', 'เลขที่', 'การถือครอง', 'ZONE', 'X', 'Y',
      'หมู่ (แปลง)', 'ตำบล (แปลง)', 'อำเภอ (แปลง)', 'จังหวัด (แปลง)',
      'พืช', 'พันธุ์', 'เนื้อที่รวม (ไร่)', 'เนื้อที่ (ไร่/งาน/ตร.วา)',
      'วันที่ปลูก', 'วันที่เก็บเกี่ยว', 'สถานะการประชาคม', 'วันที่ส่งประกันรายได้', 'วันที่ส่งสนับสนุน',
      'บันทึกจาก', 'วันที่บันทึก', 'ปีทะเบียน'
    ];

    const rows = sortedRecords.map(r => [
      r.id,
      r.farmerName,
      r.farmerAddress.moo,
      r.farmerAddress.tambon,
      r.farmerAddress.amphoe,
      r.farmerAddress.province,
      r.landDeed.type,
      r.landDeed.number,
      r.landDeed.ownership,
      r.location.zone || '',
      r.location.utmX || '',
      r.location.utmY || '',
      r.location.moo,
      r.location.tambon,
      r.location.amphoe,
      r.location.province,
      r.crop.type,
      r.crop.variety,
      r.area.totalRai,
      `${r.area.rai} ไร่ ${r.area.ngan} งาน ${r.area.wah} ตร.วา`,
      r.dates.plantText,
      r.dates.harvestText,
      r.workflow.status,
      r.workflow.sendIncomeDate,
      r.workflow.sendSupportDate,
      r.sourceSystem,
      r.workflow.recordDate,
      r.year
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ทะเบียนเกษตรกร_ห้วยราช_กรองแล้ว_${sortedRecords.length}รายการ.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col shadow-xl">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100">ตารางข้อมูลรายละเอียดรายแปลง</h4>
            <p className="text-xs text-slate-400">แสดงผลที่กรองแล้วทั้งหมด {sortedRecords.length.toLocaleString()} รายการ (คลิกแถวเพื่อดู 36 คอลัมน์)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value={15}>แสดง 15 แถว</option>
            <option value={25}>แสดง 25 แถว</option>
            <option value={50}>แสดง 50 แถว</option>
            <option value={100}>แสดง 100 แถว</option>
          </select>

          <button
            onClick={handleExportCsv}
            disabled={!sortedRecords.length}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            title="ส่งออกข้อมูลตามตัวกรองปัจจุบันเป็นไฟล์ CSV เปิดใน Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV/Excel</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-800/80 max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold sticky top-0 z-10 backdrop-blur-md border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 w-12 text-center">ลำดับ</th>
              <th className="py-3 px-3 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('year')}>
                <div className="flex items-center gap-1">
                  <span>ปี</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('farmerName')}>
                <div className="flex items-center gap-1">
                  <span>เกษตรกร (ชื่อ-นามสกุล)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('tambon')}>
                <div className="flex items-center gap-1">
                  <span>ที่ตั้งแปลง (ตำบล)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('crop')}>
                <div className="flex items-center gap-1">
                  <span>พืช / พันธุ์</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('area')}>
                <div className="flex items-center justify-end gap-1">
                  <span>เนื้อที่รวม (ไร่)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('plantDate')}>
                <div className="flex items-center gap-1">
                  <span>วันที่ปลูก - เก็บเกี่ยว</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  <span>สถานะการประชาคม</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((r, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const isMismatch = r.farmerAddress.amphoe && r.farmerAddress.amphoe !== 'ห้วยราช';
                const cropColor = CROP_COLORS[r.crop.type] || '#fff';
                const statusColor = STATUS_COLORS[r.workflow.status] || '#f59e0b';

                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord && onSelectRecord(r)}
                    className="hover:bg-slate-800/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{rowNum}</td>
                    <td className="py-3 px-3 font-medium text-emerald-400">{r.year}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {r.farmerName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>ทะเบียนบ้าน: ต.{r.farmerAddress.tambon || '-'} อ.{r.farmerAddress.amphoe || '-'}</span>
                        {isMismatch && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-medium">
                            นอกเขต
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium">ต.{r.location.tambon}</div>
                      <div className="text-[11px] text-slate-400">หมู่ {r.location.moo || '-'} อ.ห้วยราช</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold flex items-center gap-1.5" style={{ color: cropColor }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cropColor }}></span>
                        {r.crop.type}
                      </div>
                      <div className="text-[11px] text-slate-400">{r.crop.variety}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-slate-100 text-sm">{formatNumber(r.area.totalRai, 2)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ({r.area.rai} ร. {r.area.ngan} ง. {r.area.wah} ว.)
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">ปลูก: {r.dates.plantText}</div>
                      <div className="text-[11px] text-slate-400">เกี่ยว: {r.dates.harvestText}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="px-2 py-1 rounded-full text-[11px] font-semibold inline-block text-white"
                        style={{ backgroundColor: statusColor }}
                      >
                        {r.workflow.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => { e.stopPropagation(); onSelectRecord && onSelectRecord(r); }}>
                      <button
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                        title="ดูรายละเอียดแปลงทั้งหมด 36 คอลัมน์"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  ไม่พบข้อมูลตามเงื่อนไขที่เลือก กรุณาล้างตัวกรองหรือลองค้นหาคำอื่น
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div>
            แสดงหน้า <strong className="text-slate-200">{currentPage}</strong> จาก <strong className="text-slate-200">{totalPages}</strong> หน้า
            (รวม {sortedRecords.length.toLocaleString()} รายการ)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ก่อนหน้า</span>
            </button>

            {/* Quick Page Jump */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-medium transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-emerald-500 text-white shadow'
                        : 'bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
