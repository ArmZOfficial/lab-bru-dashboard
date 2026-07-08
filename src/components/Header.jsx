import React, { useState, useRef } from 'react';
import { Sprout, Upload, RefreshCw, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { parseExcelFile } from '../utils/excelLoader';

export default function Header({ 
  totalRecords, 
  filteredRecords, 
  onDataLoaded, 
  onResetFilters,
  hasActiveFilters
}) {
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadError(null);
    try {
      const newData = await parseExcelFile(file);
      if (newData && newData.length > 0) {
        onDataLoaded(newData);
      } else {
        setUploadError('ไม่พบข้อมูลในไฟล์ Excel ที่อัปโหลด');
      }
    } catch (err) {
      console.error(err);
      setUploadError('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel กรุณาตรวจสอบรูปแบบไฟล์');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white flex-shrink-0">
            <Sprout className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                ทะเบียนเกษตรกร อำเภอห้วยราช
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ปี 2565–2567
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>ข้อมูลสำรวจแปลงเกษตร จังหวัดบุรีรัมย์</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-slate-300 font-medium">แสดง {filteredRecords.toLocaleString()} จาก {totalRecords.toLocaleString()} แปลง</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              title="ล้างตัวกรองทั้งหมด"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              ล้างตัวกรอง
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-slate-600 disabled:opacity-50"
            title="อัปโหลดไฟล์ Excel (.xlsx) เพื่ออัปเดตข้อมูล"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Upload className="w-4 h-4 text-emerald-400" />
            )}
            <span>{loading ? 'กำลังอ่านไฟล์...' : 'อัปโหลด Excel ใหม่'}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="max-w-7xl mx-auto mt-2 p-2 rounded-lg bg-red-900/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}
    </header>
  );
}
