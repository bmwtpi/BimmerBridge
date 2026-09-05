import React, { useState } from 'react';
import { Minus, Square, Copy, X, CheckCircle2 } from 'lucide-react';
import { ConnectionMode } from '../types';

interface WindowHeaderProps {
  programName?: string;
  accentColor?: string;
  connectionMode?: ConnectionMode;
  isServerReady?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onMinimize?: () => void;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({
  programName = '泰兴悦之宝',
  accentColor = '#A855F7',
  isMaximized = true,
  onToggleMaximize,
  onMinimize
}) => {
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  return (
    <div className="relative h-9 bg-[#0e1118] border-b border-[#1f2433] flex items-center justify-between pl-3.5 pr-0 shrink-0 select-none text-xs text-white/80 z-40">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="absolute top-10 right-4 z-50 bg-[#1e2330] text-white text-xs border border-[#30384a] shadow-xl px-3 py-1.5 rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Left title: Logo icon + Program title */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-4 h-4 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-4 h-4">
            <polygon
              points="18,3 31,10 31,26 18,33 5,26 5,10"
              fill="#0e131f"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M24,13 C21,9 13,10 12,18 C11,25 20,26 24,22"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="24" cy="13" r="2" fill="#38bdf8" />
          </svg>
        </div>
        <span className="font-normal text-white/90 text-xs tracking-wide font-sans">
          {programName} Connect · v3.26.0
        </span>
      </div>

      {/* Right Desktop Window Controls: - ▢ ✕ with precise Windows 11 sizing and hover */}
      <div className="flex items-center h-full">
        <button 
          onClick={() => {
            if (onMinimize) onMinimize();
            showToast('已最小化至系统托盘，后台隧道保持常驻');
          }}
          className="h-full w-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="最小化"
          type="button"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={onToggleMaximize}
          className="h-full w-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={isMaximized ? '还原窗口' : '最大化'}
          type="button"
        >
          {isMaximized ? (
            <Square className="w-3 h-3" />
          ) : (
            <div className="relative w-3.5 h-3.5 flex items-center justify-center">
              <Square className="w-2.5 h-2.5 stroke-[1.7]" />
            </div>
          )}
        </button>
        <button 
          onClick={() => {
            showToast('Connect 服务已转入后台运行 (在托盘中常驻以随时响应连接)');
          }}
          className="h-full w-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
          title="关闭"
          type="button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

