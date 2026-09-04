import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, Copy, Trash2, Check, Shield } from 'lucide-react';
import { DebugLog, LangType } from '../types';
import { translations } from '../lib/translations';

interface LogConsoleModalProps {
  lang: LangType;
  isOpen: boolean;
  onClose: () => void;
  logs: DebugLog[];
  onClearLogs: () => void;
}

export const LogConsoleModal: React.FC<LogConsoleModalProps> = ({
  lang,
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'all' | 'error' | 'success' | 'info'>('all');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0d0e12] border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[520px] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-black/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-white/20 text-xs">|</span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white/80">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>DIAGNOSTIC PROTOCOL LOGS</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg text-[10px] font-mono">
              {(['all', 'info', 'success', 'error'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-2 py-0.5 rounded uppercase font-bold transition-colors ${
                    filter === mode ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyLogs}
              className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Copy all logs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClearLogs}
              className="p-1.5 text-white/50 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
              title={t.clearLogs}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-4 bg-black/95 font-mono text-[11px] leading-5 overflow-y-auto space-y-1 custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="text-white/20 italic text-center py-12">
              -- Log buffer empty --
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2 group hover:bg-white/[0.03] px-1.5 py-0.5 rounded">
                <span className="text-white/20 select-none shrink-0 font-bold">
                  [{log.timestamp}]
                </span>
                <span className={`shrink-0 uppercase text-[9px] font-bold px-1 rounded ${
                  log.type === 'error'
                    ? 'bg-rose-500/20 text-rose-400'
                    : log.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-white/50'
                }`}>
                  {log.type}
                </span>
                <span className={`flex-1 break-all ${
                  log.type === 'error'
                    ? 'text-rose-400 font-semibold'
                    : log.type === 'success'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-white/70'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};
