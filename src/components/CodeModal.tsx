import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, Play, FileCode, CheckCircle2 } from 'lucide-react';
import { GeoPreset, GeoTask } from '../types';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pythonCode: string;
  preset: GeoPreset;
  activeTask: GeoTask;
  selectedModelId: string;
}

export const CodeModal: React.FC<CodeModalProps> = ({
  isOpen,
  onClose,
  pythonCode,
  preset,
  activeTask,
  selectedModelId
}) => {
  const [activeTab, setActiveTab] = useState<'python' | 'cli' | 'install'>('python');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cliCommand = `geoai ${activeTask === 'detection' ? 'detect' : activeTask === 'segmentation' ? 'segment' : 'classify'} \\
  --input "s3://sentinel-s2-l2a/${preset.id}.tif" \\
  --model "${selectedModelId}" \\
  --bbox ${preset.bounds[0][1].toFixed(4)} ${preset.bounds[0][0].toFixed(4)} ${preset.bounds[1][1].toFixed(4)} ${preset.bounds[1][0].toFixed(4)} \\
  --output "./outputs/${preset.id}_result.geojson" \\
  --device cuda`;

  const installInstructions = `# Install GeoAI and required deep learning backends
pip install geoai-py

# Optional: with GPU acceleration (PyTorch + CUDA 12)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# Optional dependencies for QGIS & interactive map
pip install leafmap maplibre py-maplibregl

# Verify installation
python -c "import geoai; print('GeoAI Version:', geoai.__version__); print('GPU available:', geoai.is_gpu_available())"`;

  const getActiveCode = () => {
    if (activeTab === 'python') return pythonCode;
    if (activeTab === 'cli') return cliCommand;
    return installInstructions;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'python' ? 'geoai_pipeline.py' : activeTab === 'cli' ? 'run_geoai.sh' : 'install.sh';
    const blob = new Blob([getActiveCode()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Reproducible Python Workflow
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  opengeos/geoai
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Executable script parameterized for {preset.name}
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

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950/40 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'python'
                  ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Python Script (.py)
            </button>
            <button
              onClick={() => setActiveTab('cli')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'cli'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GeoAI CLI (.sh)
            </button>
            <button
              onClick={() => setActiveTab('install')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'install'
                  ? 'bg-slate-800 text-sky-400 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Setup & Pip Install
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 text-xs font-mono">
          <pre className="text-slate-200 leading-relaxed overflow-x-auto">
            <code>{getActiveCode()}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Compatible with GeoAI v0.4+, PyTorch 2.x, and Leafmap
          </span>
          <a
            href="https://book.opengeoai.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            Read Chapter in GeoAI Book &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
