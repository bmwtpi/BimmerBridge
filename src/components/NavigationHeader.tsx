import React from 'react';
import { 
  Cpu, 
  Car, 
  Laptop, 
  Settings as SettingsIcon, 
  Terminal, 
  LogOut, 
  ShieldCheck, 
  Monitor, 
  Wrench,
  Wifi, 
  WifiOff,
  Sparkles
} from 'lucide-react';
import { TabType, LangType, ConnectionMode } from '../types';

interface NavigationHeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lang: LangType;
  setLang: (lang: LangType) => void;
  username: string;
  isServerReady: boolean;
  connectionMode: ConnectionMode;
  onLogout: () => void;
  onOpenLogs: () => void;
  activeSessionCount: number;
  programName?: string;
  accentColor?: string;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  username,
  isServerReady,
  connectionMode,
  onLogout,
  onOpenLogs,
  activeSessionCount,
  programName = '泰兴悦之宝',
  accentColor = '#A855F7'
}) => {
  return (
    <header className="bg-[#0b0b0d] border-b border-[#222329] px-4 sm:px-6 py-2.5 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand Title & Server status */}
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/20 shadow-md"
          style={{ backgroundColor: accentColor }}
        >
          <Car className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>{programName} Connect</span>
              <span className="not-italic text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white/90">v3.26.0</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider">
              {isServerReady ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-400 font-bold">LIVE</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span className="text-amber-400 font-bold">LOCAL</span>
                </>
              )}
            </div>
            <span className="text-white/20 text-[8px]">•</span>
            <span className={`text-[8px] font-mono px-1 rounded uppercase tracking-wider ${connectionMode === 'p2p' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold' : 'bg-white/5 text-white/40'}`}>
              {connectionMode === 'p2p' ? 'P2P DIRECT' : 'RELAY'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
          title={lang === 'zh' ? '主控台' : 'Dashboard'}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'zh' ? '主控台' : 'Dashboard'}</span>
        </button>

        {/* Car Side */}
        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'downloads'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
          title={lang === 'zh' ? '车辆端' : 'Car Side'}
        >
          <Car className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'zh' ? '车辆端' : 'Car Side'}</span>
        </button>

        {/* Tech Side */}
        <button
          onClick={() => setActiveTab('tech')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tech'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
          title={lang === 'zh' ? '编程端' : 'Expert Side'}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'zh' ? '编程端' : 'Expert Side'}</span>
          {activeSessionCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          )}
        </button>

        {/* Remote Desktop (RustDesk) */}
        <button
          onClick={() => setActiveTab('remote-desktop')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'remote-desktop'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
          title={lang === 'zh' ? '远程协助 (RustDesk)' : 'Remote Desktop (RustDesk)'}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{lang === 'zh' ? '远程协助' : 'Remote Screen'}</span>
        </button>

        {/* Ediabas Diag */}
        <button
          onClick={() => setActiveTab('ediabas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ediabas'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
          title={lang === 'zh' ? 'Ediabas 诊断' : 'Ediabas Diag'}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{lang === 'zh' ? 'Ediabas 诊断' : 'Ediabas'}</span>
        </button>

        {/* Branding */}
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'branding'
              ? 'bg-[#a855f7] text-white shadow-md shadow-purple-600/30'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
          title={lang === 'zh' ? '品牌形象' : 'Branding'}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{lang === 'zh' ? '品牌形象' : 'Branding'}</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
          title={lang === 'zh' ? '设置' : 'Settings'}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{lang === 'zh' ? '设置' : 'Settings'}</span>
        </button>
      </nav>

      {/* Right Actions: Logs, Lang, User, Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Log Viewer Trigger */}
        <button
          onClick={onOpenLogs}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-mono text-white/50 hover:text-white hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1.5"
          title={lang === 'zh' ? '系统日志' : 'Logs'}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline text-[10px] uppercase font-bold tracking-wider">LOGS</span>
        </button>

        {/* Language switch */}
        <button
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          className="px-2 py-1 rounded-lg text-[10px] font-mono uppercase font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
        >
          {lang === 'zh' ? 'EN' : '中'}
        </button>

        {/* User Info */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${username || 'user'}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[11px] font-mono text-white/70 max-w-[80px] truncate">{username || 'Admin'}</span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
          title={lang === 'zh' ? '退出登录' : 'Logout'}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
