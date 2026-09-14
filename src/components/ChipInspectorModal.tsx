import React, { useState } from 'react';
import { X, Layers, Download, Check, Sliders, BarChart3, Image as ImageIcon, Sparkles } from 'lucide-react';
import { GeoPreset } from '../types';

interface ChipInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: GeoPreset;
}

type BandComposite = 'rgb' | 'cir' | 'agri' | 'swir';

export const ChipInspectorModal: React.FC<ChipInspectorModalProps> = ({
  isOpen,
  onClose,
  preset
}) => {
  const [composite, setComposite] = useState<BandComposite>('cir');
  const [chipSize, setChipSize] = useState<number>(512);
  const [overlapStride, setOverlapStride] = useState<number>(64);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const getCompositeDetails = (c: BandComposite) => {
    switch (c) {
      case 'rgb':
        return {
          name: 'True Color (B04 - B03 - B02)',
          description: 'Natural human vision simulation matching aerial photography.',
          previewStyle: 'brightness-100 contrast-105',
          channels: ['Red (665 nm)', 'Green (560 nm)', 'Blue (490 nm)']
        };
      case 'cir':
        return {
          name: 'Color Infrared CIR (B08 - B04 - B03)',
          description: 'High reflectance in NIR highlights healthy vegetation in vivid red/magenta tones.',
          previewStyle: 'hue-rotate-[290deg] saturate-200 contrast-125',
          channels: ['NIR (842 nm)', 'Red (665 nm)', 'Green (560 nm)']
        };
      case 'agri':
        return {
          name: 'Agriculture & Moisture (B08 - B11 - B02)',
          description: 'Highlights crop vitality, moisture content, and bare tilled soil differentiation.',
          previewStyle: 'hue-rotate-[130deg] saturate-175 contrast-115',
          channels: ['NIR (842 nm)', 'SWIR-1 (1610 nm)', 'Blue (490 nm)']
        };
      case 'swir':
        return {
          name: 'Geology & Mineral SWIR (B12 - B11 - B04)',
          description: 'Penetrates atmospheric haze and distinguishes rock types and mineral deposits.',
          previewStyle: 'hue-rotate-[200deg] saturate-150 contrast-130',
          channels: ['SWIR-2 (2190 nm)', 'SWIR-1 (1610 nm)', 'Red (665 nm)']
        };
    }
  };

  const details = getCompositeDetails(composite);

  const handleExportChips = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Generate mock chip download
      const content = `"""
GeoAI Chip Preparation Script
AOI: ${preset.name}
Chip Size: ${chipSize}x${chipSize}
Stride: ${overlapStride}
Composite: ${composite}
"""
import geoai

geoai.create_image_chips(
    image="data/${preset.id}.tif",
    output_dir="./chips/${preset.id}",
    chip_size=${chipSize},
    stride=${overlapStride},
    bands=["B02", "B03", "B04", "B08"],
    drop_empty=True
)
print("Extracted chips successfully.")`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geoai_chips_${preset.id}.py`;
      a.click();
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Multi-Spectral Image Chip Inspector
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Sentinel-2 L2A / NAIP
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Inspect spectral band composites and generate training chips for deep learning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
          {/* Band Combination Tabs */}
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1.5">
              Spectral Band Combination (RGB Mapping)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['rgb', 'cir', 'agri', 'swir'] as BandComposite[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setComposite(c)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    composite === c
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-mono uppercase">{c}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {c === 'rgb' ? 'Natural Color' : c === 'cir' ? 'Color Infrared' : c === 'agri' ? 'Agriculture' : 'SWIR Geology'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Chip Preview & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visual Chip Representation */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[280px] rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center shadow-inner">
                {/* Simulated high-altitude satellite raster patch */}
                <div 
                  className={`w-full h-full bg-gradient-to-tr from-slate-900 via-teal-950 to-emerald-900 transition-all duration-300 flex items-center justify-center p-4 relative ${details.previewStyle}`}
                  style={{
                    backgroundImage: `radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.4), transparent 50%),
                                      radial-gradient(circle at 70% 60%, rgba(56, 189, 248, 0.3), transparent 60%)`
                  }}
                >
                  {/* Grid Lines simulating chip sub-window */}
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 border border-cyan-400/20 pointer-events-none">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="border border-cyan-400/10" />
                    ))}
                  </div>
                  <div className="z-10 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded border border-slate-700 text-center">
                    <div className="text-[10px] font-mono text-cyan-400 font-bold">{chipSize}&times;{chipSize} px</div>
                    <div className="text-[9px] text-slate-300 font-mono">Bands: {details.channels.join(' - ')}</div>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-2">
                Raster Patch: {preset.name} (10m GSD)
              </span>
            </div>

            {/* Composite Description & Channels */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {details.name}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {details.description}
                </p>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">Assigned Channels:</div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-red-400 font-bold">R:</span> {details.channels[0]}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-emerald-400 font-bold">G:</span> {details.channels[1]}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-sky-400 font-bold">B:</span> {details.channels[2]}
                  </div>
                </div>
              </div>

              {/* Tiling Parameters for Dataset Preparation */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2.5">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Dataset Preparation Options
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Chip Window</label>
                    <select
                      value={chipSize}
                      onChange={(e) => setChipSize(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-200 mt-1 font-mono"
                    >
                      <option value={256}>256 &times; 256 px</option>
                      <option value={512}>512 &times; 512 px</option>
                      <option value={1024}>1024 &times; 1024 px</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Stride Overlap</label>
                    <select
                      value={overlapStride}
                      onChange={(e) => setOverlapStride(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-200 mt-1 font-mono"
                    >
                      <option value={32}>32 px (Heavy overlap)</option>
                      <option value={64}>64 px (Balanced)</option>
                      <option value={128}>128 px (Fast)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px] font-mono">
            Supported formats: GeoTIFF, Cloud-Optimized GeoTIFF (COG), Zarr
          </span>

          <button
            onClick={handleExportChips}
            disabled={downloading}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded-lg shadow-md transition"
          >
            {downloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Chip Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
