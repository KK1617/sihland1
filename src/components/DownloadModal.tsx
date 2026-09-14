import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Check, 
  Copy, 
  Terminal, 
  Laptop, 
  FolderArchive, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  GitBranch
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/download-zip');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'geoai-studio.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const quickStartCode = `# 1. Unzip the downloaded file
unzip geoai-studio.zip -d geoai-studio
cd geoai-studio

# 2. Install dependencies
npm install

# 3. (Optional) Set your Gemini API key
cp .env.example .env
# edit .env with your key if desired

# 4. Start the development server
npm run dev

# Open in your browser: http://localhost:3000`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Download to Your Laptop
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Full Source Code
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Run GeoAI Studio locally on your computer with Node.js and Python
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
          {/* Method 1: Instant ZIP Download Button */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <FolderArchive className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Direct ZIP Download</h3>
              </div>
              <p className="text-xs text-slate-300">
                Includes all React frontend, Express API server, Leaflet mapping components, GeoAI presets, and scripts.
              </p>
            </div>

            <button
              id="btn-download-zip-action"
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shrink-0 shadow-lg ${
                isDownloading
                  ? 'bg-emerald-600/60 text-slate-950 cursor-wait'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 hover:scale-102 active:scale-98'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Preparing ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download .ZIP</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Start Commands */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                How to Run on Your Laptop
              </span>
              <button
                onClick={() => handleCopy(quickStartCode, 'local-run')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition"
              >
                {copiedCmd === 'local-run' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy commands</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto border border-slate-800 leading-relaxed">
              <code>{quickStartCode}</code>
            </pre>
          </div>

          {/* Method 2: AI Studio Platform Export */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <h4 className="text-xs font-semibold text-white">Exporting via Google AI Studio Header</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You can also click the <b>Settings / Export</b> icon or the project options menu at the top of the Google AI Studio interface to:
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pl-4 list-disc">
              <li>
                <b className="text-slate-200">Export to GitHub</b>: Create or push to your personal GitHub repository.
              </li>
              <li>
                <b className="text-slate-200">Export ZIP</b>: Download an archive directly through the AI Studio platform manager.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Node.js 18+ and Python 3.10+ compatible
          </span>
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
