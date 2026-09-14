import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Eye, 
  Compass, 
  Activity, 
  Flame, 
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Crosshair,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { GeoPreset, InferenceResult, MapLayerType, LandEntry, OverlapConflict } from '../types';

interface MapViewerProps {
  preset: GeoPreset;
  result: InferenceResult | null;
  isLoading: boolean;
  isNdvMode: boolean;
  onToggleNdvi: () => void;
  // Indian Land Registry props
  landEntries?: LandEntry[];
  conflicts?: OverlapConflict[];
  isMapClickMode?: boolean;
  mapClickedPoints?: [number, number][];
  onMapClick?: (lat: number, lng: number) => void;
  focusTarget?: { center: [number, number]; zoom: number } | null;
  onSelectIndianRegion?: (center: [number, number], zoom: number) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  preset,
  result,
  isLoading,
  isNdvMode,
  onToggleNdvi,
  landEntries = [],
  conflicts = [],
  isMapClickMode = false,
  mapClickedPoints = [],
  onMapClick,
  focusTarget,
  onSelectIndianRegion
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const hybridOverlayRef = useRef<L.TileLayer | null>(null);
  const vectorLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const landLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const drawingLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const aoiRectRef = useRef<L.Rectangle | null>(null);

  // Keep callback and mode refs fresh for leaflet event handlers
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const isMapClickModeRef = useRef(isMapClickMode);
  isMapClickModeRef.current = isMapClickMode;

