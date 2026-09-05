import React from 'react';
import {
  Car,
  Cable,
  Monitor,
  User,
  Terminal,
  Settings,
  ShoppingCart,
  HelpCircle,
  Headphones,
  Info,
  Menu,
  Palette,
  Cpu
} from 'lucide-react';
import { TabType, LangType } from '../types';

interface ConnectSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lang: LangType;
  setLang?: (lang: LangType) => void;
  onOpenLogs?: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  programName?: string;
  accentColor?: string;
  wideLogoUrl?: string;
  smallLogoUrl?: string;
  websiteUrl?: string;
}

export const ConnectSidebar: React.FC<ConnectSidebarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onOpenLogs,
  isCollapsed,
  setIsCollapsed,
  programName = '泰兴悦之宝',
  accentColor = '#A855F7',
  wideLogoUrl,
  smallLogoUrl,
  websiteUrl
}) => {
  const menuItems: {
    id: TabType;
    labelZh: string;
    labelEn: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'downloads',
      labelZh: '提供远程会话',
      labelEn: 'Provide Session',
      icon: Car
    },
    {
      id: 'connection-test',
      labelZh: '连接测试',
      labelEn: 'Connection Test',
      icon: Cable
    },
    {
      id: 'ediabas',
      labelZh: 'EDIABAS',
      labelEn: 'EDIABAS',
      icon: Cpu
    },
    {
      id: 'tech',
      labelZh: '接收远程会话',
      labelEn: 'Receive Remote Session',
      icon: Monitor
    },
    {
      id: 'account',
      labelZh: '账户',
      labelEn: 'Account',
      icon: User
    },
    {
      id: 'branding',
      labelZh: '品牌形象',
      labelEn: 'Branding',
      icon: Palette
    },
    {
      id: 'api',
      labelZh: 'API',
      labelEn: 'API',
      icon: Terminal
    },
    {
      id: 'settings',
      labelZh: '设置',
      labelEn: 'Settings',
      icon: Settings
    },
    {
      id: 'parts-requests',
      labelZh: '配件与编码申请',
      labelEn: 'Parts & Coding',
      icon: ShoppingCart
    },
    {
      id: 'help',
      labelZh: '帮助',
      labelEn: 'Help',
      icon: HelpCircle
    },
    {
      id: 'support',
      labelZh: '技术支持',
      labelEn: 'Support',
      icon: Headphones
    }
  ];

  const handleLogoClick = () => {
    if (websiteUrl) {
      window.open(websiteUrl, '_blank');
    } else {
      setActiveTab('help');
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-56'
      } bg-[#0f121a] border-r border-[#1e2332] flex flex-col shrink-0 select-none transition-all duration-300 z-30`}
    >
      {/* 顶部 Connect Logo 区域 (高度还原截图) */}
      <div className="pt-3 px-3 pb-2 flex flex-col items-center">
        {!isCollapsed ? (
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer group mb-3 w-full px-1"
            title={websiteUrl ? `访问 ${websiteUrl}` : 'Connect'}
          >
            {wideLogoUrl ? (
              <img src={wideLogoUrl} alt="Logo" className="h-8 max-w-[160px] object-contain" />
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="relative w-7 h-7 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-7 h-7 drop-shadow-md">
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
                <span className="text-xl font-bold text-white tracking-tight leading-none font-sans lowercase">
                  onnect
                </span>
              </div>
            )}
          </div>
        ) : (
          <div 
            onClick={handleLogoClick}
            className="cursor-pointer mx-auto flex justify-center mb-2.5"
            title={programName}
          >
            {smallLogoUrl ? (
              <img src={smallLogoUrl} alt="Icon" className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-400/40 flex items-center justify-center font-bold text-white shadow-md">
                <span className="text-xs font-mono text-cyan-400 font-black">C</span>
              </div>
            )}
          </div>
        )}

        {/* 汉堡折叠按钮 */}
        <div className={isCollapsed ? 'w-full flex justify-center' : 'w-full px-1'}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-9 h-8 rounded-lg bg-[#161a24] border border-[#262e3f] hover:border-[#384259] text-white/70 hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
            title={isCollapsed ? '展开侧栏' : '折叠侧栏'}
          >
            <Menu className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="flex-1 py-2 px-2.5 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-lg text-xs transition-all relative cursor-pointer ${
                isActive
                  ? 'bg-[#1a1e28] border border-[#2f3648] text-white font-medium shadow-sm'
                  : 'border border-transparent text-[#9ca3af] hover:text-white hover:bg-[#151923]'
              }`}
              title={lang === 'zh' ? item.labelZh : item.labelEn}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-[#9ca3af]'
                }`}
              />
              {!isCollapsed && (
                <span className="truncate tracking-wide text-xs">
                  {lang === 'zh' ? item.labelZh : item.labelEn}
                </span>
              )}
            </button>
          );
        })}

        {/* 分割线 */}
        <div className="my-2 border-t border-[#1e2332] mx-1" />

        {/* 关于 (底部 Info) */}
        <button
          onClick={() => setActiveTab('about')}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
          } py-2.5 rounded-lg text-xs transition-all relative cursor-pointer ${
            activeTab === 'about'
              ? 'bg-[#1a1e28] border border-[#2f3648] text-white font-medium shadow-sm'
              : 'border border-transparent text-[#9ca3af] hover:text-white hover:bg-[#151923]'
          }`}
          title={lang === 'zh' ? '关于' : 'About'}
        >
          {activeTab === 'about' && (
            <span
              className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
              style={{ backgroundColor: accentColor }}
            />
          )}
          <Info
            className={`w-4 h-4 shrink-0 ${
              activeTab === 'about' ? 'text-white' : 'text-white/50'
            }`}
          />
          {!isCollapsed && (
            <span className="truncate tracking-wide text-xs">
              {lang === 'zh' ? '关于' : 'About'}
            </span>
          )}
        </button>

        {/* 底部辅助工具 (语言切换与调试日志) */}
        {(setLang || onOpenLogs) && (
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-around gap-1 text-[11px] text-white/40">
            {setLang && (
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors font-mono cursor-pointer"
                title={lang === 'zh' ? '切换为英文 (Switch to English)' : '切换为中文'}
              >
                {lang === 'zh' ? 'EN' : '中文'}
              </button>
            )}
            {onOpenLogs && (
              <button
                onClick={onOpenLogs}
                className="hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors font-mono cursor-pointer"
                title={lang === 'zh' ? '查看调试日志' : 'View Debug Logs'}
              >
                &gt;_
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
