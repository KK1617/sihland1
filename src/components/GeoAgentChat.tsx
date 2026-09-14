import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Compass, 
  Terminal, 
  Lightbulb,
  Radio
} from 'lucide-react';
import { GeoPreset, GeoTask, AgentChatMessage, InferenceResult } from '../types';

interface GeoAgentChatProps {
  isOpen: boolean;
  onClose: () => void;
  preset: GeoPreset;
  activeTask: GeoTask;
  result: InferenceResult | null;
}

export const GeoAgentChat: React.FC<GeoAgentChatProps> = ({
  isOpen,
  onClose,
  preset,
  activeTask,
  result
}) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **GeoAI Geospatial Reasoning Agent** powered by OpenGeos models and Gemini. I can analyze the active satellite imagery for **${preset.name}**, interpret spectral reflections, explain model architectures (Prithvi, SAM, RF-DETR), and write custom \`geoai\` Python code.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputValue.trim();
    if (!textToSend || isSending) return;

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch('/api/geoai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          presetId: preset.id,
          taskId: activeTask,
          currentMetrics: result?.metrics
        })
      });

      const data = await response.json();
      const assistantMsg: AgentChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content || 'I completed analyzing the geospatial scene.',
        code: data.code,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: AgentChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Could not connect to the GeoAI reasoning server. Using offline geospatial heuristics: For ${preset.name}, remote sensing imagery indicates multi-band surface reflectance across ${preset.resolution} data.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const QUICK_PROMPTS = [
    "Count and describe detected features in this AOI",
    "How does SAM-Geospatial promptable segmentation work?",
    "Explain NDVI calculation with Sentinel-2 bands",
    "Generate Python training pipeline with GPU acceleration"
  ];

  if (!isOpen) return null;

  return (
    <div className="w-80 md:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-20 shrink-0 select-none shadow-2xl">
      {/* Header */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              GeoAI Agent
              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Vision-Language & Code Assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-600/10'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-bl-none shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Code snippet block if any */}
              {msg.code && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-amber-400" />
                      python
                    </span>
                    <button
                      onClick={() => handleCopyCode(msg.code!, msg.id)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 hover:underline"
                    >
                      {copiedCodeId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-2.5 rounded text-[10px] font-mono text-emerald-300 overflow-x-auto border border-slate-800">
                    <code>{msg.code}</code>
                  </pre>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GeoAgent reasoning over satellite coordinates...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-[10px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          Suggested Remote Sensing Queries
        </div>
        <div className="flex flex-wrap gap-1">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[10px] text-slate-300 bg-slate-800/70 hover:bg-slate-800 hover:text-emerald-300 border border-slate-700/60 rounded px-2 py-1 text-left truncate max-w-full transition"
            >
              &bull; {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Ask about ${preset.name} or GeoAI models...`}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isSending}
          className={`p-2 rounded-lg transition ${
            inputValue.trim() && !isSending
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