  const [activeBaseLayer, setActiveBaseLayer] = useState<MapLayerType>('bhuvan');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeOverlayVisible, setActiveOverlayVisible] = useState<boolean>(true);
  const [activeLandVisible, setActiveLandVisible] = useState<boolean>(true);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: preset.center,
      zoom: preset.zoom,
      zoomControl: false,
      attributionControl: true
    });

    // Custom zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution
    map.attributionControl.setPrefix('Leaflet | ISRO Bhuvan & OpenGeos GeoAI');

    // Vector group for AI detections and segmentations
    const vectorGroup = L.layerGroup().addTo(map);
    vectorLayerGroupRef.current = vectorGroup;

    // Vector group for Cadastral Land Parcels
    const landGroup = L.layerGroup().addTo(map);
    landLayerGroupRef.current = landGroup;

    // Drawing group for interactive map coordinate picking
    const drawGroup = L.layerGroup().addTo(map);
    drawingLayerGroupRef.current = drawGroup;

    // Track mouse coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({ lat: Number(e.latlng.lat.toFixed(5)), lng: Number(e.latlng.lng.toFixed(5)) });
    });

    map.on('mouseout', () => {
      setCursorCoords(null);
    });

    // Click handler for interactive coordinate picking
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (isMapClickModeRef.current && onMapClickRef.current) {
        onMapClickRef.current(
          Number(e.latlng.lat.toFixed(5)),
          Number(e.latlng.lng.toFixed(5))
        );
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Handle Base Layer Switching (with Indian Sources)
  useEffect(() => {
    if (!mapRef.current) return;

    if (baseLayerRef.current) {
      mapRef.current.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }
    if (hybridOverlayRef.current) {
      mapRef.current.removeLayer(hybridOverlayRef.current);
      hybridOverlayRef.current = null;
    }

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri World Imagery &mdash; High-Resolution Satellite';
    let addHybrid = false;

    if (activeBaseLayer === 'bhuvan') {
      // ISRO Bhuvan style: High-resolution satellite base + Cartographic boundaries & places overlay
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; ISRO Bhuvan / NRSC & Esri &mdash; Indian Earth Observation Hybrid';
      addHybrid = true;
    } else if (activeBaseLayer === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors &mdash; Survey of India Grid';
    } else if (activeBaseLayer === 'voyager') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CARTO Voyager &mdash; Administrative Cadastre & State Borders';
    } else if (activeBaseLayer === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CARTO Dark Matter';
    } else if (activeBaseLayer === 'topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenTopoMap (CC-BY-SA) &mdash; Topographic Relief';
    }

    const tileLayer = L.tileLayer(url, {
      maxZoom: 19,
      attribution
    }).addTo(mapRef.current);

    baseLayerRef.current = tileLayer;

    if (addHybrid) {
      const hybrid = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.85 }
      ).addTo(mapRef.current);
      hybridOverlayRef.current = hybrid;
    }
  }, [activeBaseLayer]);

  // 3. Handle Preset Location Change (flyTo)
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.flyTo(preset.center, preset.zoom, {
      duration: 1.2
    });

    // Draw / update AOI Bounding Box boundary
    if (aoiRectRef.current) {
      aoiRectRef.current.remove();
    }

    const bounds = L.latLngBounds(preset.bounds[0], preset.bounds[1]);
    const rect = L.rectangle(bounds, {
      color: '#10b981',
      weight: 1.5,
      dashArray: '6, 6',
      fill: false,
      interactive: false
    }).addTo(mapRef.current);

    aoiRectRef.current = rect;
  }, [preset]);

  // 4. Handle Focus Target (e.g. Center on Parcel or Conflict)
  useEffect(() => {
    if (!mapRef.current || !focusTarget) return;
    mapRef.current.flyTo(focusTarget.center, focusTarget.zoom, {
      duration: 1.2
    });
  }, [focusTarget]);

  // 5. Render Registered Cadastral Land Parcels & Overlap Warnings
  useEffect(() => {
    if (!mapRef.current || !landLayerGroupRef.current) return;

    const group = landLayerGroupRef.current;
    group.clearLayers();

    if (!activeLandVisible || !landEntries || landEntries.length === 0) return;

    // Collect all IDs involved in overlap conflicts
    const conflictingIds = new Set<string>();
    conflicts.forEach(c => {
      conflictingIds.add(c.parcelId1);
      conflictingIds.add(c.parcelId2);
    });

    landEntries.forEach((parcel) => {
      const hasConflict = conflictingIds.has(parcel.id);
      const strokeColor = hasConflict ? '#ef4444' : (parcel.color || '#10b981');
      const fillColor = hasConflict ? '#ef4444' : (parcel.color || '#10b981');

      const polygon = L.polygon(parcel.coordinates, {
        color: strokeColor,
        weight: hasConflict ? 3 : 2,
        dashArray: hasConflict ? '6, 4' : undefined,
        fillColor: fillColor,
        fillOpacity: hasConflict ? 0.45 : 0.35,
      });

      // Cadastral Popup
      const conflictHtml = hasConflict
        ? `<div class="mt-1.5 p-2 rounded bg-rose-950/90 border border-rose-500 text-rose-200">
             <div class="font-bold text-rose-300 flex items-center gap-1 text-[11px]">
               <span>⚠️ CADASTRAL OVERLAP WARNING!</span>
             </div>
             <p class="mt-0.5 text-[10px] text-rose-200/90 leading-tight">
               Encroachment detected. Boundary intersects with adjacent cadastral plot.
             </p>
           </div>`
        : `<div class="mt-1 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
             <span>✅ Verified Clean Boundary (No Overlap)</span>
           </div>`;

      const coordsSummary = parcel.coordinates
        .slice(0, 4)
        .map(([lat, lng]) => `(${lat.toFixed(4)}, ${lng.toFixed(4)})`)
        .join(', ');

      polygon.bindPopup(`
        <div class="p-1 space-y-1.5 font-sans text-slate-100 min-w-[220px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
            <span class="font-bold text-xs ${hasConflict ? 'text-rose-400' : 'text-amber-400'} font-mono">${parcel.surveyNumber}</span>
            <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
              hasConflict 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }">
              ${hasConflict ? '⚠️ Overlapping' : 'Clear'}
            </span>
          </div>

          <div class="text-[11px] text-slate-300 space-y-0.5">
            <div><span class="text-slate-400">Landholder:</span> <b>${parcel.ownerName}</b></div>
            <div><span class="text-slate-400">Location:</span> ${parcel.district}, ${parcel.state}</div>
            <div><span class="text-slate-400">Registered Area:</span> <b class="text-amber-300">${parcel.areaHectares} ha</b> (${parcel.areaAcres} ac)</div>
            <div><span class="text-slate-400">Category:</span> <span class="capitalize text-slate-200">${parcel.landType}</span></div>
          </div>

          ${conflictHtml}

          <div class="text-[9px] text-slate-400 font-mono border-t border-slate-800 pt-1">
            <div>Perimeter: ${coordsSummary}...</div>
            <div class="mt-0.5 text-slate-500">Reg: ${parcel.registeredAt} &bull; EPSG:4326</div>
          </div>
        </div>
      `);

      group.addLayer(polygon);

      // Add a centroid warning badge if in conflict
      if (hasConflict) {
        const centerLat = parcel.coordinates.reduce((acc, p) => acc + p[0], 0) / parcel.coordinates.length;
        const centerLng = parcel.coordinates.reduce((acc, p) => acc + p[1], 0) / parcel.coordinates.length;

        const warningIcon = L.divIcon({
          className: 'cadastral-warning-marker',
          html: `<div style="
            background: #ef4444;
            color: #ffffff;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.9);
            cursor: pointer;
          ">⚠️</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const warningMarker = L.marker([centerLat, centerLng], { icon: warningIcon });
        warningMarker.bindTooltip(`⚠️ ${parcel.surveyNumber}: Boundary Overlap Warning!`, { permanent: false });
        group.addLayer(warningMarker);
      }
    });
  }, [landEntries, conflicts, activeLandVisible]);

  // 6. Render Drawing Mode (Interactive Map Clicker)
  useEffect(() => {
    if (!mapRef.current || !drawingLayerGroupRef.current) return;

    const group = drawingLayerGroupRef.current;
    group.clearLayers();

    if (!mapClickedPoints || mapClickedPoints.length === 0) return;

    // Draw vertex circle markers
    mapClickedPoints.forEach((pt, idx) => {
      const marker = L.circleMarker(pt, {
        radius: 6,
        color: '#f59e0b',
        fillColor: '#fbbf24',
        fillOpacity: 0.9,
        weight: 2
      }).bindTooltip(`Vertex #${idx + 1} (${pt[0].toFixed(4)}, ${pt[1].toFixed(4)})`, { permanent: false });
      group.addLayer(marker);
    });

    // Draw connecting line
    if (mapClickedPoints.length >= 2) {
      const polyline = L.polyline(mapClickedPoints, {
        color: '#f59e0b',
        weight: 2,
        dashArray: '5, 5'
      });
      group.addLayer(polyline);
    }

    // Draw closed preview polygon if 3 or more points
    if (mapClickedPoints.length >= 3) {
      const previewPoly = L.polygon(mapClickedPoints, {
        color: '#f59e0b',
        weight: 1.5,
        dashArray: '3, 3',
        fillColor: '#f59e0b',
        fillOpacity: 0.2
      });
      group.addLayer(previewPoly);
    }
  }, [mapClickedPoints]);

  // 7. Render Detections and Segmentations from Inference Result
  useEffect(() => {
    if (!mapRef.current || !vectorLayerGroupRef.current) return;

    const group = vectorLayerGroupRef.current;
    group.clearLayers();

    if (!activeOverlayVisible || !result) return;

    // Render Detection Bounding Boxes
    if (result.detections && result.detections.length > 0) {
      result.detections.forEach((det) => {
        const bounds = L.latLngBounds(det.bounds[0], det.bounds[1]);
        const rect = L.rectangle(bounds, {
          color: '#38bdf8',
          weight: 2,
          fillColor: '#0284c7',
          fillOpacity: 0.25
        });

        rect.bindPopup(`
          <div class="p-1 space-y-1 font-sans">
            <div class="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
              <span class="font-semibold text-xs text-sky-400 font-mono">${det.label}</span>
              <span class="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">
                ${(det.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div class="text-[10px] text-slate-400 font-mono mt-1">GeoAI Detector: RF-DETR</div>
          </div>
        `);

        group.addLayer(rect);
      });
    }

    // Render Segmentation Polygons
    if (result.segmentations && result.segmentations.length > 0) {
      result.segmentations.forEach((seg) => {
        const polygon = L.polygon(seg.points, {
          color: seg.color || '#10b981',
          weight: 2,
          fillColor: seg.color || '#10b981',
          fillOpacity: 0.35
        });

        polygon.bindPopup(`
          <div class="p-1 space-y-1 font-sans">
            <div class="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
              <span class="font-semibold text-xs text-emerald-400">${seg.label}</span>
              <span class="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                ${(seg.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div class="text-[11px] text-slate-300">
              <span class="text-slate-400">Area:</span> <b>${seg.areaKm2.toFixed(2)} km²</b>
            </div>
            <div class="text-[10px] text-slate-400 font-mono">SAM-Geospatial Mask</div>
          </div>
        `);

        group.addLayer(polygon);
      });
    }
  }, [result, activeOverlayVisible]);

  // Reset to preset center
  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(preset.center, preset.zoom);
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-950 select-none ${
      isMapClickMode ? 'cursor-crosshair' : ''
    }`}>
      {/* Map DOM Container */}
      <div 
        ref={mapContainerRef} 
        className={`w-full h-full transition-all duration-500 ${
          isNdvMode ? 'filter contrast-125 saturate-150 hue-rotate-[75deg]' : ''
        }`}
      />

      {/* Map Click Mode Active Banner */}
      {isMapClickMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce border-2 border-slate-900">
          <Crosshair className="w-4 h-4 animate-spin" />
          <span>Interactive Coordinate Capture: Click on map to add land vertices ({mapClickedPoints.length} added)</span>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center z-20 pointer-events-none transition-opacity">
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-5 shadow-2xl flex flex-col items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-white tracking-wide">Processing Indian Geospatial Satellite Data</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">ISRO Bhuvan / Cartosat Tiling & Inference...</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Map Controls Floating Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        {/* Base Layer Switcher (Indian Sources) */}
        <div className="flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 shadow-lg">
          <button
            onClick={() => setActiveBaseLayer('bhuvan')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center gap-1 ${
              activeBaseLayer === 'bhuvan'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="ISRO Bhuvan Indian Satellite & Hybrid Cadastral Layer"
          >
            <span>🇮🇳 Bhuvan Hybrid</span>
          </button>

          <button
            onClick={() => setActiveBaseLayer('osm')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center gap-1 ${
              activeBaseLayer === 'osm'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="OpenStreetMap India with Survey Grids"
          >
            <span>🇮🇳 OSM India</span>
          </button>

          <button
            onClick={() => setActiveBaseLayer('satellite')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
              activeBaseLayer === 'satellite'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="High-Resolution Optical Satellite"
          >
            Satellite
          </button>

          <button
            onClick={() => setActiveBaseLayer('voyager')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
              activeBaseLayer === 'voyager'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="State & District Administrative Cadastre"
          >
            Admin Borders
          </button>

          <button
            onClick={() => setActiveBaseLayer('topo')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
              activeBaseLayer === 'topo'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Elevation Contours & River Basins"
          >
            Topo
          </button>
        </div>

        {/* Overlays / Cadastre Toggles */}
        <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 shadow-lg">
          {/* Cadastre Layer Toggle */}
          <button
            onClick={() => setActiveLandVisible(!activeLandVisible)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition ${
              activeLandVisible
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Indian Land Parcel Boundaries"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Land Cadastre ({landEntries.length})</span>
          </button>

          {/* AI Inference Masks Toggle */}
          <button
            onClick={() => setActiveOverlayVisible(!activeOverlayVisible)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition ${
              activeOverlayVisible
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle AI inference vector masks"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>AI Masks</span>
          </button>

          {/* NDVI NIR Toggle */}
          <button
            onClick={onToggleNdvi}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition ${
              isNdvMode
                ? 'bg-lime-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Simulate False-Color Infrared / NDVI vegetative index"
          >
            <Flame className="w-3.5 h-3.5 text-lime-400" />
            <span>NIR</span>
          </button>

          <button
            onClick={handleResetView}
            className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition"
            title="Center view on current AOI"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Right Quick AOI & Overlap Warning Banner */}
      <div className="absolute top-3 right-3 z-10 hidden sm:flex flex-col items-end gap-1.5">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-2 text-right shadow-lg">
          <div className="text-[11px] font-bold text-white flex items-center justify-end gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {preset.name}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {preset.satelliteSource} &bull; {preset.resolution}
          </div>
        </div>

        {/* Overlap Alert Badge if collisions exist */}
        {conflicts.length > 0 && (
          <div className="bg-rose-950/90 backdrop-blur-md border border-rose-500/80 rounded-lg px-3 py-1.5 text-right shadow-lg flex items-center gap-2 text-rose-200 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="text-[11px] font-bold">
              <span>⚠️ {conflicts.length} Cadastral Overlap Warning{conflicts.length > 1 ? 's' : ''}!</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Left Coordinate Bar */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-md px-2.5 py-1 text-[11px] font-mono text-slate-300 flex items-center gap-3 shadow-md">
        <span>AOI Area: <b>{preset.stats.areaKm2} km²</b></span>
        <span className="text-slate-600">|</span>
        <span>Clouds: <b>{preset.stats.clouds}%</b></span>
        {cursorCoords && (
          <>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-semibold">
              Lat: {cursorCoords.lat}&deg;, Lng: {cursorCoords.lng}&deg;
            </span>
          </>
        )}
      </div>

      {/* Results Legend (Bottom Right) */}
      {result && activeOverlayVisible && (
        <div className="absolute bottom-14 right-3 z-10 max-w-xs bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 shadow-xl text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Inference Output
            </span>
            <span className="text-[10px] font-mono text-slate-400">{result.executionTimeMs}ms</span>
          </div>

          {result.detections.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-sky-400">
                Detected Objects ({result.detections.length})
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
                {result.detections.map((d) => (
                  <div key={d.id} className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-0.5">
                    <span className="truncate max-w-[170px] text-slate-300">{d.label}</span>
                    <span className="text-sky-300 font-semibold">{(d.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.segmentations.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-emerald-400">
                Segments ({result.segmentations.length})
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
                {result.segmentations.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-0.5">
                    <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="truncate text-slate-300">{s.label}</span>
                    </div>
                    <span className="text-slate-400">{s.areaKm2.toFixed(1)} km²</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
