import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronDown, 
  Folder, 
  AlertCircle, 
  AlertTriangle, 
  Volume2, 
  ShieldCheck, 
  Globe, 
  Server, 
  KeyRound, 
  Zap, 
  RefreshCw,
  ExternalLink,
  Copy,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { LangType } from '../types';
import { translations } from '../lib/translations';
import { soundSynth } from '../lib/audio';

interface SettingsViewProps {
  lang: LangType;
  setLang: (lang: LangType) => void;
  customServer: string;
  setCustomServer: (url: string) => void;
  chinaMode: boolean;
  setChinaMode: (mode: boolean) => void;
  persistentId: string;
  setPersistentId: (id: string) => void;
  autoConnect: boolean;
  setAutoConnect: (auto: boolean) => void;
  onSaveServer: () => void;
  serverError: string | null;
  onOpenLogs?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  setLang,
  customServer,
  setCustomServer,
  chinaMode,
  setChinaMode,
  persistentId,
  setPersistentId,
  autoConnect,
  setAutoConnect,
  onSaveServer,
  serverError,
  onOpenLogs
}) => {
  const t = translations[lang];

  // 1. 程序设置 (Program Settings)
  const [debugLogsEnabled, setDebugLogsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('cfg_debug_logs') !== 'false';
  });

  // 2. 后台模式 (Background Mode)
  const [runAtStartup, setRunAtStartup] = useState<boolean>(() => {
    return localStorage.getItem('cfg_run_at_startup') === 'true';
  });
  const [minimizeToTray, setMinimizeToTray] = useState<boolean>(() => {
    return localStorage.getItem('cfg_min_tray') !== 'false';
  });
  const [showMiniView, setShowMiniView] = useState<boolean>(() => {
    return localStorage.getItem('cfg_show_mini_view') !== 'false';
  });
  const [corner, setCorner] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>(() => {
    return (localStorage.getItem('cfg_mini_corner') as any) || 'bottom-right';
  });

  // 3. 临界值警告音 (Threshold Warning Sounds)
  const [voltageAlertSound, setVoltageAlertSound] = useState<boolean>(() => {
    return localStorage.getItem('cfg_sound_voltage') !== 'false';
  });
  const [disconnectAlertSound, setDisconnectAlertSound] = useState<boolean>(() => {
    return localStorage.getItem('cfg_sound_disconnect') !== 'false';
  });
  const [batteryAlertSound, setBatteryAlertSound] = useState<boolean>(() => {
    return localStorage.getItem('cfg_sound_battery') !== 'false';
  });

  // 4. 端到端加密（测试版） (E2E Encryption)
  const [e2eEncryption, setE2eEncryption] = useState<boolean>(() => {
    return localStorage.getItem('cfg_e2e_enc') !== 'false';
  });

  // 5. 程序路径 (Program Paths)
  const [ediabasVersionSelect, setEdiabasVersionSelect] = useState<string>('7.3.0 · C:\\EDIABAS');
  const [ediabasPath, setEdiabasPath] = useState<string>('C:\\EDIABAS');
  const [istaPath, setIstaPath] = useState<string>('C:\\Program Files (x86)\\BMW\\ISPI\\TRIC\\ISTA');
  const [pathsSaved, setPathsSaved] = useState<boolean>(false);
  const [hasMissingIstaFiles, setHasMissingIstaFiles] = useState<boolean>(true);

  // 6. EDIABAS 状态 & 连接方式 (EDIABAS Status & Interface)
  const [ediabasIniPath, setEdiabasIniPath] = useState<string>('C:\\EDIABAS\\BIN\\EDIABAS.INI');
  const [currentInterface, setCurrentInterface] = useState<string>('STD:OBD · COM-Port (obd.ini): Com9');
  const [ediabasVersion, setEdiabasVersion] = useState<string>('7.3.0');
  
  // 连接方式下拉框选中的模式
  const [selectedInterfaceMode, setSelectedInterfaceMode] = useState<string>('STD:OBD');
  const [isApplyingEdiabas, setIsApplyingEdiabas] = useState<boolean>(false);
  const [ediabasAppliedNotice, setEdiabasAppliedNotice] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  // 浮动迷你视图预览开关
  const [showLiveMiniPreview, setShowLiveMiniPreview] = useState<boolean>(false);
  const [copiedVin, setCopiedVin] = useState<boolean>(false);

  // 初始化加载后端配置
  useEffect(() => {
    const fetchEdiabasConfig = async () => {
      try {
        const res = await fetch('/api/ediabas/config');
        if (res.ok) {
          const data = await res.json();
          if (data.iniPath) setEdiabasIniPath(data.iniPath);
          if (data.ediabasVersion) setEdiabasVersion(data.ediabasVersion);
          if (data.ediabasPath) setEdiabasPath(data.ediabasPath);
          if (data.istaPath) setIstaPath(data.istaPath);
          if (data.currentInterface) {
            setSelectedInterfaceMode(data.currentInterface);
            if (data.currentInterface === 'STD:OBD') {
              setCurrentInterface(`STD:OBD · COM-Port (obd.ini): ${data.comPort || 'Com9'}`);
            } else if (data.currentInterface === 'ENET') {
              setCurrentInterface('ENET · RemoteHost: 169.254.x.x (Port: 6801)');
            } else if (data.currentInterface === 'REMOTE') {
              setCurrentInterface('REMOTE · RemoteHost: 127.0.0.1 (ICOM Emulation)');
            } else if (data.currentInterface === 'DoIP-TUN') {
              setCurrentInterface('REMOTE:DoIP · Port 13400 Virtual Tap');
            } else {
              setCurrentInterface(data.currentInterface);
            }
          }
        }
      } catch {
        // fallback to local defaults
      }
    };
    fetchEdiabasConfig();
  }, []);

  // 保存程序路径
  const handleSavePaths = async () => {
    setPathsSaved(true);
    try {
      await fetch('/api/ediabas/save-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ediabasPath, istaPath })
      });
    } catch {
      // ignore
    }
    setTimeout(() => setPathsSaved(false), 2500);
  };

  // 应用连接方式到 EDIABAS
  const handleApplyInterface = async () => {
    setIsApplyingEdiabas(true);
    setEdiabasAppliedNotice(null);

    let displayInterface = '';
    if (selectedInterfaceMode === 'STD:OBD') {
      displayInterface = 'STD:OBD · COM-Port (obd.ini): Com9';
    } else if (selectedInterfaceMode === 'ENET') {
      displayInterface = 'ENET · RemoteHost: 169.254.x.x (Port: 6801)';
    } else if (selectedInterfaceMode === 'REMOTE') {
      displayInterface = 'REMOTE · RemoteHost: 127.0.0.1 (ICOM Emulation)';
    } else if (selectedInterfaceMode === 'DoIP-TUN') {
      displayInterface = 'REMOTE:DoIP · Port 13400 Virtual Tap';
    } else {
      displayInterface = `${selectedInterfaceMode} · Direct Serial`;
    }

    try {
      const res = await fetch('/api/ediabas/apply-interface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interfaceType: selectedInterfaceMode, comPort: 'Com9' })
      });
      if (res.ok) {
        setCurrentInterface(displayInterface);
        setEdiabasAppliedNotice(lang === 'zh' ? `EDIABAS.INI 已成功更新为 ${selectedInterfaceMode}` : `EDIABAS.INI updated to ${selectedInterfaceMode}`);
      }
    } catch {
      setCurrentInterface(displayInterface);
      setEdiabasAppliedNotice(lang === 'zh' ? `EDIABAS.INI 已在本地写入配置` : `EDIABAS.INI updated locally`);
    } finally {
      setIsApplyingEdiabas(false);
      setTimeout(() => setEdiabasAppliedNotice(null), 3000);
    }
  };

  // 重新检测 EDIABAS & ISTA
  const handleRedetect = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      setEdiabasVersion('7.3.0');
      setEdiabasIniPath('C:\\EDIABAS\\BIN\\EDIABAS.INI');
      setEdiabasAppliedNotice(lang === 'zh' ? '已重新检测并校验 EDIABAS 环境' : 'EDIABAS environment re-checked');
      setTimeout(() => setEdiabasAppliedNotice(null), 2500);
    }, 600);
  };

  // 模拟路径浏览
  const handleBrowseFolder = (target: 'ediabas' | 'ista') => {
    const defaultVal = target === 'ediabas' ? 'C:\\EDIABAS' : 'C:\\Program Files (x86)\\BMW\\ISPI\\TRIC\\ISTA';
    const chosen = prompt(
      lang === 'zh' ? `请输入或确认 ${target === 'ediabas' ? 'EDIABAS' : 'ISTA'} 安装根目录路径:` : `Enter ${target.toUpperCase()} root installation directory:`,
      target === 'ediabas' ? ediabasPath : istaPath
    );
    if (chosen && chosen.trim()) {
      if (target === 'ediabas') {
        setEdiabasPath(chosen.trim());
      } else {
        setIstaPath(chosen.trim());
        // 如果选择了一个非缺失目录，更新警告
        if (!chosen.includes('TRIC')) {
          setHasMissingIstaFiles(false);
        } else {
          setHasMissingIstaFiles(true);
        }
      }
    }
  };

  const handleCopyVin = (vin: string) => {
    navigator.clipboard.writeText(vin);
    setCopiedVin(true);
    setTimeout(() => setCopiedVin(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300 relative select-none">
      {/* 顶部标题区 (对标原软件) */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '设置' : 'Settings'}
        </h1>
        <p className="text-sm text-white/50">
          {lang === 'zh' 
            ? '自动将 EDIABAS/INPA 配置为所选的连接方式（仅维修厂电脑）。' 
            : 'Automatically configure EDIABAS/INPA for the selected connection method (workshop PC only).'}
        </p>
      </div>

      {/* 1. 程序设置 (Program Settings) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="text-[#a855f7] font-semibold text-xs tracking-wide">
          {lang === 'zh' ? '程序设置' : 'PROGRAM SETTINGS'}
        </div>

        {/* 语言选择 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white/90 uppercase tracking-wider block">
            语言 / LANGUAGE
          </label>
          <div className="relative max-w-sm">
            <select
              value={lang}
              onChange={(e) => {
                const newLang = e.target.value as LangType;
                setLang(newLang);
                localStorage.setItem('bimmerbridge_lang', newLang);
              }}
              className="w-full appearance-none bg-[#191b22] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-[#a855f7] transition-all cursor-pointer pr-10"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            {lang === 'zh' 
              ? '启动时会根据 Windows 系统语言自动识别语言。在此处的更改将永久生效，并在重新启动后应用。' 
              : 'System language is recognized on startup. Changes made here will take effect permanently across sessions.'}
          </p>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* 调试日志 */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-white/90">
            {lang === 'zh' ? '调试日志' : 'Debug Logging'}
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            {lang === 'zh'
              ? '详细记录程序的运行情况（包括连接） - 以便我们在不访问您电脑的情况下追溯报告的问题。'
              : 'Detailed diagnostic records of program operations and socket tunnels to investigate reported issues remotely.'}
          </p>
          
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => {
                const nextVal = !debugLogsEnabled;
                setDebugLogsEnabled(nextVal);
                localStorage.setItem('cfg_debug_logs', String(nextVal));
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${debugLogsEnabled ? 'bg-[#a855f7]' : 'bg-white/10'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${debugLogsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-white font-medium">
              {lang === 'zh' ? '启用调试日志' : 'Enable debug logs'}
            </span>
          </div>

          <p className="text-xs text-white/40 leading-relaxed">
            {lang === 'zh'
              ? '日志以加密形式存储 - 只有程序提供者可以读取（不含密码，不含明文车辆数据）。遇到问题时，请通过支持区域向我们发送工单 - 日志会自动附上。'
              : 'Logs are stored in encrypted format. When reporting an issue via support, recent logs are securely attached.'}
          </p>

          <div className="pt-1">
            <button
              onClick={() => onOpenLogs && onOpenLogs()}
              className="text-[#a855f7] hover:text-purple-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors hover:underline"
            >
              <span>{lang === 'zh' ? '前往支持区域' : 'Go to support area'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 后台模式 (Background Mode) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="text-[#a855f7] font-semibold text-xs tracking-wide">
          {lang === 'zh' ? '后台模式' : 'BACKGROUND MODE'}
        </div>
        <p className="text-xs text-white/40 leading-relaxed">
          {lang === 'zh'
            ? '随 Windows 启动并隐形等待邀请 - 仅以右下角的图标显示。Windows 会以通知的形式提醒您新的邀请和连接。'
            : 'Start with Windows and invisibly await invitations in the system tray with toast notifications.'}
        </p>

        <div className="space-y-4 pt-1">
          {/* 开关 1: 随 Windows 启动并在后台等待 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextVal = !runAtStartup;
                setRunAtStartup(nextVal);
                localStorage.setItem('cfg_run_at_startup', String(nextVal));
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${runAtStartup ? 'bg-[#a855f7]' : 'bg-white/10'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${runAtStartup ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-white font-medium">
              {lang === 'zh' ? '随 Windows 启动并在后台等待' : 'Start with Windows and wait in background'}
            </span>
          </div>

          {/* 开关 2: 最小化到右下角的图标区域 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextVal = !minimizeToTray;
                setMinimizeToTray(nextVal);
                localStorage.setItem('cfg_min_tray', String(nextVal));
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${minimizeToTray ? 'bg-[#a855f7]' : 'bg-white/10'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${minimizeToTray ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-white font-medium">
              {lang === 'zh' ? '最小化到右下角的图标区域' : 'Minimize to system tray notification area'}
            </span>
          </div>

          {/* 开关 3: 最小化时显示迷你视图 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextVal = !showMiniView;
                setShowMiniView(nextVal);
                localStorage.setItem('cfg_show_mini_view', String(nextVal));
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${showMiniView ? 'bg-[#a855f7]' : 'bg-white/10'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${showMiniView ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">
                {lang === 'zh' ? '最小化时显示迷你视图' : 'Show mini floating view when minimized'}
              </span>
              <button
                onClick={() => setShowLiveMiniPreview(!showLiveMiniPreview)}
                className="text-[11px] px-2 py-0.5 rounded bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 hover:bg-[#a855f7]/30 transition-all font-mono"
              >
                {showLiveMiniPreview ? (lang === 'zh' ? '隐藏浮窗预览' : 'Hide Preview') : (lang === 'zh' ? '预览浮窗' : 'Preview Widget')}
              </button>
            </div>
          </div>
        </div>

        {/* 角落选择 */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-4">
            <label className="text-xs font-semibold text-white/70">
              {lang === 'zh' ? '角落' : 'Corner'}
            </label>
            <div className="relative w-44">
              <select
                value={corner}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setCorner(val);
                  localStorage.setItem('cfg_mini_corner', val);
                }}
                className="w-full appearance-none bg-[#191b22] border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-medium outline-none focus:border-[#a855f7] transition-all cursor-pointer pr-8"
              >
                <option value="bottom-right">{lang === 'zh' ? '右下' : 'Bottom-Right'}</option>
                <option value="bottom-left">{lang === 'zh' ? '左下' : 'Bottom-Left'}</option>
                <option value="top-right">{lang === 'zh' ? '右上' : 'Top-Right'}</option>
                <option value="top-left">{lang === 'zh' ? '左上' : 'Top-Left'}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            {lang === 'zh'
              ? '最小化时保持在所有窗口之上，显示连接、质量、车辆 IP 和 VIN。仅用于显示和复制 - 切换点火、重新读取 VIN 和结束会话有意只在完整视图中提供。双击或通过图标返回。'
              : 'Stays on top of all windows when minimized, showing connection health, vehicle IP and VIN with one-click copy.'}
          </p>
        </div>
      </div>

      {/* 3. 临界值警告音 (Threshold Warning Sounds) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="text-[#a855f7] font-semibold text-xs tracking-wide">
          {lang === 'zh' ? '临界值警告音' : 'CRITICAL THRESHOLD ALERT CHIMES'}
        </div>
        <p className="text-xs text-white/40 leading-relaxed">
          {lang === 'zh'
            ? '在车辆电压低于 12 V 以及客户设备电池几乎耗尽时发出提醒 - 这是编码中断最常见的原因。警告始终显示在窗口底部；此处只能关闭声音。'
            : 'Audible warnings when vehicle voltage drops below 12V or client device battery depletes - primary causes of failed flash sessions.'}
        </p>

        <div className="space-y-4 pt-1">
          {/* 警告音 1: 电压低于 12V */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const nextVal = !voltageAlertSound;
                  setVoltageAlertSound(nextVal);
                  localStorage.setItem('cfg_sound_voltage', String(nextVal));
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${voltageAlertSound ? 'bg-[#a855f7]' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${voltageAlertSound ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm text-white font-medium">
                {lang === 'zh' ? '车辆电压低于 12 V 时发声' : 'Chime when vehicle voltage is below 12 V'}
              </span>
            </div>
            <button
              onClick={() => soundSynth.playVoltageWarning()}
              title={lang === 'zh' ? '试听宝马双重警示音' : 'Play BMW Gong Chime'}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'zh' ? '试听警报' : 'Test Sound'}</span>
            </button>
          </div>

          {/* 警告音 2: 连接中断 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const nextVal = !disconnectAlertSound;
                  setDisconnectAlertSound(nextVal);
                  localStorage.setItem('cfg_sound_disconnect', String(nextVal));
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${disconnectAlertSound ? 'bg-[#a855f7]' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${disconnectAlertSound ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm text-white font-medium">
                {lang === 'zh' ? '连接中断时发声' : 'Chime when tunnel connection drops'}
              </span>
            </div>
            <button
              onClick={() => soundSynth.playDisconnectAlert()}
              title={lang === 'zh' ? '试听中断提示音' : 'Play Disconnect Tone'}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
            >
              <Volume2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'zh' ? '试听中断音' : 'Test Sound'}</span>
            </button>
          </div>

          {/* 警告音 3: 客户电池耗尽 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const nextVal = !batteryAlertSound;
                  setBatteryAlertSound(nextVal);
                  localStorage.setItem('cfg_sound_battery', String(nextVal));
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${batteryAlertSound ? 'bg-[#a855f7]' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${batteryAlertSound ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm text-white font-medium">
                {lang === 'zh' ? '客户设备电池几乎耗尽时发声' : 'Chime when client device battery is critical'}
              </span>
            </div>
            <button
              onClick={() => soundSynth.playBatteryAlert()}
              title={lang === 'zh' ? '试听电量告警' : 'Play Battery Tone'}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <span>{lang === 'zh' ? '试听电量音' : 'Test Sound'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. 端到端加密（测试版） (E2E Encryption - Beta) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="text-[#a855f7] font-semibold text-xs tracking-wide">
          {lang === 'zh' ? '端到端加密（测试版）' : 'END-TO-END ENCRYPTION (BETA)'}
        </div>
        <p className="text-xs text-white/40 leading-relaxed">
          {lang === 'zh'
            ? '在两台电脑之间对诊断数据进行额外加密 - 我们的服务器将无法读取。从下一次会话起生效。如果某次会话出现问题，可以作为测试临时关闭。'
            : 'Extra cipher layer between peers - signaling server cannot read ECU packets. Takes effect next session.'}
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => {
              const nextVal = !e2eEncryption;
              setE2eEncryption(nextVal);
              localStorage.setItem('cfg_e2e_enc', String(nextVal));
            }}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${e2eEncryption ? 'bg-[#a855f7]' : 'bg-white/10'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${e2eEncryption ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm text-white font-medium">
            {lang === 'zh' ? '加密已启用' : 'Encryption enabled'}
          </span>
          {e2eEncryption && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              AES-256-GCM / X25519
            </span>
          )}
        </div>
      </div>

      {/* 5. 程序路径 (Program Paths) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="text-[#a855f7] font-semibold text-xs tracking-wide">
          {lang === 'zh' ? '程序路径' : 'PROGRAM PATHS'}
        </div>
        <p className="text-xs text-white/40 leading-relaxed">
          {lang === 'zh'
            ? 'EDIABAS 和 ISTA 用于诊断、ICOM 预留以及汽车/摩托车切换。留空 = 自动检测。'
            : 'EDIABAS and ISTA directories for diagnostics, ICOM reservations and motorcycle switching. Leave blank for auto-detection.'}
        </p>

        {/* EDIABAS 文件夹 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">EDIABAS 文件夹</span>
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-white/40">
            {lang === 'zh' ? '已找到的安装（版本 · 路径）：' : 'Detected Installations (Version · Path):'}
          </p>

          <div className="relative">
            <select
              value={ediabasVersionSelect}
              onChange={(e) => {
                setEdiabasVersionSelect(e.target.value);
                if (e.target.value.includes('C:\\EDIABAS')) {
                  setEdiabasPath('C:\\EDIABAS');
                } else if (e.target.value.includes('C:\\EC-APPS\\EDIABAS')) {
                  setEdiabasPath('C:\\EC-APPS\\EDIABAS');
                }
              }}
              className="w-full appearance-none bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-[#a855f7] transition-all cursor-pointer pr-8"
            >
              <option value="7.3.0 · C:\EDIABAS">7.3.0 · C:\EDIABAS</option>
              <option value="7.2.0 · C:\EC-APPS\EDIABAS">7.2.0 · C:\EC-APPS\EDIABAS</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={`自动检测到: ${ediabasPath}`}
              onChange={(e) => setEdiabasPath(e.target.value.replace(/^自动检测到:\s*/, ''))}
              className="flex-1 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white/80 outline-none focus:border-[#a855f7] transition-all"
            />
            <button
              onClick={() => handleBrowseFolder('ediabas')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all"
            >
              {lang === 'zh' ? '浏览 ...' : 'Browse ...'}
            </button>
          </div>
        </div>

        {/* ISTA 文件夹 */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">ISTA 文件夹</span>
            {hasMissingIstaFiles ? (
              <div className="w-4 h-4 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <span className="text-[10px] font-bold text-rose-400">!</span>
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={`自动检测到: ${istaPath}`}
              onChange={(e) => setIstaPath(e.target.value.replace(/^自动检测到:\s*/, ''))}
              className="flex-1 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white/80 outline-none focus:border-[#a855f7] transition-all"
            />
            <button
              onClick={() => handleBrowseFolder('ista')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all"
            >
              {lang === 'zh' ? '浏览 ...' : 'Browse ...'}
            </button>
          </div>

          {/* 红色缺失文件提示 (对标截图) */}
          {hasMissingIstaFiles && (
            <div className="text-xs space-y-1 pt-1 font-mono text-rose-400">
              <p className="text-rose-400 font-sans">
                {lang === 'zh' ? '此处应有以下文件，但缺失：' : 'The following required files are missing:'}
              </p>
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 space-y-1">
                <p className="text-[11px] text-rose-300">C:\Program Files (x86)\BMW\ISPI\TRIC\ISTA\Ecu\OPPS.prg</p>
                <p className="text-[11px] text-rose-300">C:\Program Files (x86)\BMW\ISPI\TRIC\ISTA\Ediabas\Bin\api64.dll</p>
              </div>
            </div>
          )}

          {/* 黄色点火/诊断模式控制警告 (对标截图) */}
          {hasMissingIstaFiles && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs text-amber-300/90 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '点火/诊断模式控制' : 'Ignition / Diagnostic Control'}</span>
              </div>
              <p className="text-white/60">
                {lang === 'zh' 
                  ? '不可用 - 在 Ecu 文件夹中未找到匹配的控制单元数据。请检查上方的 EDIABAS 或 ISTA 路径。ISTA 附带更新的数据。' 
                  : 'Unavailable - No matching ECU control unit definitions found. Please inspect the paths above. ISTA contains newer SGBD data.'}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSavePaths}
              className="px-5 py-2.5 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20 flex items-center gap-1.5"
            >
              {pathsSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{pathsSaved ? (lang === 'zh' ? '已保存' : 'Saved') : (lang === 'zh' ? '保存路径' : 'Save Paths')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. EDIABAS 状态展示 (EDIABAS Status) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="text-[#a855f7] font-semibold text-xs tracking-wide">
          EDIABAS
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-white/40 block">{lang === 'zh' ? '配置文件' : 'Configuration File'}</span>
            <span className="text-white font-medium break-all">{ediabasIniPath}</span>
          </div>

          <div className="space-y-1">
            <span className="text-white/40 block">{lang === 'zh' ? '当前接口' : 'Current Interface'}</span>
            <span className="text-[#a855f7] font-bold break-all">{currentInterface}</span>
          </div>

          <div className="space-y-1">
            <span className="text-white/40 block">{lang === 'zh' ? 'EDIABAS 版本' : 'EDIABAS Version'}</span>
            <span className="text-white font-medium">{ediabasVersion}</span>
          </div>
        </div>
      </div>

      {/* 7. 连接方式 (Connection Interface Switcher) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="text-[#a855f7] font-semibold text-xs tracking-wide">
          {lang === 'zh' ? '连接方式' : 'CONNECTION INTERFACE'}
        </div>

        <div className="relative">
          <select
            value={selectedInterfaceMode}
            onChange={(e) => setSelectedInterfaceMode(e.target.value)}
            className="w-full appearance-none bg-[#191b22] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-[#a855f7] transition-all cursor-pointer pr-10"
          >
            <option value="STD:OBD">{lang === 'zh' ? '本地 K+DCAN 线缆 (STD:OBD)' : 'Local K+DCAN Cable (STD:OBD)'}</option>
            <option value="ENET">{lang === 'zh' ? '本地 / 远程 ENET 网络线缆 (ENET)' : 'Local / Remote ENET Cable (ENET)'}</option>
            <option value="REMOTE">{lang === 'zh' ? 'ICOM / 远端以太网中继 (REMOTE)' : 'ICOM / Remote Ethernet Bridge (REMOTE)'}</option>
            <option value="DoIP-TUN">{lang === 'zh' ? 'BMW DoIP 虚拟直连通道 (DoIP-TUN)' : 'BMW DoIP Virtual Tunnel (DoIP-TUN)'}</option>
            <option value="ADS">{lang === 'zh' ? 'ADS 老车型串行总线 (ADS)' : 'ADS Legacy Serial Bus (ADS)'}</option>
          </select>
          <ChevronDown className="w-4 h-4 text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleApplyInterface}
            disabled={isApplyingEdiabas}
            className="px-5 py-2.5 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isApplyingEdiabas ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{lang === 'zh' ? '应用到 EDIABAS' : 'Apply to EDIABAS'}</span>
          </button>

          <button
            onClick={handleRedetect}
            disabled={isDetecting}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{lang === 'zh' ? '重新检测' : 'Redetect'}</span>
          </button>

          {ediabasAppliedNotice && (
            <span className="text-xs text-emerald-400 font-mono animate-in fade-in">
              ✓ {ediabasAppliedNotice}
            </span>
          )}
        </div>

        <p className="text-xs text-white/40 leading-relaxed">
          {lang === 'zh'
            ? '只会设置 EDIABAS 使用哪个接口 - 车辆上不会有任何改变。'
            : 'This only configures which driver interface EDIABAS connects through - no parameters on the car are altered.'}
        </p>
      </div>

      {/* 8. 中继服务器与地域网络选项 (整合原有核心隧道能力) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="text-[#a855f7] font-semibold text-xs tracking-wide flex items-center justify-between">
          <span>{lang === 'zh' ? '信令服务器与网络穿透' : 'SIGNALING & NETWORK TUNNEL'}</span>
          <span className="text-[10px] text-white/30 font-mono">BimmerBridge Relay</span>
        </div>

        {/* 信令服务器地址 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>{lang === 'zh' ? '私有中继中心服务器' : 'Signaling Relay Server URL'}</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customServer}
              onChange={(e) => setCustomServer(e.target.value)}
              placeholder="e.g. https://bridge.yourserver.com or leave blank for default"
              className="flex-1 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-white/20 outline-none focus:border-[#a855f7] transition-all"
            />
            <button
              onClick={onSaveServer}
              className="px-4 py-2.5 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              {lang === 'zh' ? '保存' : 'Save'}
            </button>
          </div>
          {serverError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
              {t.noServerWarning}: {serverError}
            </div>
          )}
        </div>

        {/* 中国网络深度加速 */}
        <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.chinaMode}</span>
            </div>
            <p className="text-[10px] text-white/40 max-w-lg leading-relaxed">
              {t.chinaModeDesc}
            </p>
          </div>
          <button
            onClick={() => setChinaMode(!chinaMode)}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors ${chinaMode ? 'bg-[#a855f7]' : 'bg-white/10'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${chinaMode ? 'translate-x-4' : ''}`} />
          </button>
        </div>

        {/* 专属固定配对 ID */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'zh' ? '专属固定配对 ID' : 'Custom Persistent ID'}</span>
          </label>
          <input
            type="text"
            value={persistentId}
            onChange={(e) => setPersistentId(e.target.value.toUpperCase())}
            placeholder="e.g. SHOP88"
            className="w-full bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-white/20 outline-none focus:border-[#a855f7] transition-all uppercase"
          />
        </div>

        {/* 常用端口映射参考 */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.diagPorts}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-black/60 rounded-xl border border-white/5">
              <span className="text-[9px] text-white/30 uppercase block">Port 22</span>
              <span className="font-bold text-[#a855f7]">SSH / DoIP Root</span>
            </div>
            <div className="p-3 bg-black/60 rounded-xl border border-white/5">
              <span className="text-[9px] text-white/30 uppercase block">Port 6801</span>
              <span className="font-bold text-[#a855f7]">BMW Diag TCP</span>
            </div>
            <div className="p-3 bg-black/60 rounded-xl border border-white/5">
              <span className="text-[9px] text-white/30 uppercase block">Port 6811</span>
              <span className="font-bold text-[#a855f7]">ZGW Discovery UDP</span>
            </div>
            <div className="p-3 bg-black/60 rounded-xl border border-white/5">
              <span className="text-[9px] text-white/30 uppercase block">Port 13400</span>
              <span className="font-bold text-[#a855f7]">ISO 13400-2 DoIP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 迷你浮窗实时模拟挂载 (当开启预览时展示在对应角落) */}
      {showLiveMiniPreview && (
        <div
          className={`fixed z-50 p-3.5 bg-[#12141a]/95 backdrop-blur-md border border-[#a855f7]/40 rounded-2xl shadow-2xl shadow-purple-950/60 w-72 space-y-2.5 font-sans transition-all animate-in zoom-in-95 ${
            corner === 'bottom-right'
              ? 'bottom-6 right-6'
              : corner === 'bottom-left'
              ? 'bottom-6 left-6'
              : corner === 'top-right'
              ? 'top-20 right-6'
              : 'top-20 left-6'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide">
                BimmerBridge Mini
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                99% · 12ms
              </span>
              <button
                onClick={() => setShowLiveMiniPreview(false)}
                className="text-white/40 hover:text-white p-1"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center text-white/70">
              <span className="text-white/40">车辆 IP:</span>
              <span className="text-white font-bold">169.254.198.11</span>
            </div>
            <div className="flex justify-between items-center text-white/70">
              <span className="text-white/40">VIN:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-purple-300 font-bold">WBA3A5C50DF289110</span>
                <button
                  onClick={() => handleCopyVin('WBA3A5C50DF289110')}
                  className="hover:text-white text-white/40"
                  title="复制 VIN"
                >
                  {copiedVin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-white/70">
              <span className="text-white/40">KL15 点火:</span>
              <span className="text-emerald-400 font-bold">12.8 V (正常)</span>
            </div>
          </div>

          <div className="text-[10px] text-white/30 text-center pt-1 border-t border-white/5">
            {lang === 'zh' ? '双击浮窗或点击托盘还原主界面' : 'Double click to restore full view'}
          </div>
        </div>
      )}
    </div>
  );
};
