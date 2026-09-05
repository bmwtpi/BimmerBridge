import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Car, 
  Laptop, 
  Plus, 
  RefreshCw, 
  Trash2, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Wifi, 
  KeyRound, 
  Copy, 
  Check, 
  ExternalLink,
  Radio,
  Gauge
} from 'lucide-react';
import { Session, LangType, ConnectionMode, DebugLog } from '../types';
import { translations } from '../lib/translations';

interface DashboardViewProps {
  lang: LangType;
  sessions: Session[];
  loading: boolean;
  onRefresh: () => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string, e?: React.MouseEvent) => void;
  onOpenChat: (session: Session) => void;
  activeDiagSessions: Set<string>;
  onEnableDiagMode: (sessionId: string) => void;
  isDiagModeLoading: boolean;
  connectionMode: ConnectionMode;
  onSwitchToCar: () => void;
  onSwitchToTech: () => void;
  latestLogs: DebugLog[];
  onOpenLogs: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  sessions,
  loading,
  onRefresh,
  onCreateSession,
  onDeleteSession,
  onOpenChat,
  activeDiagSessions,
  onEnableDiagMode,
  isDiagModeLoading,
  connectionMode,
  onSwitchToCar,
  onSwitchToTech,
  latestLogs,
  onOpenLogs
}) => {
  const t = translations[lang];
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeConnectedCount = sessions.filter(s => s.carConnected || s.techConnected).length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Overview Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111217] border border-white/10 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-white/40 font-bold block mb-1">
              {t.activeChannels}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-white">
                {sessions.length}
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                ({activeConnectedCount} active)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <Radio className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-[#111217] border border-white/10 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-white/40 font-bold block mb-1">
              {t.connectionQuality}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-black font-mono ${connectionMode === 'p2p' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {connectionMode === 'p2p' ? 'P2P DIRECT' : 'RELAY'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#111217] border border-white/10 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-white/40 font-bold block mb-1">
              {t.batteryVoltage}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-emerald-400">
                13.8
              </span>
              <span className="text-xs font-mono text-white/40 font-bold">V</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Gauge className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#111217] border border-white/10 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-white/40 font-bold block mb-1">
              {t.tunnelLatency}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-white">
                18
              </span>
              <span className="text-xs font-mono text-white/40 font-bold">ms</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Main Sessions Section */}
      <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {t.remoteSessions}
              </h2>
              <p className="text-xs text-white/40">
                {t.manageConnections}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
              title={t.refresh}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onCreateSession}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newSession}</span>
            </button>
          </div>
        </div>

        {/* Sessions List */}
        {loading && sessions.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-white/30 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-400" />
            <div>{t.loading}</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/20">
              <Radio className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white/70">{t.noSessions}</div>
              <p className="text-xs text-white/40 max-w-md mx-auto leading-relaxed">
                {t.clickToCreate}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onSwitchToCar}
                className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                <Car className="w-4 h-4" />
                <span>{t.downloads}</span>
              </button>
              <button
                onClick={onSwitchToTech}
                className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                <Laptop className="w-4 h-4" />
                <span>{t.techTab}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session) => {
              const isDiagActive = activeDiagSessions.has(session.id);
              const isBothConnected = session.carConnected && session.techConnected;

              return (
                <div
                  key={session.id}
                  className={`bg-black/40 border rounded-2xl p-5 space-y-4 transition-all hover:border-blue-500/30 shadow-md ${
                    isBothConnected ? 'border-emerald-500/30' : 'border-white/10'
                  }`}
                >
                  {/* Top: Code & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-black font-mono text-blue-400 tracking-wider">
                        {session.code}
                      </div>
                      <button
                        onClick={(e) => handleCopy(session.code, session.id, e)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                        title={t.copyCode}
                      >
                        {copiedId === session.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => onDeleteSession(session.id, e)}
                        className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title={t.deleteSession}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Node Status Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      session.carConnected 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-white/[0.02] border-white/5 text-white/40'
                    }`}>
                      <Car className="w-4 h-4 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[9px] uppercase block text-white/30">{t.carClient}</span>
                        <span className="font-bold text-[11px] truncate block">
                          {session.carConnected ? 'LINKED' : 'OFFLINE'}
                        </span>
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      session.techConnected 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-white/[0.02] border-white/5 text-white/40'
                    }`}>
                      <Laptop className="w-4 h-4 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[9px] uppercase block text-white/30">{t.techClient}</span>
                        <span className="font-bold text-[11px] truncate block">
                          {session.techConnected ? 'LINKED' : 'OFFLINE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Meta */}
                  <div className="p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-white/70">
                      <span className="text-white/30 text-[9px] uppercase">{t.vin}</span>
                      <span className="font-bold text-white">{session.carVin || '---'}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/70">
                      <span className="text-white/30 text-[9px] uppercase">{t.realIp}</span>
                      <span className="text-blue-400 font-bold">{session.carIp || '---'}</span>
                    </div>
                  </div>

                  {/* Actions: Chat & Diagnostic Hook */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onOpenChat(session)}
                      className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t.chat}</span>
                    </button>

                    <button
                      onClick={() => onEnableDiagMode(session.id)}
                      disabled={isDiagActive || isDiagModeLoading}
                      className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        isDiagActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400'
                      }`}
                      title="Take over ports 22, 6801, 6811 for ISTA/E-Sys"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isDiagActive ? 'Active' : 'Pro Diag'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mini Diagnostic Log Bar */}
      <div className="bg-[#111217] border border-white/10 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          <div className="font-mono text-xs truncate">
            {latestLogs.length > 0 ? (
              <span className="text-white/70">
                <span className="text-white/30 mr-2">[{latestLogs[latestLogs.length - 1].timestamp}]</span>
                {latestLogs[latestLogs.length - 1].message}
              </span>
            ) : (
              <span className="text-white/30">{t.systemStandby}</span>
            )}
          </div>
        </div>

        <button
          onClick={onOpenLogs}
          className="text-xs font-mono font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider shrink-0 ml-4"
        >
          {lang === 'zh' ? '查看完整日志 →' : 'View Logs →'}
        </button>
      </div>
    </div>
  );
};
