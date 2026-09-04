import React from 'react';
import { Minus, Square, X, Wifi, Shield } from 'lucide-react';
import { ConnectionMode } from '../types';

interface WindowHeaderProps {
  programName?: string;
  accentColor?: string;
  connectionMode?: ConnectionMode;
  isServerReady?: boolean;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({
  programName = '泰兴悦之宝',
  accentColor = '#A855F7',
  connectionMode = 'p2p',
  isServerReady = true
}) => {
  return (
    <div className="h-8 bg-[#090a0e] border-b border-white/[0.06] flex items-center justify-between px-3 shrink-0 select-none text-xs text-white/70 z-40">
      {/* Left title */}
      <div className="flex items-center gap-2">
        <div 
          className="w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          C
        </div>
        <span className="font-medium text-white/90 text-[11px] tracking-wide">
          {programName} Connect · v3.26.0
        </span>
      </div>

      {/* Middle status indicator */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
          <span className={`w-1.5 h-1.5 rounded-full ${isServerReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{isServerReady ? 'ONLINE' : 'LOCAL'}</span>
        </div>
        <span className="text-white/20 text-[10px]">•</span>
        <span className="text-[10px] font-mono text-emerald-400/90 font-semibold uppercase">
          {connectionMode === 'p2p' ? 'P2P DIRECT' : 'RELAY'}
        </span>
      </div>

      {/* Right Desktop Window Controls */}
      <div className="flex items-center gap-3 text-white/40">
        <button 
          className="hover:text-white transition-colors p-1"
          title="最小化"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button 
          className="hover:text-white transition-colors p-1"
          title="最大化"
        >
          <Square className="w-2.5 h-2.5" />
        </button>
        <button 
          className="hover:text-rose-400 transition-colors p-1"
          title="关闭"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
