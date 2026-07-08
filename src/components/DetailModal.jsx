import React from 'react';
import { X, User, MapPin, FileText, Sprout, Calendar, ShieldCheck, Database, AlertTriangle, Layers } from 'lucide-react';
import { formatNumber } from '../utils/dateParser';
import { STATUS_COLORS } from './charts/StatusWorkflowChart';

export default function DetailModal({ record, onClose }) {
  if (!record) return null;

  const isAddressMismatch = record.farmerAddress.amphoe && record.farmerAddress.amphoe !== 'ห้วยราช';
  const statusColor = STATUS_COLORS[record.workflow.status] || '#f59e0b';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 lg:p-6 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg lg:text-xl font-bold text-slate-100">รายละเอียดกิจกรรมทะเบียนเกษตรกร</h3>
                <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: statusColor }}>
                  {record.workflow.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                รหัสอ้างอิงกิจกรรม (ACTIVITY_ID): <span className="text-emerald-400">{record.id}</span> | ปีทะเบียน: <strong className="text-slate-200">{record.year}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-4 lg:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Section 1: Address vs Plot Location Comparison (Critical Concept) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 pb-1 border-b border-slate-800">
              <MapPin className="w-4 h-4" />
              <span>เปรียบเทียบที่อยู่เกษตรกร vs ที่ตั้งแปลงปลูกจริง (แยกแนวคิดชัดเจน)</span>
            </div>

            {isAddressMismatch && (
              <div className="p-3 rounded-xl bg-amber-900/30 border border-amber-500/40 text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">ที่อยู่ตามทะเบียนบ้านต่างจากอำเภอที่ตั้งแปลง</strong>
                  <span>เกษตรกรรายนี้มีทะเบียนบ้านอยู่ใน อำเภอ{record.farmerAddress.amphoe} จังหวัด{record.farmerAddress.province} แต่มาขึ้นทะเบียนแปลงปลูกในอำเภอห้วยราช จังหวัดบุรีรัมย์</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {/* Box 1: Farmer Registered Address */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-200 text-sm flex items-center gap-1.5 text-blue-400">
                  <User className="w-4 h-4" />
                  <span>1. ข้อมูลเกษตรกร (ตามทะเบียนบ้าน)</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <p><span className="text-slate-400">ชื่อ-นามสกุล:</span> <strong className="text-slate-100 font-medium">{record.farmerName}</strong></p>
                  <p><span className="text-slate-400">หมู่ที่:</span> {record.farmerAddress.moo || '-'}</p>
                  <p><span className="text-slate-400">ตำบล:</span> {record.farmerAddress.tambon || '-'}</p>
                  <p><span className="text-slate-400">อำเภอ:</span> <span className={isAddressMismatch ? 'text-amber-400 font-semibold' : ''}>{record.farmerAddress.amphoe || '-'}</span></p>
                  <p><span className="text-slate-400">จังหวัด:</span> <span className={isAddressMismatch ? 'text-amber-400 font-semibold' : ''}>{record.farmerAddress.province || '-'}</span></p>
                </div>
              </div>

              {/* Box 2: Actual Plot Location */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-200 text-sm flex items-center gap-1.5 text-emerald-400">
                  <MapPin className="w-4 h-4" />
                  <span>2. ที่ตั้งแปลงปลูกจริง & พิกัด UTM</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <p><span className="text-slate-400">ตำบลที่ตั้งแปลง:</span> <strong className="text-emerald-400 font-bold">ต.{record.location.tambon}</strong></p>
                  <p><span className="text-slate-400">หมู่ที่ (แปลง):</span> หมู่ {record.location.moo || '-'}</p>
                  <p><span className="text-slate-400">อำเภอ/จังหวัด (แปลง):</span> อ.{record.location.amphoe} จ.{record.location.province}</p>
                  <p><span className="text-slate-400">พิกัด UTM:</span> Zone {record.location.zone || '-'} | X: <span className="font-mono">{record.location.utmX || 'ไม่ระบุ'}</span> | Y: <span className="font-mono">{record.location.utmY || 'ไม่ระบุ'}</span></p>
                  <p><span className="text-slate-400">พิกัด WGS84 (Lat/Long):</span> {record.location.lat ? `${record.location.lat.toFixed(6)}, ${record.location.lng.toFixed(6)}` : 'ไม่มีพิกัด'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Crop & Cultivated Area */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-400 pb-1 border-b border-slate-800">
              <Sprout className="w-4 h-4" />
              <span>ข้อมูลพืช และขนาดพื้นที่เพาะปลูก</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">ชนิดพืช / พันธุ์พืช</span>
                <span className="text-base font-bold text-slate-100">{record.crop.type}</span>
                <span className="text-xs text-teal-400 block mt-0.5 font-medium">{record.crop.variety}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">เนื้อที่ปลูกจริง (รวมหน่วยไร่ทศนิยม)</span>
                <span className="text-lg font-bold text-amber-400">{formatNumber(record.area.totalRai, 4)} ไร่</span>
                <span className="text-xs text-slate-400 block mt-0.5">ใช้ในการคำนวณและสร้างกราฟ</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">เนื้อที่ปลูกจริง (ไร่-งาน-ตร.วา)</span>
                <span className="text-sm font-semibold text-slate-200">
                  {record.area.rai} ไร่ {record.area.ngan} งาน {record.area.wah} ตร.วา
                </span>
                <span className="text-xs text-slate-500 block mt-0.5 font-mono">1 ไร่ = 4 งาน = 400 ตร.วา</span>
              </div>
            </div>
          </div>

          {/* Section 3: Land Deed & Rights */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-400 pb-1 border-b border-slate-800">
              <FileText className="w-4 h-4" />
              <span>เอกสารสิทธิ์ที่ดิน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">ประเภทเอกสารสิทธิ์</span>
                <span className="text-sm font-bold text-slate-200">{record.landDeed.type || 'ไม่มีเอกสารสิทธิ์'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">เลขที่เอกสาร</span>
                <span className="text-sm font-mono font-medium text-slate-200">{record.landDeed.number || '-'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">รูปแบบการถือครอง & เนื้อที่เอกสาร</span>
                <span className="text-sm font-semibold text-emerald-400">{record.landDeed.ownership || 'อื่นๆ'}</span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  ({record.landDeed.docArea.rai} ร. {record.landDeed.docArea.ngan} ง. {record.landDeed.docArea.wah} ว.)
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Workflow Dates & Source System */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-400 pb-1 border-b border-slate-800">
              <Calendar className="w-4 h-4" />
              <span>วันที่ดำเนินกิจกรรม & สถานะกระบวนการ</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block">วันที่ปลูก</span>
                <strong className="text-slate-200 block mt-1">{record.dates.plantText}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block">วันที่เก็บเกี่ยว</span>
                <strong className="text-slate-200 block mt-1">{record.dates.harvestText}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block">ส่งข้อมูลประกันรายได้ฯ</span>
                <strong className="text-slate-200 block mt-1">{record.workflow.sendIncomeDate}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block">ส่งข้อมูลสนับสนุนฯ</span>
                <strong className="text-slate-200 block mt-1">{record.workflow.sendSupportDate}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">ระบบต้นทาง:</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">{record.sourceSystem}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">วันที่บันทึกระบบ:</span>
                <span className="text-slate-200 font-medium">{record.workflow.recordDate}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">การเงิน (ผลการโอน):</span>
                <span className="text-slate-500 italic">ไม่มีข้อมูลในระบบต้นทาง</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
