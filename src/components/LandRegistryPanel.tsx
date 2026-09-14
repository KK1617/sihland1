import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Crosshair, 
  FileSpreadsheet, 
  ShieldAlert, 
  Layers, 
  Sparkles, 
  Compass, 
  ExternalLink,
  Info,
  Edit3,
  ListFilter
} from 'lucide-react';
import { LandEntry, LandType, OverlapConflict } from '../types';
import { 
  parseCoordinatesInput, 
  calculatePolygonArea, 
  checkCandidateOverlap 
} from '../utils/geoMath';
import { INDIAN_STATES, SAMPLE_INDIAN_TEMPLATES } from '../data/initialLandParcels';

interface LandRegistryPanelProps {
  landEntries: LandEntry[];
  onAddLandEntry: (entry: LandEntry) => void;
  onDeleteLandEntry: (id: string) => void;
  conflicts: OverlapConflict[];
  onFocusParcel: (entry: LandEntry) => void;
  onFocusConflict: (conflict: OverlapConflict) => void;
  isMapClickMode: boolean;
  onToggleMapClickMode: () => void;
  mapClickedPoints: [number, number][];
  onClearMapClickedPoints: () => void;
}

export const LandRegistryPanel: React.FC<LandRegistryPanelProps> = ({
  landEntries,
  onAddLandEntry,
  onDeleteLandEntry,
  conflicts,
  onFocusParcel,
  onFocusConflict,
  isMapClickMode,
  onToggleMapClickMode,
  mapClickedPoints,
  onClearMapClickedPoints
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'list' | 'conflicts'>('register');

  // Form states
  const [surveyNumber, setSurveyNumber] = useState('Khasra No. 104/3');
  const [ownerName, setOwnerName] = useState('Rajinder Singh Brar');
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [landType, setLandType] = useState<LandType>('agricultural');
  const [coordsInput, setCoordsInput] = useState(
    '30.9080, 75.8560\n30.9120, 75.8575\n30.9110, 75.8630\n30.9070, 75.8615'
  );
  const [color, setColor] = useState('#10b981');
  const [notes, setNotes] = useState('Registered with Punjab Revenue Department. Canal-fed agricultural parcel.');

  const [inputMode, setInputMode] = useState<'text' | 'map' | 'template'>('text');
  const [coordError, setCoordError] = useState<string | null>(null);
  const [parsedPoints, setParsedPoints] = useState<[number, number][]>([]);
  const [candidateWarning, setCandidateWarning] = useState<string | null>(null);

  // Sync mapClickedPoints into coordsInput when in map click mode
  useEffect(() => {
    if (inputMode === 'map' && mapClickedPoints.length > 0) {
      const text = mapClickedPoints
        .map(([lat, lng]) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        .join('\n');
      setCoordsInput(text);
    }
  }, [mapClickedPoints, inputMode]);

  // Real-time coordinate parsing and validation
  useEffect(() => {
    const res = parseCoordinatesInput(coordsInput);
    if (!res.valid) {
      setCoordError(res.error || 'Invalid coordinates');
      setParsedPoints([]);
      setCandidateWarning(null);
    } else {
      setCoordError(null);
      setParsedPoints(res.points);

      // Check for real-time overlap against registered parcels
      const overlapCheck = checkCandidateOverlap(res.points, landEntries);
      if (overlapCheck.hasConflict) {
        setCandidateWarning(overlapCheck.warningMessage || 'Boundary overlap detected!');
      } else {
        setCandidateWarning(null);
      }
    }
  }, [coordsInput, landEntries]);

  // Calculate live area
  const liveArea = calculatePolygonArea(parsedPoints);

  const handleApplyTemplate = (tpl: typeof SAMPLE_INDIAN_TEMPLATES[0]) => {
    setState(tpl.state);
    setDistrict(tpl.district);
    setLandType(tpl.landType);
    setCoordsInput(tpl.coordsText);
    setNotes(tpl.description);
    setSurveyNumber(`Plot-${Math.floor(Math.random() * 900 + 100)} (${tpl.state})`);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedPoints.length < 3) {
      setCoordError('At least 3 valid coordinates required.');
      return;
    }

    const newEntry: LandEntry = {
      id: `parcel-${Date.now()}`,
      surveyNumber: surveyNumber.trim() || `Khasra No. ${Date.now().toString().slice(-4)}`,
      ownerName: ownerName.trim() || 'Undisclosed Landholder',
      state,
      district: district.trim() || 'General',
      landType,
      coordinates: parsedPoints,
      areaHectares: liveArea.hectares,
      areaAcres: liveArea.acres,
      areaSqMeters: liveArea.sqMeters,
      registeredAt: new Date().toISOString().split('T')[0],
      color,
      notes: notes.trim()
    };

    onAddLandEntry(newEntry);
    onClearMapClickedPoints();

    // Reset form with new default
    setSurveyNumber(`Khasra No. ${Math.floor(Math.random() * 800 + 100)}/${Math.floor(Math.random() * 5 + 1)}`);
    setActiveTab('list');
  };

  // Set of parcel IDs that have conflicts
  const conflictingParcelIds = new Set<string>();
  conflicts.forEach(c => {
    conflictingParcelIds.add(c.parcelId1);
    conflictingParcelIds.add(c.parcelId2);
  });

  return (
    <aside className="w-84 md:w-96 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20 shrink-0 select-none overflow-hidden">
      {/* 1. Header with Status Badge */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md">
              <FileSpreadsheet className="w-4 h-4 font-bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>🇮🇳 Indian Land Cadastre</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono -mt-0.5">
                Bhuvan & Revenue Boundary System
              </p>
            </div>
          </div>

          {/* Overlap Status Badge */}
          {conflicts.length > 0 ? (
            <button
              onClick={() => setActiveTab('conflicts')}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold animate-pulse"
              title="Click to inspect boundary intersection warnings"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>{conflicts.length} Overlap{conflicts.length > 1 ? 's' : ''}</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>All Clear</span>
            </span>
          )}
        </div>

        {/* Global Warning Banner if collisions exist */}
        {conflicts.length > 0 && (
          <div className="mt-2.5 p-2 rounded-md bg-rose-950/60 border border-rose-500/50 flex items-start gap-2 text-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-rose-300">Warning: Boundary Collision!</span>
              <p className="text-rose-300/80 text-[10px] mt-0.5">
                {conflicts.length} registered land parcel(s) intersect each other. Red warning highlights are active on the map.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 mt-3 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-medium">
          <button
            onClick={() => setActiveTab('register')}
            className={`py-1.5 rounded-md transition flex items-center justify-center gap-1 ${
              activeTab === 'register'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`py-1.5 rounded-md transition flex items-center justify-center gap-1 ${
              activeTab === 'list'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Plots ({landEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('conflicts')}
            className={`py-1.5 rounded-md transition flex items-center justify-center gap-1 ${
              activeTab === 'conflicts'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 shadow-xs'
                : conflicts.length > 0 ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Warnings ({conflicts.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {/* TAB 1: REGISTER LAND ENTRY */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Survey & Owner identification */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Survey / Khasra No. *
                </label>
                <input
                  type="text"
                  required
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  placeholder="e.g. Khasra 104/1"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Owner / Landholder *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>

            {/* Indian State & District */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Indian State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  District / Tehsil *
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Ludhiana, Pune"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>

            {/* Land Classification & Color */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Land Use Category
                </label>
                <select
                  value={landType}
                  onChange={(e) => setLandType(e.target.value as LandType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 capitalize text-xs"
                >
                  <option value="agricultural">🌾 Agricultural</option>
                  <option value="commercial">🏢 Commercial / IT</option>
                  <option value="residential">🏡 Residential Plot</option>
                  <option value="industrial">🏭 Industrial / Solar</option>
                  <option value="forest">🌲 Forest / Reserve</option>
                  <option value="government">🏛️ Public / Government</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Cadastral Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-7 bg-transparent cursor-pointer rounded border border-slate-700 p-0"
                  />
                  <span className="font-mono text-[11px] text-slate-400">{color}</span>
                </div>
              </div>
            </div>

            {/* Coordinate Input Mode Switcher */}
            <div className="border border-slate-800 rounded-lg p-2.5 bg-slate-950/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-mono text-amber-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Boundary Coordinates (Lat, Lng)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className={`px-2 py-0.5 text-[10px] rounded transition ${
                      inputMode === 'text'
                        ? 'bg-amber-500/20 text-amber-300 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Paste Text
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('map');
                      if (!isMapClickMode) onToggleMapClickMode();
                    }}
                    className={`px-2 py-0.5 text-[10px] rounded transition flex items-center gap-1 ${
                      inputMode === 'map'
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    Map Clicker
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('template')}
                    className={`px-2 py-0.5 text-[10px] rounded transition ${
                      inputMode === 'template'
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Samples
                  </button>
                </div>
              </div>

              {/* MODE A: Interactive Map Clicker Helper */}
              {inputMode === 'map' && (
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-emerald-200">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Map Coordinate Picker Active
                    </span>
                    <span className="font-mono text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300">
                      {mapClickedPoints.length} Point(s) Added
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    👉 Click directly on the Indian map to plot each perimeter vertex of this land plot.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClearMapClickedPoints}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition"
                    >
                      Clear Clicked Points
                    </button>
                    <button
                      type="button"
                      onClick={onToggleMapClickMode}
                      className="px-2 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-[10px] font-medium transition"
                    >
                      {isMapClickMode ? 'Done Picking' : 'Resume Picking'}
                    </button>
                  </div>
                </div>
              )}

              {/* MODE B: Template Presets */}
              {inputMode === 'template' && (
                <div className="space-y-1.5 p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    Quick-Load Sample Indian Cadastral Parcels:
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {SAMPLE_INDIAN_TEMPLATES.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className="w-full text-left p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] flex items-center justify-between group transition"
                      >
                        <span className="font-medium text-slate-300 group-hover:text-amber-300 truncate">
                          {tpl.name}
                        </span>
                        <span className="text-slate-500 font-mono text-[9px] shrink-0 ml-1">
                          {tpl.state}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Textarea for Coordinates */}
              <div>
                <textarea
                  rows={4}
                  value={coordsInput}
                  onChange={(e) => setCoordsInput(e.target.value)}
                  placeholder={`Enter Latitude, Longitude pairs per line:\n30.9020, 75.8540\n30.9065, 75.8550\n30.9055, 75.8610\n30.9010, 75.8595`}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>Format: <code>Lat, Lng</code> (1 vertex per line)</span>
                  <span>{parsedPoints.length} valid vertices</span>
                </div>
              </div>

              {/* Error Message */}
              {coordError && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[10px]">
                  {coordError}
                </div>
              )}

              {/* REAL-TIME OVERLAP WARNING BANNER */}
              {candidateWarning && (
                <div className="p-2.5 rounded bg-rose-950/80 border border-rose-500 text-rose-200 space-y-1 animate-pulse">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300 text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>⚠️ LAND INTERSECTION WARNING!</span>
                  </div>
                  <p className="text-[10px] text-rose-200/90 leading-tight">
                    {candidateWarning}
                  </p>
                  <p className="text-[9px] text-rose-300/80 italic font-mono">
                    Cadastral rule violation: Overlapping with an already registered parcel.
                  </p>
                </div>
              )}

              {/* Calculated Area Preview */}
              {parsedPoints.length >= 3 && !coordError && (
                <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-2 rounded border border-slate-800 font-mono text-[10px]">
                  <div className="text-center">
                    <span className="text-slate-500 block text-[9px]">Hectares</span>
                    <span className="text-amber-400 font-bold">{liveArea.hectares} ha</span>
                  </div>
                  <div className="text-center border-x border-slate-800">
                    <span className="text-slate-500 block text-[9px]">Acres</span>
                    <span className="text-cyan-400 font-bold">{liveArea.acres} ac</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-500 block text-[9px]">Area (m²)</span>
                    <span className="text-slate-300 font-semibold">{liveArea.sqMeters.toLocaleString()} m²</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes / Remarks */}
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Cadastral Notes / Revenue Reference
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Registration remarks, deed numbers, crop details..."
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            {/* Submit Registration Button */}
            <button
              type="submit"
              disabled={parsedPoints.length < 3 || !!coordError}
              className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition ${
                parsedPoints.length >= 3 && !coordError
                  ? candidateWarning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                {candidateWarning 
                  ? 'Register Parcel (With Overlap Warning)' 
                  : 'Register Land Entry'}
              </span>
            </button>
          </form>
        )}

        {/* TAB 2: REGISTERED PLOTS LIST */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800 font-mono">
              <span>Total Plots: <b>{landEntries.length}</b></span>
              <span>
                {conflicts.length > 0 ? (
                  <span className="text-rose-400 font-bold">{conflicts.length} Overlapping</span>
                ) : (
                  <span className="text-emerald-400">All Clean</span>
                )}
              </span>
            </div>

            {landEntries.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-600" />
                <p>No land entries registered yet.</p>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-400 text-xs font-semibold"
                >
                  Register First Parcel
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {landEntries.map((parcel) => {
                  const hasOverlap = conflictingParcelIds.has(parcel.id);
                  return (
                    <div
                      key={parcel.id}
                      className={`p-3 rounded-lg border transition ${
                        hasOverlap
                          ? 'bg-rose-950/30 border-rose-500/60 shadow-md shadow-rose-950/20'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                            style={{ backgroundColor: parcel.color }}
                          />
                          <div>
                            <span className="font-bold text-slate-200 text-xs block font-mono">
                              {parcel.surveyNumber}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {parcel.ownerName}
                            </span>
                          </div>
                        </div>

                        {/* Overlap Warning Tag */}
                        {hasOverlap ? (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold flex items-center gap-1 shrink-0 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                            Overlap Warning
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-medium shrink-0">
                            Clear
                          </span>
                        )}
                      </div>

                      {/* Details row */}
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                        <div>
                          <span className="text-slate-500 block text-[9px]">Location</span>
                          <span className="text-slate-300">{parcel.district}, {parcel.state}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">Calculated Area</span>
                          <span className="text-amber-300 font-semibold">{parcel.areaHectares} ha ({parcel.areaAcres} ac)</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-800/50">
                        <span className="text-[9px] text-slate-500 uppercase font-mono">
                          {parcel.landType} &bull; {parcel.coordinates.length} pts
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onFocusParcel(parcel)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium flex items-center gap-1 transition"
                            title="Center map on parcel"
                          >
                            <Compass className="w-3 h-3 text-amber-400" />
                            <span>Locate</span>
                          </button>
                          <button
                            onClick={() => onDeleteLandEntry(parcel.id)}
                            className="p-1 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                            title="Delete this land entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OVERLAP CONFLICTS DETAIL */}
        {activeTab === 'conflicts' && (
          <div className="space-y-3">
            {conflicts.length === 0 ? (
              <div className="p-6 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                <h3 className="font-bold text-emerald-300 text-sm">No Land Boundary Collisions!</h3>
                <p className="text-slate-400 text-xs">
                  All registered land parcels have independent, non-overlapping perimeters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 rounded bg-rose-950/50 border border-rose-500/60 text-rose-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300 text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Cadastral Boundary Collision Alert ({conflicts.length})</span>
                  </div>
                  <p className="text-[11px] text-rose-300/90 leading-tight">
                    The following land parcels possess intersecting perimeters or overlapping areas under the Survey of India cadastral grid.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {conflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="p-3 rounded-lg bg-slate-950 border border-rose-500/70 shadow-lg space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-bold text-rose-400 font-mono text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                          Conflict #{conflict.id.slice(-4)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold uppercase font-mono">
                          {conflict.overlapSeverity} severity
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-amber-300">{conflict.surveyNumber1}</span>
                            <span className="text-slate-400 block text-[10px]">{conflict.owner1}</span>
                          </div>
                          <span className="text-slate-500 text-[10px] font-mono">Parcel 1</span>
                        </div>

                        <div className="text-center font-bold text-rose-400 text-[10px]">
                          ⚡ OVERLAPS WITH ⚡
                        </div>

                        <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-cyan-300">{conflict.surveyNumber2}</span>
                            <span className="text-slate-400 block text-[10px]">{conflict.owner2}</span>
                          </div>
                          <span className="text-slate-500 text-[10px] font-mono">Parcel 2</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-300 leading-snug">
                        {conflict.description}
                      </p>

                      <button
                        onClick={() => onFocusConflict(conflict)}
                        className="w-full py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Inspect Overlap On Map</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Footer with Survey of India / ISRO Bhuvan Notice */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>WGS-84 / EPSG:4326</span>
        </span>
        <span className="text-slate-500">ISRO Bhuvan / OSM Cadastre</span>
      </div>
    </aside>
  );
};
