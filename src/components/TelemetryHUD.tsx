import React, { useState } from 'react';
import { 
  Gauge, 
  KeyRound, 
  BatteryCharging, 
  BatteryMedium, 
  BatteryWarning, 
  Wifi, 
  Activity, 
  Monitor, 
  Wrench, 
  ShieldCheck, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { TelemetryData, LangType, TabType } from '../types';
import { translations } from '../lib/translations';

interface TelemetryHUDProps {
  lang: LangType;
  telemetry: TelemetryData;
  connectionMode: 'p2p' | 'relay';
  onNavigateTab: (tab: TabType) => void;
  onOpenPreFlight: () => void;
  onOpenChat: () => void;
  activeSessionCode?: string;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  lang,
  telemetry,
  connectionMode,
  onNavigateTab,
  onOpenPreFlight,
  onOpenChat,
  activeSessionCode
}) => {
  const t = translations[lang];
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getVoltageBadge = () => {
    if (telemetry.voltage >= 13.0) {
      return {
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
        text: t.hudSafeFlashing,
        icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      };
    } else if (telemetry.voltage >= 12.0) {
      return {
        color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
        text: t.hudWarningFlashing,
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
      };
    } else {
      return {
        color: 'text-rose-400 border-rose-500/40 bg-rose-500/10 animate-pulse',
        text: t.hudDangerFlashing,
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
      };
    }
  };

  const vBadge = getVoltageBadge();

  return (
    <div className="bg-[#0b0d12] border-b border-white/10 px-4 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: RemoteService.app Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
          {/* Active Session Indicator */}
          {activeSessionCode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span>TUNNEL: {activeSessionCode}</span>
            </div>
          )}

          {/* Car Voltage KL30 */}
          <div 
            onClick={() => onNavigateTab('ediabas')}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border cursor-pointer transition-all hover:scale-102 ${vBadge.color}`}
            title="Click to open Ediabas Diagnostics"
          >
            <Gauge className="w-3.5 h-3.5" />
            <div className="flex items-baseline gap-1">
              <span className="font-black text-sm">{telemetry.voltage.toFixed(1)}V</span>
              <span className="text-[9px] uppercase font-bold tracking-wider hidden sm:inline">KL30</span>
            </div>
            <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-black/40 border border-white/10 font-bold">
              {vBadge.text}
            </span>
          </div>

          {/* Ignition KL15 */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
            telemetry.ignition 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-white/5 border-white/10 text-white/40'
          }`}>
            <KeyRound className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">
              KL15: {telemetry.ignition ? (lang === 'zh' ? '开启' : 'ON') : (lang === 'zh' ? '关闭' : 'OFF')}
            </span>
          </div>

          {/* Customer Laptop Battery */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
            telemetry.customerLaptopBattery.isCharging 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : telemetry.customerLaptopBattery.level > 30 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
          }`}>
            {telemetry.customerLaptopBattery.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5" />
            ) : (
              <BatteryMedium className="w-3.5 h-3.5" />
            )}
            <span className="text-[11px] font-bold">
              {telemetry.customerLaptopBattery.level}%
            </span>
            <span className="text-[9px] text-white/50 hidden md:inline">
              ({telemetry.customerLaptopBattery.isCharging ? t.hudAcConnected : t.hudBatteryOnly})
            </span>
          </div>

          {/* Customer Wi-Fi / Link Health */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70">
            <Wifi className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">
              {telemetry.customerNetwork.signalDbm} dBm (5GHz)
            </span>
          </div>

          {/* Latency & Mode */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-bold text-white">
              {telemetry.latencyMs}ms
            </span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
              connectionMode === 'p2p' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {connectionMode === 'p2p' ? 'P2P' : 'RELAY'}
            </span>
          </div>
        </div>

        {/* Right Side: Quick Action Launchers */}
        <div className="flex items-center gap-2">
          {/* Pre-Flight Assistant */}
          <button
            onClick={onOpenPreFlight}
            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5"
            title={t.preFlightTitle}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{lang === 'zh' ? '连接预检' : 'Pre-Flight'}</span>
          </button>

          {/* Remote Desktop (RustDesk) */}
          <button
            onClick={() => onNavigateTab('remote-desktop')}
            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-bold transition-all flex items-center gap-1.5"
            title={t.rustdeskTitle}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'zh' ? '远程协助' : 'Remote Screen'}</span>
          </button>

          {/* Ediabas Diag */}
          <button
            onClick={() => onNavigateTab('ediabas')}
            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5"
            title={t.ediabasTitle}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'zh' ? 'ECU 诊断' : 'Ediabas'}</span>
          </button>

          {/* Chat Drawer */}
          <button
            onClick={onOpenChat}
            className="p-1 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            title={t.chat}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">{t.chat}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
