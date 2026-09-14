import React from 'react';
import { 
  Globe2, 
  Layers, 
  Code2, 
  Bot, 
  BookOpen, 
  ExternalLink, 
  Cpu, 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  Download,
  FileSpreadsheet,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { GeoPreset } from '../types';

interface NavbarProps {
  presets: GeoPreset[];
  activePreset: GeoPreset;
  onSelectPreset: (preset: GeoPreset) => void;
  onOpenModelZoo: () => void;
  onOpenCodeModal: () => void;
  onOpenChipModal: () => void;
  onOpenDownload: () => void;
  onToggleAgent: () => void;
  isAgentOpen: boolean;
  workbenchMode: 'geoai' | 'registry';
  onSelectMode: (mode: 'geoai' | 'registry') => void;
  conflictsCount: number;
  parcelsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  presets,
  activePreset,
  onSelectPreset,
  onOpenModelZoo,
  onOpenCodeModal,
  onOpenChipModal,
  onOpenDownload,
  onToggleAgent,
  isAgentOpen,
  workbenchMode,
  onSelectMode,
  conflictsCount,
  parcelsCount
}) => {
  return (
    <header className="h-14 bg-slate-900/95 border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none backdrop-blur-md">
      {/* Brand & Repository */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-orange-600 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Globe2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1">
                Geo<span className="text-emerald-400">AI</span> Studio
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/40">
                🇮🇳 India Edition
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
              Cadastral Coordinate Registry & Earth Observation
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden md:block" />

        {/* Preset Location Switcher */}
        <div className="relative group hidden lg:block">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
            Active Region / AOI
          </label>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-emerald-400 cursor-pointer transition-colors">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={activePreset.id}
              onChange={(e) => {
                const found = presets.find(p => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-slate-800/90 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-500 font-medium cursor-pointer max-w-[220px] truncate"
            >
              {presets.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Center: Top Mode Switcher (Indian Land Cadastre vs GeoAI Inference) */}
      <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 shadow-inner">
        <button
          onClick={() => onSelectMode('registry')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition ${
            workbenchMode === 'registry'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>🇮🇳 Land Cadastre</span>
          {conflictsCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-extrabold animate-pulse">
              ⚠️ {conflictsCount} Overlap!
            </span>
          ) : (
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
              workbenchMode === 'registry' ? 'bg-slate-950/40 text-slate-900' : 'bg-slate-800 text-slate-300'
            }`}>
              {parcelsCount} Plots
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectMode('geoai')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
            workbenchMode === 'geoai'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>GeoAI Models</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          id="btn-model-zoo"
          onClick={onOpenModelZoo}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition"
          title="Open GeoAI Model Zoo (Prithvi, SAM, RF-DETR)"
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Model Zoo</span>
        </button>

        <button
          id="btn-code-export"
          onClick={onOpenCodeModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition font-mono"
          title="Export Reproducible Python Script"
        >
          <Code2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Python API</span>
        </button>

        <button
          id="btn-download-laptop"
          onClick={onOpenDownload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/40 transition"
          title="Download complete project source"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold hidden sm:inline">Download</span>
        </button>

        <button
          id="btn-toggle-agent"
          onClick={onToggleAgent}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            isAgentOpen 
              ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
          }`}
          title="Toggle Multimodal GeoAgent Assistant"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">GeoAgent</span>
        </button>
      </div>
    </header>
  );
};
