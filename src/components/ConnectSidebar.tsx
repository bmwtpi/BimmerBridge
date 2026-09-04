import React from 'react';
import {
  Car,
  Link2,
  Cast,
  User,
  Monitor,
  CreditCard,
  Settings,
  ShoppingBag,
  HelpCircle,
  MessageSquare,
  Info,
  Menu
} from 'lucide-react';
import { TabType, LangType } from '../types';

interface ConnectSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lang: LangType;
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
      labelEn: 'Provide Remote Session',
      icon: Car
    },
    {
      id: 'connection-test',
      labelZh: '连接测试',
      labelEn: 'Connection Test',
      icon: Link2
    },
    {
      id: 'tech',
      labelZh: '接收远程会话',
      labelEn: 'Receive Remote Session',
      icon: Cast
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
      icon: Monitor
    },
    {
      id: 'api',
      labelZh: 'API',
      labelEn: 'API',
      icon: CreditCard
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
      labelEn: 'Parts & Coding Request',
      icon: ShoppingBag
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
      icon: MessageSquare
    }
  ];

  const handleLogoClick = () => {
    if (websiteUrl) {
      window.open(websiteUrl, '_blank');
    } else {
      setActiveTab('branding');
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-56 sm:w-60'
      } bg-[#0c0d12] border-r border-white/[0.06] flex flex-col shrink-0 select-none transition-all duration-300 z-30`}
    >
      {/* 顶部 Connect Logo 区域 (高度还原截图) */}
      <div className="pt-4 px-4 pb-2">
        {!isCollapsed ? (
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer group mb-3"
            title={websiteUrl ? `访问 ${websiteUrl}` : 'Connect'}
          >
            {wideLogoUrl ? (
              <img src={wideLogoUrl} alt="Logo" className="h-9 max-w-[170px] object-contain" />
            ) : (
              <div className="flex items-center gap-1.5">
                {/* 科技风格立体 C 徽标 */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-8 h-8 drop-shadow-md">
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
                <span className="text-2xl font-black text-white tracking-tight leading-none font-sans lowercase">
                  onnect
                </span>
              </div>
            )}
          </div>
        ) : (
          <div 
            onClick={handleLogoClick}
            className="cursor-pointer mx-auto flex justify-center mb-3"
            title={programName}
          >
            {smallLogoUrl ? (
              <img src={smallLogoUrl} alt="Icon" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-400/40 flex items-center justify-center font-bold text-white shadow-md">
                <span className="text-sm font-mono text-cyan-400 font-black">C</span>
              </div>
            )}
          </div>
        )}

        {/* 汉堡折叠按钮 (对标截图中在 Logo 下方的独立小方块按钮) */}
        <div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg bg-[#141720] border border-white/10 hover:border-white/20 text-white/60 hover:text-white flex items-center justify-center transition-all shadow-sm"
            title={isCollapsed ? '展开菜单' : '收起菜单'}
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
              } py-2.5 rounded-xl text-xs transition-all relative ${
                isActive
                  ? 'bg-[#1a1d26] text-white border border-white/10 border-b-2 border-b-[#a855f7] shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
              title={lang === 'zh' ? item.labelZh : item.labelEn}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-white/60'
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
        <div className="my-2 border-t border-white/[0.06] mx-2" />

        {/* 关于 */}
        <button
          onClick={() => setActiveTab('about')}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
          } py-2.5 rounded-xl text-xs transition-all relative ${
            activeTab === 'about'
              ? 'bg-[#1a1d26] text-white border border-white/10 border-b-2 border-b-[#a855f7] shadow-sm font-semibold'
              : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
          }`}
          title={lang === 'zh' ? '关于' : 'About'}
        >
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
      </div>
    </aside>
  );
};
