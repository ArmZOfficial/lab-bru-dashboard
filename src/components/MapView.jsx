import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { MapPin, Layers, Sprout, ShieldCheck, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { HUAIRACH_CENTER, HUAIRACH_ZOOM } from '../utils/geoConverter';
import { CROP_COLORS } from './charts/CropShareChart';
import { STATUS_COLORS } from './charts/StatusWorkflowChart';
import { formatNumber } from '../utils/dateParser';

export default function MapView({ records, onSelectRecord }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [colorMode, setColorMode] = useState('crop'); // 'crop' or 'status'
  const [mapLayer, setMapLayer] = useState('street'); // 'street' or 'satellite'

  // Filter records with valid lat/lng
  const { validRecords, missingCount } = useMemo(() => {
    const valid = [];
    let missing = 0;
    records.forEach(r => {
      if (r.location && r.location.lat !== null && r.location.lng !== null) {
        valid.push(r);
      } else {
        missing += 1;
      }
    });
    return { validRecords: valid, missingCount: missing };
  }, [records]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: HUAIRACH_CENTER,
      zoom: HUAIRACH_ZOOM,
      zoomControl: false,
      preferCanvas: true
    });

    // Add zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default tile layer (CartoDB Dark / Voyager or OSM)
    const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle layer switch (Street vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    
    // Clear old base layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapLayer === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
      }).addTo(map);
    }
  }, [mapLayer]);

  // Update Markers when records or colorMode changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    // Use Canvas renderer for maximum performance with thousands of points
    const canvasRenderer = L.canvas({ padding: 0.5 });

    validRecords.forEach((r) => {
      let color = '#64748b';
      if (colorMode === 'crop') {
        color = CROP_COLORS[r.crop.type] || '#64748b';
      } else if (colorMode === 'status') {
        color = STATUS_COLORS[r.workflow.status] || '#f59e0b';
      } else if (colorMode === 'drought') {
        const lowRisk = ['ห้วยราช', 'สามประเอิก', 'โคกเหล็ก'];
        if (lowRisk.includes(r.location?.tambon)) {
          color = '#06b6d4'; // Cyan (ชลประทาน/เสี่ยงแล้งต่ำ)
        } else {
          color = '#ef4444'; // Red (นอกเขตชลประทาน/เสี่ยงแล้งสูง)
        }
      }

      // Calculate radius based on area (Rai)
      const area = r.area.totalRai || 1;
      const radius = Math.max(5, Math.min(16, Math.sqrt(area) * 3));

      const marker = L.circleMarker([r.location.lat, r.location.lng], {
        renderer: canvasRenderer,
        radius,
        fillColor: color,
        fillOpacity: 0.8,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9
      });

      // Popup HTML content
      const popupHtml = `
        <div class="p-2 min-w-[220px] font-sans">
          <div class="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span class="text-xs font-bold text-emerald-400">รหัสแปลง: ${r.id}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white" style="background-color: ${STATUS_COLORS[r.workflow.status] || '#f59e0b'}">
              ${r.workflow.status}
            </span>
          </div>
          <div class="text-xs space-y-1 text-slate-200">
            <p><strong>เกษตรกร:</strong> ${r.farmerName}</p>
            <p><strong>พืช/พันธุ์:</strong> <span style="color:${CROP_COLORS[r.crop.type] || '#fff'}">${r.crop.type}</span> (${r.crop.variety})</p>
            <p><strong>เนื้อที่รวม:</strong> ${formatNumber(r.area.totalRai, 2)} ไร่</p>
            <p><strong>ที่ตั้งแปลง:</strong> ต.${r.location.tambon} อ.${r.location.amphoe}</p>
            <p><strong>ปีทะเบียน:</strong> ${r.year}</p>
          </div>
          <button 
            id="btn-detail-${r.id}" 
            class="mt-3 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>ดูรายละเอียดเต็มรูปแบบ</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { minWidth: 240 });

      // Handle popup button click event via leaflet popupopen
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-detail-${r.id}`);
        if (btn && onSelectRecord) {
          btn.onclick = () => {
            marker.closePopup();
            onSelectRecord(r);
          };
        }
      });

      layerGroup.addLayer(marker);
    });
  }, [validRecords, colorMode, onSelectRecord]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(HUAIRACH_CENTER, HUAIRACH_ZOOM);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col h-[560px] relative overflow-hidden">
      {/* Map Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <MapPin className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold text-slate-100">แผนที่กระจายตัวแปลงเกษตร (UTM Zone 47/48)</h4>
              <button
                onClick={handleResetView}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                title="จัดกึ่งกลางแผนที่อำเภอห้วยราช"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-400">คลิกที่จุดเพื่อดูข้อมูลแปลงเกษตรกร และขนาดจุดสอดคล้องตามเนื้อที่ (ไร่)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Color Mode Switcher */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setColorMode('crop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                colorMode === 'crop' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>สีตามชนิดพืช</span>
            </button>
            <button
              onClick={() => setColorMode('status')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                colorMode === 'status' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>สีตามสถานะ</span>
            </button>
            <button
              onClick={() => setColorMode('drought')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                colorMode === 'drought' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>โซนเสี่ยงภัยแล้ง/ชลประทาน</span>
            </button>
          </div>

          {/* Base Layer Switcher */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setMapLayer('street')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                mapLayer === 'street' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ถนน/แผนที่ปกติ
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                mapLayer === 'satellite' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ดาวเทียม
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full flex-1 rounded-xl overflow-hidden border border-slate-800 relative shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Notice Counter */}
        <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>แสดงบนแผนที่: <strong className="text-emerald-400 font-bold">{validRecords.length.toLocaleString()}</strong> แปลง</span>
          {missingCount > 0 && (
            <span className="text-amber-400 font-medium flex items-center gap-1 ml-2 border-l border-slate-700 pl-2" title="แปลงที่ไม่มีค่า X,Y ในระบบต้นทาง">
              <AlertTriangle className="w-3.5 h-3.5 inline" />
              ข้าม {missingCount} แปลงที่ไม่ระบุพิกัด
            </span>
          )}
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 text-[11px] text-slate-300 shadow-xl max-w-xs">
          <div className="font-semibold text-slate-200 mb-1.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-teal-400" />
            <span>สัญลักษณ์ ({colorMode === 'crop' ? 'ชนิดพืช' : colorMode === 'status' ? 'สถานะการประชาคม' : 'โซนเสี่ยงภัยแล้ง/ชลประทาน'})</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {colorMode === 'crop' ? (
              Object.entries(CROP_COLORS).map(([name, color]) => (
                <div key={name} className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                  <span className="truncate">{name}</span>
                </div>
              ))
            ) : colorMode === 'status' ? (
              Object.entries(STATUS_COLORS).map(([name, color]) => (
                <div key={name} className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                  <span className="truncate">{name}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-1.5 truncate col-span-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[#06b6d4]"></span>
                  <span className="truncate text-cyan-300 font-medium">ในเขตชลประทาน (เสี่ยงต่ำ)</span>
                </div>
                <div className="flex items-center gap-1.5 truncate col-span-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[#ef4444]"></span>
                  <span className="truncate text-red-300 font-medium">นอกเขตชลประทาน (เสี่ยงแล้งสูง)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
