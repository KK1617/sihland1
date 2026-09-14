import React from 'react';
import { X, Cpu, ExternalLink, HardDrive, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { GeoModel } from '../types';

interface ModelZooModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: GeoModel[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
}

export const ModelZooModal: React.FC<ModelZooModalProps> = ({
  isOpen,
  onClose,
  models,
  selectedModelId,
  onSelectModel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                GeoAI Model Zoo & Foundation Models
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Hugging Face & PyTorch
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Pre-trained geospatial foundation models and task-specific backbones in the GeoAI ecosystem
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

        {/* Model Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/50">
          {models.map((model) => {
            const isSelected = model.id === selectedModelId;
            return (
              <div
                key={model.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-white">{model.name}</h3>
                      <div className="text-[10px] text-emerald-400 font-mono">{model.framework}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {model.parameterCount}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {model.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {model.supportedBackbones.map((bb, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700"
                      >
                        {bb}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {model.weightsSize}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-slate-500" />
                      {model.license}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {model.huggingfaceUrl && (
                      <a
                        href={model.huggingfaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                        title="View on Hugging Face"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        onSelectModel(model.id);
                        onClose();
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-semibold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <span>Select</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Official GeoAI documentation: <b>opengeoai.org</b></span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
