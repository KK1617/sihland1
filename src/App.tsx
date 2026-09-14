import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MapViewer } from './components/MapViewer';
import { TaskControlPanel } from './components/TaskControlPanel';
import { LandRegistryPanel } from './components/LandRegistryPanel';
import { GeoAgentChat } from './components/GeoAgentChat';
import { CodeModal } from './components/CodeModal';
import { ModelZooModal } from './components/ModelZooModal';
import { ChipInspectorModal } from './components/ChipInspectorModal';
import { DownloadModal } from './components/DownloadModal';
import { GEO_PRESETS, GEO_MODELS, generateInferenceResult } from './data/geoData';
import { INITIAL_LAND_PARCELS } from './data/initialLandParcels';
import { detectAllCollisions } from './utils/geoMath';
import { GeoPreset, GeoModel, GeoTask, InferenceResult, LandEntry, OverlapConflict } from './types';

export default function App() {
  const [presets, setPresets] = useState<GeoPreset[]>(GEO_PRESETS);
  const [models, setModels] = useState<GeoModel[]>(GEO_MODELS);
  const [activePreset, setActivePreset] = useState<GeoPreset>(GEO_PRESETS[0]);
  const [activeTask, setActiveTask] = useState<GeoTask>(GEO_PRESETS[0].defaultTask);
  const [selectedModelId, setSelectedModelId] = useState<string>('rf-detr-satellite');

  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.50);
  const [chipSize, setChipSize] = useState<number>(512);

  const [result, setResult] = useState<InferenceResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNdvMode, setIsNdvMode] = useState<boolean>(false);

  // Workbench Mode: 'registry' (Indian Land Cadastre) or 'geoai' (Inference)
  const [workbenchMode, setWorkbenchMode] = useState<'geoai' | 'registry'>('registry');

  // Indian Land Registry state
  const [landEntries, setLandEntries] = useState<LandEntry[]>(INITIAL_LAND_PARCELS);
  const [conflicts, setConflicts] = useState<OverlapConflict[]>(() => detectAllCollisions(INITIAL_LAND_PARCELS));
  const [isMapClickMode, setIsMapClickMode] = useState<boolean>(false);
  const [mapClickedPoints, setMapClickedPoints] = useState<[number, number][]>([]);
  const [focusTarget, setFocusTarget] = useState<{ center: [number, number]; zoom: number } | null>(null);

  // Modals & Panels
  const [isAgentOpen, setIsAgentOpen] = useState<boolean>(false);
  const [isModelZooOpen, setIsModelZooOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isChipModalOpen, setIsChipModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  // Recalculate boundary conflicts whenever land entries change
  useEffect(() => {
    const detected = detectAllCollisions(landEntries);
    setConflicts(detected);
  }, [landEntries]);

  // Fetch presets and models on initial load
  useEffect(() => {
    async function loadData() {
      try {
        const [presetsRes, modelsRes] = await Promise.all([
          fetch('/api/geoai/presets'),
          fetch('/api/geoai/models')
        ]);
        if (presetsRes.ok) {
          const loadedPresets: GeoPreset[] = await presetsRes.json();
          if (loadedPresets.length > 0) setPresets(loadedPresets);
        }
        if (modelsRes.ok) {
          const loadedModels: GeoModel[] = await modelsRes.json();
          if (loadedModels.length > 0) setModels(loadedModels);
        }
      } catch {
        // Use default embedded datasets
      }
    }
    loadData();
  }, []);

  // Execute inference function
  const runInference = async (targetPreset = activePreset, targetTask = activeTask, targetModel = selectedModelId) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/geoai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetId: targetPreset.id,
          taskId: targetTask,
          modelId: targetModel
        })
      });

      if (response.ok) {
        const data: InferenceResult = await response.json();
        setResult(data);
      } else {
        const fallback = generateInferenceResult(targetPreset, targetTask, targetModel);
        setResult(fallback);
      }
    } catch {
      const fallback = generateInferenceResult(targetPreset, targetTask, targetModel);
      setResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial inference when preset changes
  useEffect(() => {
    const matchingModel = models.find(m => m.category === activePreset.defaultTask) || models[0];
    setActiveTask(activePreset.defaultTask);
    setSelectedModelId(matchingModel.id);
    runInference(activePreset, activePreset.defaultTask, matchingModel.id);
  }, [activePreset]);

  // Handle manual task change
  const handleSelectTask = (task: GeoTask) => {
    setActiveTask(task);
    const matchingModel = models.find(m => m.category === task) || models[0];
    setSelectedModelId(matchingModel.id);
    runInference(activePreset, task, matchingModel.id);
  };

  // Cadastral Handlers
  const handleAddLandEntry = (entry: LandEntry) => {
    const updated = [entry, ...landEntries];
    setLandEntries(updated);

    // Auto-focus map on newly registered parcel
    const centerLat = entry.coordinates.reduce((acc, p) => acc + p[0], 0) / entry.coordinates.length;
    const centerLng = entry.coordinates.reduce((acc, p) => acc + p[1], 0) / entry.coordinates.length;
    setFocusTarget({ center: [centerLat, centerLng], zoom: 15 });
  };

  const handleDeleteLandEntry = (id: string) => {
    setLandEntries(prev => prev.filter(p => p.id !== id));
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMapClickedPoints(prev => [...prev, [lat, lng]]);
  };

  const handleFocusParcel = (entry: LandEntry) => {
    const centerLat = entry.coordinates.reduce((acc, p) => acc + p[0], 0) / entry.coordinates.length;
    const centerLng = entry.coordinates.reduce((acc, p) => acc + p[1], 0) / entry.coordinates.length;
    setFocusTarget({ center: [centerLat, centerLng], zoom: 16 });
  };

  const handleFocusConflict = (conflict: OverlapConflict) => {
    const p1 = landEntries.find(p => p.id === conflict.parcelId1);
    const p2 = landEntries.find(p => p.id === conflict.parcelId2);
    if (p1 && p2) {
      const allPts = [...p1.coordinates, ...p2.coordinates];
      const centerLat = allPts.reduce((acc, p) => acc + p[0], 0) / allPts.length;
      const centerLng = allPts.reduce((acc, p) => acc + p[1], 0) / allPts.length;
      setFocusTarget({ center: [centerLat, centerLng], zoom: 16 });
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased">
      {/* 1. Header Bar with Mode Switcher & Overlap Alert Badge */}
      <Navbar
        presets={presets}
        activePreset={activePreset}
        onSelectPreset={(p) => setActivePreset(p)}
        onOpenModelZoo={() => setIsModelZooOpen(true)}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenChipModal={() => setIsChipModalOpen(true)}
        onOpenDownload={() => setIsDownloadModalOpen(true)}
        onToggleAgent={() => setIsAgentOpen(!isAgentOpen)}
        isAgentOpen={isAgentOpen}
        workbenchMode={workbenchMode}
        onSelectMode={setWorkbenchMode}
        conflictsCount={conflicts.length}
        parcelsCount={landEntries.length}
      />

      {/* 2. Main Workbench Workspace */}
      <main className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left: Either Indian Land Cadastre Panel or GeoAI Inference Panel */}
        {workbenchMode === 'registry' ? (
          <LandRegistryPanel
            landEntries={landEntries}
            onAddLandEntry={handleAddLandEntry}
            onDeleteLandEntry={handleDeleteLandEntry}
            conflicts={conflicts}
            onFocusParcel={handleFocusParcel}
            onFocusConflict={handleFocusConflict}
            isMapClickMode={isMapClickMode}
            onToggleMapClickMode={() => setIsMapClickMode(!isMapClickMode)}
            mapClickedPoints={mapClickedPoints}
            onClearMapClickedPoints={() => setMapClickedPoints([])}
          />
        ) : (
          <TaskControlPanel
            activeTask={activeTask}
            onSelectTask={handleSelectTask}
            models={models}
            selectedModelId={selectedModelId}
            onSelectModelId={(id) => {
              setSelectedModelId(id);
              runInference(activePreset, activeTask, id);
            }}
            confidenceThreshold={confidenceThreshold}
            onChangeConfidence={setConfidenceThreshold}
            chipSize={chipSize}
            onChangeChipSize={setChipSize}
            preset={activePreset}
            isLoading={isLoading}
            onRunInference={() => runInference(activePreset, activeTask, selectedModelId)}
            result={result}
            onOpenCodeModal={() => setIsCodeModalOpen(true)}
          />
        )}

        {/* Center: Full Interactive Leaflet Satellite & Cadastre Map */}
        <div className="flex-1 h-full relative">
          <MapViewer
            preset={activePreset}
            result={result}
            isLoading={isLoading}
            isNdvMode={isNdvMode}
            onToggleNdvi={() => setIsNdvMode(!isNdvMode)}
            landEntries={landEntries}
            conflicts={conflicts}
            isMapClickMode={isMapClickMode}
            mapClickedPoints={mapClickedPoints}
            onMapClick={handleMapClick}
            focusTarget={focusTarget}
          />
        </div>

        {/* Right: Collapsible GeoAI Multimodal Reasoning Agent Drawer */}
        <GeoAgentChat
          isOpen={isAgentOpen}
          onClose={() => setIsAgentOpen(false)}
          preset={activePreset}
          activeTask={activeTask}
          result={result}
        />
      </main>

      {/* 3. Popups & Utility Modals */}
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        pythonCode={result?.pythonCode || ''}
        preset={activePreset}
        activeTask={activeTask}
        selectedModelId={selectedModelId}
      />

      <ModelZooModal
        isOpen={isModelZooOpen}
        onClose={() => setIsModelZooOpen(false)}
        models={models}
        selectedModelId={selectedModelId}
        onSelectModel={(id) => {
          setSelectedModelId(id);
          const model = models.find(m => m.id === id);
          if (model) {
            setActiveTask(model.category);
            runInference(activePreset, model.category, id);
          }
        }}
      />

      <ChipInspectorModal
        isOpen={isChipModalOpen}
        onClose={() => setIsChipModalOpen(false)}
        preset={activePreset}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
