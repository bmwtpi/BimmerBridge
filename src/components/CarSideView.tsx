import React, { useState } from 'react';
import { 
  Car, 
  KeyRound, 
  Copy, 
  Check, 
  RefreshCw, 
  Network, 
  Radar, 
  ShieldCheck, 
  FileCode, 
  Zap, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { NetworkAdapter, LangType, Session } from '../types';
import { translations } from '../lib/translations';
import { carAgentCode } from '../lib/agent-code';

interface CarSideViewProps {
  lang: LangType;
  latestCode: string;
  smartCode: string;
  isGeneratingCode: boolean;
  onGenerateCode: () => void;
  adapters: NetworkAdapter[];
  selectedAdapter: string;
  setSelectedAdapter: (name: string) => void;
  isRefreshingAdapters: boolean;
  onRefreshAdapters: () => void;
  onAutoDetectAdapter: () => void;
  isScanning: boolean;
  onScanVehicle: () => void;
  carConnected: boolean;
  carVin?: string;
  carIp?: string;
  doipEnabled: boolean;
  setDoipEnabled: (val: boolean) => void;
  j2534Enabled: boolean;
  setJ2534Enabled: (val: boolean) => void;
  usbEnabled: boolean;
  setUsbEnabled: (val: boolean) => void;
  activeSession?: Session;
  onOpenChat?: () => void;
  onOpenPreFlight?: () => void;
  onOpenRemoteDesktop?: () => void;
}

export const CarSideView: React.FC<CarSideViewProps> = ({
  lang,
  latestCode,
  smartCode,
  isGeneratingCode,
  onGenerateCode,
  adapters,
  selectedAdapter,
  setSelectedAdapter,
  isRefreshingAdapters,
  onRefreshAdapters,
  onAutoDetectAdapter,
  isScanning,
  onScanVehicle,
  carConnected,
  carVin,
  carIp,
  doipEnabled,
  setDoipEnabled,
  j2534Enabled,
  setJ2534Enabled,
  usbEnabled,
  setUsbEnabled,
  activeSession,
  onOpenChat,
  onOpenPreFlight,
  onOpenRemoteDesktop
}) => {
  const t = translations[lang];
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);

  const handleCopyCode = () => {
    if (!latestCode) return;
    navigator.clipboard.writeText(latestCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!smartCode) return;
    navigator.clipboard.writeText(smartCode);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(carAgentCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Status Header */}
      <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  {t.downloadInstructions}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  carConnected 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {carConnected ? t.connected : t.waiting}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-1 max-w-xl">
                {t.downloadDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGenerateCode}
              disabled={isGeneratingCode}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingCode ? 'animate-spin' : ''}`} />
              <span>{latestCode ? t.regenerateCode : t.generateCode}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pairing Credentials & Standalone Script */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Active Pairing Code */}
          <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {t.codeGenerated}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-white/40 uppercase">AES-256 GCM</span>
            </div>

            {latestCode ? (
              <div className="space-y-4">
                <div className="bg-black/60 border border-white/10 rounded-xl p-5 text-center relative group">
                  <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest block mb-1">
                    {t.sendToTech}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-blue-400 tracking-[8px] my-3 drop-shadow-[0_0_20px_rgba(96,165,250,0.3)]">
                    {latestCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? t.copied : t.copyCode}</span>
                  </button>
                </div>

                {/* Smart-Link Section */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/60 uppercase font-mono">
                      {t.smartCode}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-mono font-bold flex items-center gap-1"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? t.copied : t.copySmartLink}</span>
                    </button>
                  </div>
                  <div className="bg-black/80 p-2.5 rounded-lg border border-white/5 font-mono text-[11px] text-white/80 break-all select-all">
                    {smartCode || `${latestCode}`}
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    {t.smartCodeDesc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white/60">
                  {lang === 'zh' ? '暂未生成配对码' : 'No Pairing Code Generated'}
                </div>
                <p className="text-xs text-white/30 max-w-sm mx-auto">
                  {lang === 'zh' 
                    ? '点击上方“生成 P2P 连接码”按钮，即可创建带有专属加密通道的临时凭证。' 
                    : 'Click "Generate P2P Code" above to create a private tunnel credential.'}
                </p>
                <button
                  onClick={onGenerateCode}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  {t.generateCode}
                </button>
              </div>
            )}
          </div>

          {/* Standalone Agent Script Section */}
          <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {t.downloadAgent}
                </h3>
              </div>
              <button
                onClick={handleCopyScript}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono font-bold flex items-center gap-1"
              >
                {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedScript ? t.copied : t.copyAgentScript}</span>
              </button>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              {t.downloadAgentDesc}
            </p>
            <div className="bg-black/80 p-3 rounded-xl border border-white/5 font-mono text-[11px] text-white/70 overflow-x-auto">
              <code className="text-emerald-400 font-bold"># Windows / macOS / Linux (Node.js required):</code>
              <br />
              <code>node car.js ws://120.78.234.56:3000/bridge {latestCode || '123456'}</code>
            </div>
          </div>

          {/* RemoteService.app Standard Pre-Flight & RustDesk Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pre-Flight Card */}
            <div className="bg-gradient-to-br from-indigo-950/40 to-[#111217] border border-indigo-500/20 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    {lang === 'zh' ? '连接预检向导' : 'Pre-Flight Check'}
                  </h4>
                  <span className="text-[9px] font-mono text-indigo-400">5-STEP VERIFICATION</span>
                </div>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {lang === 'zh' 
                  ? '启动网线、IP子网、ZGW网关与 13.8V 稳压五重硬件自检。' 
                  : 'Run 5-step hardware check for cable, IP subnet, gateway, and PSU.'}
              </p>
              <button
                onClick={onOpenPreFlight}
                className="w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                {t.runPreFlight}
              </button>
            </div>

            {/* RustDesk Sharing Card */}
            <div className="bg-gradient-to-br from-blue-950/40 to-[#111217] border border-blue-500/20 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    {lang === 'zh' ? 'RustDesk 屏幕共享' : 'RustDesk Screen Share'}
                  </h4>
                  <span className="text-[9px] font-mono text-blue-400">REMOTE ASSISTANCE</span>
                </div>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {lang === 'zh' 
                  ? '让远程编程专家一键同屏查看客户屏幕排查故障。' 
                  : 'Enable remote expert to view screen and assist in real-time.'}
              </p>
              <button
                onClick={onOpenRemoteDesktop}
                className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                {lang === 'zh' ? '打开屏幕控制台' : 'Open Remote Screen'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Network Adapter & DoIP Scanner */}
        <div className="lg:col-span-5 space-y-6">
          {/* Physical Network Adapter Card */}
          <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {t.networkSettings}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onAutoDetectAdapter}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase"
                >
                  {t.autoDetect}
                </button>
                <button
                  onClick={onRefreshAdapters}
                  className="p-1 text-white/40 hover:text-white"
                  title={t.refresh}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAdapters ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <p className="text-xs text-white/40">
              {t.networkSettingsDesc}
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {adapters.map((adapter, idx) => {
                const isCarAdapter = adapter.ip?.startsWith('169.254.');
                const adapterKey = adapter.id ? `nic-${adapter.id}` : `nic-${adapter.name}-${adapter.ip || ''}-${idx}`;
                const isSelected = selectedAdapter === adapter.name || selectedAdapter === adapter.id || selectedAdapter === adapterKey;
                return (
                  <div
                    key={adapterKey}
                    onClick={() => setSelectedAdapter(adapter.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500/50 text-white shadow-md'
                        : 'bg-black/40 border-white/5 text-white/60 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono">{adapter.name}</span>
                        {isCarAdapter && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            ENET
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-white/40">{adapter.ip}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                );
              })}
              {adapters.length === 0 && (
                <div className="text-center py-6 text-xs text-white/30 italic">
                  {t.noAdapters}
                </div>
              )}
            </div>

            {/* Vehicle Scanner Button */}
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={onScanVehicle}
                disabled={isScanning}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Radar className={`w-4 h-4 text-blue-400 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? t.scanning : t.scanVehicle}</span>
              </button>
            </div>
          </div>

          {/* Vehicle Node Info Preview */}
          <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {t.vehicleInfo}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {carVin ? 'IDENTIFIED' : 'WAITING'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[9px] text-white/30 uppercase block mb-1">VIN</span>
                <span className="font-bold text-white tracking-wider truncate block">
                  {carVin || '---'}
                </span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[9px] text-white/30 uppercase block mb-1">IP</span>
                <span className="font-bold text-white tracking-wider truncate block">
                  {carIp || '---'}
                </span>
              </div>
            </div>

            {/* Protocol Options Toggles */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{t.enableDoIP}</div>
                  <div className="text-[10px] text-white/40">{t.enableDoIPDesc}</div>
                </div>
                <button
                  onClick={() => setDoipEnabled(!doipEnabled)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${doipEnabled ? 'bg-blue-600' : 'bg-white/10'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${doipEnabled ? 'translate-x-4' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{t.enableJ2534}</div>
                  <div className="text-[10px] text-white/40">{t.enableJ2534Desc}</div>
                </div>
                <button
                  onClick={() => setJ2534Enabled(!j2534Enabled)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${j2534Enabled ? 'bg-blue-600' : 'bg-white/10'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${j2534Enabled ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
