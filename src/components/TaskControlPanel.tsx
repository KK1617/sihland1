import React from 'react';
import { 
  Crosshair, 
  Scissors, 
  Layers, 
  Sparkles, 
  History, 
  Trees, 
  Play, 
  Sliders, 
  Cpu, 
  HardDrive, 
  CheckCircle2, 
  Terminal,
  Zap
} from 'lucide-react';
import { GeoTask, GeoModel, GeoPreset, InferenceResult } from '../types';

interface TaskControlPanelProps {
  activeTask: GeoTask;
  onSelectTask: (task: GeoTask) => void;
  models: GeoModel[];
  selectedModelId: string;
  onSelectModelId: (modelId: string) => void;
  confidenceThreshold: number;
  onChangeConfidence: (val: number) => void;
  chipSize: number;
  onChangeChipSize: (size: number) => void;
  preset: GeoPreset;
  isLoading: boolean;
  onRunInference: () => void;
  result: InferenceResult | null;
  onOpenCodeModal: () => void;
}

const TASK_TABS: { id: GeoTask; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'detection', label: 'Object Detection', icon: Crosshair },
  { id: 'segmentation', label: 'Segmentation', icon: Scissors },
  { id: 'landcover', label: 'Land Cover', icon: Layers },
  { id: 'foundation', label: 'Foundation Model', icon: Sparkles },
  { id: 'change_detection', label: 'Change Detect', icon: History },
  { id: 'canopy', label: 'Canopy Height', icon: Trees },
];

export const TaskControlPanel: React.FC<TaskControlPanelProps> = ({
  activeTask,
  onSelectTask,
  models,
  selectedModelId,
  onSelectModelId,
  confidenceThreshold,
  onChangeConfidence,
  chipSize,
  onChangeChipSize,
  preset,
  isLoading,
  onRunInference,
  result,
  onOpenCodeModal
}) => {
  // Filter models applicable to task or general
  const filteredModels = models.filter(m => m.category === activeTask || activeTask === 'foundation');
  const activeModel = models.find(m => m.id === selectedModelId) || filteredModels[0] || models[0];

  return (
    <aside className="w-80 md:w-96 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20 shrink-0 select-none overflow-hidden">
      {/* Task Tabs Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40">
        <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-2">
          Select Geospatial Task
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {TASK_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTask === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTask(tab.id);
                  const matching = models.find(m => m.category === tab.id);
                  if (matching) onSelectModelId(matching.id);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                  isActive
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold shadow-xs'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-[10px] leading-tight truncate w-full">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Configuration Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Model Selector Card */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              GeoAI Model Backbone
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300">
              {activeModel?.parameterCount || '32M'}
            </span>
          </div>

          <select
            value={selectedModelId}
            onChange={(e) => onSelectModelId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
          >
            {filteredModels.length > 0 ? (
              filteredModels.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.weightsSize})
                </option>
              ))
            ) : (
              models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.weightsSize})
                </option>
              ))
            )}
          </select>

          {activeModel && (
            <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2 rounded-md border border-slate-800 font-sans">
              {activeModel.description}
            </div>
          )}
        </div>

        {/* Inference Hyperparameters */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            Tiling & Detection Parameters
          </div>

          {/* Confidence Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Confidence Threshold</span>
              <span className="font-mono text-emerald-400 font-semibold">{Math.round(confidenceThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => onChangeConfidence(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Chip Size Buttons */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Tiling Chip Window</span>
              <span className="font-mono text-sky-400 font-semibold">{chipSize}&times;{chipSize} px</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[256, 512, 1024].map((size) => (
                <button
                  key={size}
                  onClick={() => onChangeChipSize(size)}
                  className={`py-1 rounded text-[11px] font-mono font-medium border transition ${
                    chipSize === size
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size} px
                </button>
              ))}
            </div>
          </div>

          {/* Device & Hardware */}
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Compute Target
            </span>
            <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px] font-semibold">
              PyTorch CUDA / WebAssembly
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          id="btn-run-inference"
          onClick={onRunInference}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition transform active:scale-98 ${
            isLoading
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
              <span>Processing Raster Chips...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run GeoAI Inference Pipeline</span>
            </>
          )}
        </button>

        {/* Active Analysis Metrics Card */}
        {result && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Pipeline Metrics
              </span>
              <button
                onClick={onOpenCodeModal}
                className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                title="View Python implementation"
              >
                <Terminal className="w-3 h-3" />
                <span>View Python</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {result.summary}
            </p>

            {/* Metric pill cards */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              {result.metrics.mIoU !== undefined && (
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">Mean IoU</div>
                  <div className="text-emerald-400 font-bold">{(result.metrics.mIoU * 100).toFixed(1)}%</div>
                </div>
              )}
              {result.metrics.f1Score !== undefined && (
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">F1 Score</div>
                  <div className="text-sky-400 font-bold">{(result.metrics.f1Score * 100).toFixed(1)}%</div>
                </div>
              )}
              {result.metrics.detectedCount !== undefined && (
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">Features Found</div>
                  <div className="text-amber-400 font-bold">{result.metrics.detectedCount} objects</div>
                </div>
              )}
              {result.metrics.meanCanopyHeightMeters !== undefined && (
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">Mean Canopy</div>
                  <div className="text-emerald-400 font-bold">{result.metrics.meanCanopyHeightMeters} meters</div>
                </div>
              )}
              <div className="bg-slate-900 p-2 rounded border border-slate-800 col-span-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Execution Latency</span>
                <span className="text-slate-300 font-bold">{result.executionTimeMs} ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AOI Details Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Raster Resolution:</span>
          <span className="text-slate-200 font-mono font-medium">{preset.resolution}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[11px] mt-0.5">
          <span>Acquisition Date:</span>
          <span className="text-slate-200 font-mono">{preset.acquisitionDate}</span>
        </div>
      </div>
    </aside>
  );
};
