import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, 
  MousePointer, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Terminal, 
  Keyboard, 
  Wifi, 
  ShieldCheck, 
  Settings, 
  Power, 
  Sliders, 
  Clipboard,
  Smartphone,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Session, LangType, RustDeskConfig } from '../types';
import { translations } from '../lib/translations';

interface RemoteDesktopViewProps {
  lang: LangType;
  activeSession?: Session;
  rustdeskConfig: RustDeskConfig;
  setRustdeskConfig: React.Dispatch<React.SetStateAction<RustDeskConfig>>;
  onOpenLogs: () => void;
}

export const RemoteDesktopView: React.FC<RemoteDesktopViewProps> = ({
  lang,
  activeSession,
  rustdeskConfig,
  setRustdeskConfig,
  onOpenLogs
}) => {
  const t = translations[lang];

  // RustDesk Connection state
  const defaultId = activeSession?.rustdeskId || '784 921 035';
  const defaultPwd = activeSession?.rustdeskPassword || 'bmw#8892';
  const [rustdeskId, setRustdeskId] = useState(defaultId);
  const [rustdeskPwd, setRustdeskPwd] = useState(defaultPwd);
  const [isCopiedId, setIsCopiedId] = useState(false);
  const [isCopiedUri, setIsCopiedUri] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Remote Stream Stats
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(16);
  const [bitrate, setBitrate] = useState(2.8);

  // Simulated Desktop State
  const [activeWindow, setActiveWindow] = useState<'ista' | 'esys' | 'network' | 'diag'>('ista');
  const [mousePos, setMousePos] = useState({ x: 520, y: 340 });
  const [clipboardText, setClipboardText] = useState('169.254.88.192:13400');
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate rustdesk:// URI
  const rawId = rustdeskId.replace(/\s+/g, '');
  const rustdeskUri = `rustdesk://${rawId}?password=${encodeURIComponent(rustdeskPwd)}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(rawId);
    setIsCopiedId(true);
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  const handleCopyUri = () => {
    navigator.clipboard.writeText(rustdeskUri);
    setIsCopiedUri(true);
    setTimeout(() => setIsCopiedUri(false), 2000);
  };

  const handleLaunchRustDesk = () => {
    window.location.href = rustdeskUri;
  };

  const handleSendSpecialKey = (keyName: string) => {
    setClipboardNotice(`${lang === 'zh' ? '已向远程端发送' : 'Sent key'}: ${keyName}`);
    setTimeout(() => setClipboardNotice(null), 2500);
  };

  const handleSyncClipboard = () => {
    if (!clipboardText) return;
    navigator.clipboard.writeText(clipboardText);
    setClipboardNotice(lang === 'zh' ? '剪贴板内容已同步到本地及远端！' : 'Clipboard synced with remote PC!');
    setTimeout(() => setClipboardNotice(null), 2500);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Simulate mouse movement in canvas
  const handleMouseMoveInDesktop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rustdeskConfig.viewOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setMousePos({ x, y });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* RustDesk Protocol & Integration Header */}
      <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  {t.rustdeskTitle}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-400">
                    OPEN SOURCE PROTOCOL
                  </span>
                </h2>
              </div>
              <p className="text-xs text-white/50 mt-1 max-w-2xl leading-relaxed">
                {t.rustdeskDesc}
              </p>
            </div>
          </div>

          {/* Quick RustDesk ID & Password Box */}
          <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex flex-wrap items-center gap-3 shrink-0 font-mono text-xs">
            <div>
              <span className="text-[9px] text-white/40 uppercase block">{t.rustdeskId}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white">{rustdeskId}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                  title={t.copied}
                >
                  {isCopiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10"></div>

            <div>
              <span className="text-[9px] text-white/40 uppercase block">{t.rustdeskOneTimePwd}</span>
              <span className="text-base font-black text-blue-400">{rustdeskPwd}</span>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

            {/* Launch Native Client */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleLaunchRustDesk}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-95"
                title={rustdeskUri}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t.rustdeskLaunchBtn}</span>
              </button>
              <button
                onClick={handleCopyUri}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
                title={t.rustdeskCopyUri}
              >
                {isCopiedUri ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Remote Desktop Display Area */}
      <div 
        ref={containerRef}
        className="bg-[#0b0c10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Remote Control Toolbar */}
        <div className="bg-[#14161f] border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-white uppercase">
              {activeSession ? `REMOTE: ${activeSession.code}` : 'REMOTE ASSIST: ACTIVE'}
            </span>
            <span className="text-white/20">|</span>
            <span className="text-white/50">{fps} FPS</span>
            <span className="text-white/20">|</span>
            <span className="text-emerald-400 font-bold">{latency}ms</span>
            <span className="text-white/20">|</span>
            <span className="text-white/50">{bitrate} Mbps</span>
          </div>

          {/* Interactive Mode & Keyboard Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Only vs Interactive */}
            <button
              onClick={() => setRustdeskConfig(prev => ({ ...prev, viewOnly: !prev.viewOnly }))}
              className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 font-bold transition-all ${
                rustdeskConfig.viewOnly
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {rustdeskConfig.viewOnly ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t.rustdeskViewOnly}</span>
                </>
              ) : (
                <>
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>{t.rustdeskInteractive}</span>
                </>
              )}
            </button>

            {/* Special Keys Toolbar */}
            <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => handleSendSpecialKey('Ctrl+Alt+Del')}
                className="px-2 py-0.5 rounded text-[10px] font-mono text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="Send Ctrl+Alt+Del to Customer Laptop"
              >
                Ctrl+Alt+Del
              </button>
              <button
                onClick={() => handleSendSpecialKey('Win Key')}
                className="px-2 py-0.5 rounded text-[10px] font-mono text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="Send Windows Key"
              >
                Win
              </button>
              <button
                onClick={() => handleSendSpecialKey('Esc')}
                className="px-2 py-0.5 rounded text-[10px] font-mono text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="Send Escape"
              >
                Esc
              </button>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Notice Toast */}
        {clipboardNotice && (
          <div className="bg-blue-600 text-white text-xs font-mono text-center py-1 font-bold animate-in fade-in">
            {clipboardNotice}
          </div>
        )}

        {/* Interactive Desktop Canvas Viewer */}
        <div 
          onMouseMove={handleMouseMoveInDesktop}
          className="relative w-full aspect-[16/10] max-h-[640px] bg-[#171d2b] overflow-hidden select-none cursor-crosshair flex flex-col justify-between"
          style={{ backgroundImage: 'radial-gradient(ellipse at center, #1b263b 0%, #0d1322 100%)' }}
        >
          {/* Windows 11 / Windows 10 Header Wallpaper Art */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
            <div className="w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px]"></div>
          </div>

          {/* Desktop App Window (ISTA / E-Sys / Network Diagnostic Simulator) */}
          <div className="relative z-10 m-4 sm:m-8 bg-[#181a20] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col flex-1 max-w-4xl mx-auto w-full">
            {/* Window Titlebar */}
            <div className="bg-[#20222a] border-b border-white/10 px-4 py-2 flex items-center justify-between text-xs text-white/80">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <span className="font-mono text-[11px] font-bold text-white pl-2">
                  {activeWindow === 'ista' && 'ISTA 4.39.20 Standalone - Vehicle Identification (ENET Bridge)'}
                  {activeWindow === 'esys' && 'E-Sys 3.38.2 - Connection Target [F020 / Direct ENET IP 127.0.0.1:13400]'}
                  {activeWindow === 'network' && 'Windows Network Connections (Ethernet ENET 169.254.88.192)'}
                  {activeWindow === 'diag' && 'BMW EDIABAS API Shell - Status KL15/KL30 Check'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setActiveWindow('ista')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${activeWindow === 'ista' ? 'bg-blue-600 text-white font-bold' : 'text-white/40 hover:text-white'}`}
                >
                  ISTA
                </button>
                <button 
                  onClick={() => setActiveWindow('esys')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${activeWindow === 'esys' ? 'bg-blue-600 text-white font-bold' : 'text-white/40 hover:text-white'}`}
                >
                  E-Sys
                </button>
                <button 
                  onClick={() => setActiveWindow('network')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${activeWindow === 'network' ? 'bg-blue-600 text-white font-bold' : 'text-white/40 hover:text-white'}`}
                >
                  NIC
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-4 flex-1 bg-[#101115] text-white font-mono text-xs overflow-y-auto space-y-3">
              {activeWindow === 'ista' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg text-blue-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Vehicle Connection Detected: VIN WBA3A5C55K...</span>
                    </div>
                    <span className="font-bold text-emerald-400">KL30: 13.8V (PSU OK)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1">
                      <span className="text-white/40 text-[9px] uppercase block">ECU Tree Status</span>
                      <div className="text-emerald-400 font-bold">● 24 ECUs Responding Normally</div>
                      <div className="text-white/70">Series: BMW 3 Series G20 / B48</div>
                      <div className="text-white/70">Integration Level: F020-21-07-500</div>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1">
                      <span className="text-white/40 text-[9px] uppercase block">DoIP Gateway</span>
                      <div className="text-white">ZGW IP: 169.254.88.192</div>
                      <div className="text-white">Port: 13400 (TCP/UDP Active)</div>
                      <div className="text-emerald-400">Tunnel: P2P Direct Tunnel OK</div>
                    </div>
                  </div>

                  <div className="p-3 bg-black/60 rounded-lg border border-white/5 text-[10px] text-white/60 space-y-1">
                    <div>[04:19:12] ISTA Initialized via BimmerBridge Virtual ENET</div>
                    <div>[04:19:13] PadKL15: Active (Ignition On)</div>
                    <div>[04:19:14] SGBD PRG Engine Hook: D_MOTOR.PRG bound to port 6801</div>
                    <div className="text-emerald-400">[04:19:15] Diagnostic memory read complete. 0 critical faults.</div>
                  </div>
                </div>
              )}

              {activeWindow === 'esys' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-600/10 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center justify-between">
                    <span>Target: Direct Connection (via VIN / IP: 127.0.0.1:13400)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">CONNECTED</span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-2 text-[11px]">
                    <span className="text-white/40 text-[9px] uppercase block">Expert Coding Modules (CAF/FA)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-white/5 rounded border border-white/5 text-center">
                        <div className="font-bold text-blue-400">BDC_BODY</div>
                        <div className="text-[9px] text-white/50">CAFD_000017BD</div>
                      </div>
                      <div className="p-2 bg-white/5 rounded border border-white/5 text-center">
                        <div className="font-bold text-blue-400">HU_MGU</div>
                        <div className="text-[9px] text-white/50">CAFD_00003E52</div>
                      </div>
                      <div className="p-2 bg-white/5 rounded border border-white/5 text-center">
                        <div className="font-bold text-blue-400">KOMBI</div>
                        <div className="text-[9px] text-white/50">CAFD_000009C8</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeWindow === 'network' && (
                <div className="space-y-3">
                  <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-2">
                    <span className="text-white/40 text-[9px] uppercase block">Physical Network Adapters</span>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                      <span>Ethernet ENET (Realtek USB-GbE)</span>
                      <span className="text-blue-400 font-bold">169.254.88.192 / 255.255.0.0</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1">
                      <span>Intel Wi-Fi 6 AX201</span>
                      <span className="text-emerald-400 font-bold">192.168.1.105 (Internet OK)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Window Status Bar */}
            <div className="bg-[#14151a] border-t border-white/5 px-4 py-1.5 flex items-center justify-between text-[10px] text-white/40 font-mono">
              <span>BimmerBridge Host v0.05 | RustDesk Tunnel ID: {rustdeskId}</span>
              <span className="text-emerald-400">● 100M ENET Cable Ready</span>
            </div>
          </div>

          {/* Simulated Windows Taskbar at bottom */}
          <div className="relative z-10 bg-[#0d0f17]/90 backdrop-blur border-t border-white/10 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-[10px] shadow">
                田
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="px-2 py-1 rounded bg-white/10 text-white font-bold">ISTA Standalone</span>
                <span className="px-2 py-1 rounded bg-white/5 text-white/60">E-Sys 3.38</span>
                <span className="px-2 py-1 rounded bg-white/5 text-white/60">BimmerBridge Agent</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[10px] text-white/60">
              <span>ENG</span>
              <span>13.8V ⚡</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Remote Cursor simulation */}
          {!rustdeskConfig.viewOnly && (
            <div 
              className="absolute pointer-events-none z-30 transition-transform duration-75"
              style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
            >
              <MousePointer className="w-5 h-5 text-blue-400 fill-blue-500 drop-shadow-md" />
              <span className="absolute left-4 top-2 px-1 rounded bg-blue-600 text-[8px] font-mono text-white font-bold">
                Tech
              </span>
            </div>
          )}
        </div>

        {/* Remote Clipboard Sync Strip */}
        <div className="bg-[#11131a] border-t border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Clipboard className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-white/40 uppercase text-[10px]">{t.rustdeskClipboard}:</span>
            <input
              type="text"
              value={clipboardText}
              onChange={(e) => setClipboardText(e.target.value)}
              placeholder="Text to sync across remote PC..."
              className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 flex-1 sm:w-72"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncClipboard}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? '推送剪贴板到远端' : 'Push to Remote'}</span>
            </button>
            <button
              onClick={() => {
                setClipboardText('127.0.0.1:13400');
                handleSyncClipboard();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
            >
              DoIP IP
            </button>
            <button
              onClick={() => {
                setClipboardText('127.0.0.1:6801');
                handleSyncClipboard();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
            >
              EDIABAS IP
            </button>
          </div>
        </div>
      </div>

      {/* RustDesk Self-Hosted Server Configuration */}
      <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              {t.rustdeskServerConfig}
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            RENDEZVOUS READY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-white/40">ID Server (hbbs)</label>
            <input
              type="text"
              value={rustdeskConfig.idServer}
              onChange={(e) => setRustdeskConfig(prev => ({ ...prev, idServer: e.target.value }))}
              placeholder="120.78.234.56:21116"
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500 transition-all text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-white/40">Relay Server (hbbr)</label>
            <input
              type="text"
              value={rustdeskConfig.relayServer}
              onChange={(e) => setRustdeskConfig(prev => ({ ...prev, relayServer: e.target.value }))}
              placeholder="120.78.234.56:21117"
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500 transition-all text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-white/40">Public Key / API</label>
            <input
              type="text"
              value={rustdeskConfig.key}
              onChange={(e) => setRustdeskConfig(prev => ({ ...prev, key: e.target.value }))}
              placeholder="Optional Base64 RustDesk Key"
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500 transition-all text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
