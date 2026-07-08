import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import KpiSection from './components/KpiSection';
import YearlyTrendChart from './components/charts/YearlyTrendChart';
import CropShareChart from './components/charts/CropShareChart';
import VarietyBarChart from './components/charts/VarietyBarChart';
import SubdistrictChart from './components/charts/SubdistrictChart';
import StatusWorkflowChart from './components/charts/StatusWorkflowChart';
import LandDeedChart from './components/charts/LandDeedChart';
import PlantingCalendarChart from './components/charts/PlantingCalendarChart';
import MapView from './components/MapView';
import DataTable from './components/DataTable';
import DetailModal from './components/DetailModal';
import DataAuditModal from './components/DataAuditModal';
import { Sprout, Loader2, BarChart2, Map, Table as TableIcon, LayoutDashboard } from 'lucide-react';

const INITIAL_FILTERS = {
  year: 'ทั้งหมด',
  subdistrict: 'ทั้งหมด',
  crop: 'ทั้งหมด',
  variety: 'ทั้งหมด',
  status: 'ทั้งหมด',
  landDeed: 'ทั้งหมด',
  sourceSystem: 'ทั้งหมด',
  search: '',
  outsideHuaiRach: false
};

export default function App() {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'map', 'table'
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Load pre-processed JSON data on start
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/data/huairach_farmers.json');
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลจำลองได้');
        const data = await res.json();
        setAllRecords(data);
      } catch (err) {
        console.error(err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาตรวจสอบไฟล์สาธิต');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDataLoaded = useCallback((newData) => {
    setAllRecords(newData);
    setFilters(INITIAL_FILTERS);
  }, []);

  const handleFilterChange = useCallback((key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([k, v]) => {
      if (k === 'outsideHuaiRach') return v === true;
      if (k === 'search') return v !== '';
      return v !== 'ทั้งหมด';
    });
  }, [filters]);

  // Compute available filter options dynamically
  const availableOptions = useMemo(() => {
    const subdistricts = new Set();
    const crops = new Set();
    const statuses = new Set();
    const landDeeds = new Set();
    const sources = new Set();
    const cropVarietyMap = {};

    allRecords.forEach(r => {
      if (r.location?.tambon) subdistricts.add(r.location.tambon);
      if (r.crop?.type) {
        crops.add(r.crop.type);
        if (!cropVarietyMap[r.crop.type]) cropVarietyMap[r.crop.type] = new Set();
        if (r.crop.variety) cropVarietyMap[r.crop.type].add(r.crop.variety);
      }
      if (r.workflow?.status) statuses.add(r.workflow.status);
      if (r.landDeed?.type) landDeeds.add(r.landDeed.type);
      if (r.sourceSystem) sources.add(r.sourceSystem);
    });

    const formattedMap = {};
    Object.keys(cropVarietyMap).forEach(k => {
      formattedMap[k] = Array.from(cropVarietyMap[k]).sort();
    });

    return {
      subdistricts: Array.from(subdistricts).sort(),
      crops: Array.from(crops).sort(),
      statuses: Array.from(statuses).sort(),
      landDeeds: Array.from(landDeeds).sort(),
      sources: Array.from(sources).sort(),
      cropVarietyMap: formattedMap
    };
  }, [allRecords]);

  // Filter records based on current filter state
  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      if (filters.year !== 'ทั้งหมด' && r.year !== filters.year) return false;
      if (filters.subdistrict !== 'ทั้งหมด' && r.location?.tambon !== filters.subdistrict) return false;
      if (filters.crop !== 'ทั้งหมด' && r.crop?.type !== filters.crop) return false;
      if (filters.variety !== 'ทั้งหมด' && r.crop?.variety !== filters.variety) return false;
      if (filters.status !== 'ทั้งหมด' && r.workflow?.status !== filters.status) return false;
      if (filters.landDeed !== 'ทั้งหมด' && r.landDeed?.type !== filters.landDeed) return false;
      if (filters.sourceSystem !== 'ทั้งหมด' && r.sourceSystem !== filters.sourceSystem) return false;
      
      if (filters.outsideHuaiRach) {
        if (!r.farmerAddress?.amphoe || r.farmerAddress.amphoe === 'ห้วยราช') return false;
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        const nameMatch = r.farmerName?.toLowerCase().includes(query);
        const idMatch = r.id?.toLowerCase().includes(query);
        if (!nameMatch && !idMatch) return false;
      }

      return true;
    });
  }, [allRecords, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-4 animate-pulse">
          <Sprout className="w-8 h-8 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          กำลังประมวลผลข้อมูลทะเบียนเกษตรกร...
        </h2>
        <p className="text-xs text-slate-400 mt-2">เตรียมข้อมูล 8,926 รายการ สำหรับอำเภอห้วยราช จังหวัดบุรีรัมย์</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-6 rounded-2xl bg-slate-900 border border-red-500/50 text-slate-200">
          <h3 className="text-lg font-bold text-red-400 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-xs text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Header */}
      <Header
        totalRecords={allRecords.length}
        filteredRecords={filteredRecords.length}
        onDataLoaded={handleDataLoaded}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Global Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            availableOptions={availableOptions}
            totalRecords={allRecords.length}
            filteredCount={filteredRecords.length}
          />
        </aside>

        {/* Right Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Navigation Tabs for Mobile / Quick view */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'dashboard' ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>ภาพรวม & กราฟวิเคราะห์</span>
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'map' ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>แผนที่พิกัดแปลง (UTM)</span>
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'table' ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>ตารางรายละเอียด</span>
              </button>
            </div>

            <span className="text-xs text-slate-400 hidden sm:inline">
              คลิกที่กราฟหรือจุดแผนที่เพื่อกรองหรือดูข้อมูลแปลง
            </span>
          </div>

          {/* KPI Summary Cards (Always visible at top of content area) */}
          <KpiSection
            records={filteredRecords}
            selectedYear={filters.year}
            allRecords={allRecords}
            onOpenAudit={() => setShowAuditModal(true)}
          />

          {/* Tab Content 1: Dashboard Charts */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Row 1: Yearly Trend & Status Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <YearlyTrendChart allRecords={allRecords} />
                <StatusWorkflowChart allRecords={allRecords} />
              </div>

              {/* Row 2: Crop Share & Variety Ranking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CropShareChart records={filteredRecords} onSelectCrop={(crop) => handleFilterChange('crop', crop)} />
                <VarietyBarChart records={filteredRecords} />
              </div>

              {/* Row 3: Subdistrict & Land Deeds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SubdistrictChart records={filteredRecords} />
                <LandDeedChart records={filteredRecords} />
              </div>

              {/* Row 4: Planting Calendar */}
              <div>
                <PlantingCalendarChart records={filteredRecords} />
              </div>
            </div>
          )}

          {/* Tab Content 2: Map View */}
          {activeTab === 'map' && (
            <div className="animate-fadeIn">
              <MapView records={filteredRecords} onSelectRecord={(rec) => setSelectedRecord(rec)} />
            </div>
          )}

          {/* Tab Content 3: Data Table */}
          {activeTab === 'table' && (
            <div className="animate-fadeIn">
              <DataTable records={filteredRecords} onSelectRecord={(rec) => setSelectedRecord(rec)} />
            </div>
          )}

          {/* Always show preview table at bottom if on dashboard tab */}
          {activeTab === 'dashboard' && (
            <div className="pt-4 border-t border-slate-800/80">
              <DataTable records={filteredRecords} onSelectRecord={(rec) => setSelectedRecord(rec)} />
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-800 bg-slate-900/60 text-center text-xs text-slate-500">
        <p>แดชบอร์ดทะเบียนเกษตรกร อำเภอห้วยราช จังหวัดบุรีรัมย์ | พัฒนาโดยอิงจากข้อมูลสำรวจจำลอง ปีทะเบียน 2565–2567</p>
      </footer>

      {/* Detail Slide-over Modal */}
      <DetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />

      {/* Data Anomaly & Audit Modal */}
      <DataAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        records={allRecords}
        onSelectRecord={(rec) => setSelectedRecord(rec)}
      />
    </div>
  );
}
