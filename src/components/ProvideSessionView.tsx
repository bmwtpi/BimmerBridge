import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Monitor, 
  Plus, 
  Clock, 
  CalendarClock,
  History,
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Key, 
  Copy, 
  Check, 
  ExternalLink, 
  Wifi, 
  Laptop, 
  Trash2, 
  Send, 
  Radio, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  Maximize2,
  Minimize2,
  Terminal,
  Activity,
  Info,
  Server,
  Globe,
  Settings,
  Sliders,
  Shield,
  Zap
} from 'lucide-react';
import { LangType, Session, ConnectionMode } from '../types';

interface PastClient {
  id: string;
  name: string;
  countryFlag: string;
  online: boolean;
  hasSavedEmail: boolean;
  sessionCount: number;
  lastSessionTime: string;
  email?: string;
}

export interface RelayServerConfig {
  id: string;
  name: string;
  countryName: string;
  flagType: 'de' | 'cn' | 'hk' | 'sg' | 'us' | 'custom';
  endpoint: string;
  port: number;
  protocol: 'WSS' | 'TCP' | 'QUIC';
  pingMs: number;
  status: 'connected' | 'optimal' | 'standby';
  isCustom?: boolean;
}

interface ProvideSessionViewProps {
  lang: LangType;
  sessions: Session[];
  onCreateSession: (customCode?: string, email?: string) => Promise<string | undefined>;
  onDeleteSession: (id: string) => void;
  onOpenChat?: (session: Session) => void;
  onSwitchToTech?: () => void;
  connectionMode?: ConnectionMode;
  programName?: string;
  accentColor?: string;
}

export const ProvideSessionView: React.FC<ProvideSessionViewProps> = ({
  lang,
  sessions,
  onCreateSession,
  onDeleteSession,
  onOpenChat,
  onSwitchToTech,
  connectionMode = 'p2p',
  programName = '泰兴悦之宝',
  accentColor = '#A855F7'
}) => {
  // 顶部大 Tab：'coding' (远程编码) | 'control' (远程控制)
  const [sessionSubTab, setSessionSubTab] = useState<'coding' | 'control'>('coding');

  // 创建新会话表单输入 (远程编码)
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  // 远程编码创建成功后的会话状态 (默认 null 展现第一张图，点击创建后展现第二张图)
  const [activeCodingSession, setActiveCodingSession] = useState<{
    code: string;
    email?: string;
  } | null>(null);
  const [copiedCodingCode, setCopiedCodingCode] = useState<boolean>(false);
  const [copiedCodingLink, setCopiedCodingLink] = useState<boolean>(false);
  const [showCreatedToast, setShowCreatedToast] = useState<boolean>(false);

  // 预留中继服务器对接状态 (对标截图 2: 已找到最佳服务器 德国)
  const [relayServers, setRelayServers] = useState<RelayServerConfig[]>([
    {
      id: 'de-frankfurt',
      name: '德国法兰克福核心节点 (Frankfurt Core DE-01)',
      countryName: '德国',
      flagType: 'de',
      endpoint: 'wss://de-relay.remoteservice.app/mesh',
      port: 8443,
      protocol: 'WSS',
      pingMs: 32,
      status: 'optimal'
    },
    {
      id: 'cn-beijing',
      name: '中国大陆内网专线节点 (China BGP Relay)',
      countryName: '中国大陆',
      flagType: 'cn',
      endpoint: 'wss://cn-relay.autotool.cloud/mesh',
      port: 443,
      protocol: 'WSS',
      pingMs: 18,
      status: 'connected'
    },
    {
      id: 'hk-edge',
      name: '中国香港 CN2-GIA 专线节点 (Hong Kong Edge)',
      countryName: '中国香港',
      flagType: 'hk',
      endpoint: 'wss://hk.remoteservice.app/mesh',
      port: 8443,
      protocol: 'WSS',
      pingMs: 42,
      status: 'connected'
    },
    {
      id: 'sg-singapore',
      name: '新加坡亚太中枢节点 (Singapore SG-01)',
      countryName: '新加坡',
      flagType: 'sg',
      endpoint: 'wss://sg.remoteservice.app/mesh',
      port: 8443,
      protocol: 'WSS',
      pingMs: 65,
      status: 'standby'
    },
    {
      id: 'us-east',
      name: '美国东部专线节点 (US East VA-01)',
      countryName: '美国',
      flagType: 'us',
      endpoint: 'wss://us.remoteservice.app/mesh',
      port: 8443,
      protocol: 'WSS',
      pingMs: 142,
      status: 'standby'
    }
  ]);
  const [selectedRelayServerId, setSelectedRelayServerId] = useState<string>('de-frankfurt');
  const [showServerConfigModal, setShowServerConfigModal] = useState<boolean>(false);
  const [isServerConnecting, setIsServerConnecting] = useState<boolean>(false);
  const [serverConnectionAlive, setServerConnectionAlive] = useState<boolean>(true);

  // 自定义私有中继服务器配置字段 (预留真实对接)
  const [customRelayHost, setCustomRelayHost] = useState<string>('relay.mybmwworkshop.com');
  const [customRelayPort, setCustomRelayPort] = useState<string>('8443');
  const [customRelayToken, setCustomRelayToken] = useState<string>('sec_live_9a8f7c6e5d4c3b2a');
  const [customRelayProto, setCustomRelayProto] = useState<'WSS' | 'TCP' | 'QUIC'>('WSS');
  const [customRelayPing, setCustomRelayPing] = useState<number | null>(null);
  const [isTestingPing, setIsTestingPing] = useState<boolean>(false);

  // 当前激活的服务器节点配置 (对标截图 2 默认德国)
  const selectedRelayServer = relayServers.find(s => s.id === selectedRelayServerId) || relayServers[0];

  // 远程控制专属状态 (对标截图 2: 启动后的界面)
  const [isRemoteControlActive, setIsRemoteControlActive] = useState<boolean>(true);
  const [remoteControlCode, setRemoteControlCode] = useState<string>('928U-YMT6');
  const [copiedRcCode, setCopiedRcCode] = useState<boolean>(false);
  const [copiedRcLink, setCopiedRcLink] = useState<boolean>(false);
  const [isRcConnected, setIsRcConnected] = useState<boolean>(false);
  const [showRcDesktopModal, setShowRcDesktopModal] = useState<boolean>(false);

  // 折叠卡片状态 (按截图 1：过往会话和计划中默认收起，保持视觉精简整洁)
  const [isPastSessionsOpen, setIsPastSessionsOpen] = useState<boolean>(false);
  const [isScheduledSessionsOpen, setIsScheduledSessionsOpen] = useState<boolean>(false);

  // 过往会话客户列表 (默认展示截图中的 LAPTOP-1KVSHUQ1)
  const [pastClients, setPastClients] = useState<PastClient[]>(() => {
    const saved = localStorage.getItem('cfg_past_clients');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'client-1',
        name: 'LAPTOP-1KVSHUQ1',
        countryFlag: '🇺🇸',
        online: true,
        hasSavedEmail: true,
        sessionCount: 2,
        lastSessionTime: '04.09.2026 10:08',
        email: 'client@workshop-remote.com'
      }
    ];
  });

  // 编辑客户备注名称
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editingClientName, setEditingClientName] = useState<string>('');

  // 邀请发送反馈
  const [reinviteSuccessNotice, setReinviteSuccessNotice] = useState<string | null>(null);

  // 持久化过往客户
  useEffect(() => {
    localStorage.setItem('cfg_past_clients', JSON.stringify(pastClients));
  }, [pastClients]);

  // 生成规范的 8 位会话码 (4-4 格式，如 77JM-3HQS)
  const generateCodingSessionCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${p1}-${p2}`;
  };

  // 处理创建远程编码新会话 (点击后进入截图 2 状态)
  const handleCreateNewSession = async () => {
    setIsCreating(true);
    setIsServerConnecting(true);
    try {
      // 模拟与服务器建立并注册会话
      const newCode = await onCreateSession(undefined, customerEmail.trim() || undefined);
      // 优先采用 77JM-3HQS 或随机生成的大号会话码
      const code = newCode || (Math.random() > 0.5 ? '77JM-3HQS' : generateCodingSessionCode());
      setActiveCodingSession({
        code,
        email: customerEmail.trim() || undefined
      });
      setServerConnectionAlive(true);
      setShowCreatedToast(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
      setIsServerConnecting(false);
    }
  };

  // 放弃当前会话 (对标截图 2 最左下角【放弃】按钮，回到第一张图状态)
  const handleCancelCodingSession = () => {
    setActiveCodingSession(null);
    setShowCreatedToast(false);
    setCopiedCodingCode(false);
    setCopiedCodingLink(false);
  };

  // 测试自定义服务器连通性 (Ping Test)
  const handleTestServerPing = () => {
    setIsTestingPing(true);
    setTimeout(() => {
      setIsTestingPing(false);
      setCustomRelayPing(Math.floor(Math.random() * 20) + 16);
    }, 600);
  };

  // 复制远程编码会话码 (对标截图 3)
  const handleCopyCodingCode = () => {
    if (!activeCodingSession) return;
    navigator.clipboard.writeText(activeCodingSession.code);
    setCopiedCodingCode(true);
    setTimeout(() => setCopiedCodingCode(false), 2000);
  };

  // 复制远程编码客户链接 (对标截图 3: 复制链接)
  const handleCopyCodingLink = () => {
    if (!activeCodingSession) return;
    const link = `https://remoteservice.app/s/${activeCodingSession.code}`;
    navigator.clipboard.writeText(link);
    setCopiedCodingLink(true);
    setTimeout(() => setCopiedCodingLink(false), 2000);
  };

  // 生成新的远程控制会话码
  const generateNewRcCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${p1}-${p2}`;
  };

  // 复制远程控制会话码
  const handleCopyRcCode = () => {
    navigator.clipboard.writeText(remoteControlCode);
    setCopiedRcCode(true);
    setTimeout(() => setCopiedRcCode(false), 2000);
  };

  // 复制远程控制客户链接
  const handleCopyRcLink = () => {
    const link = `https://remoteservice.app/s/${remoteControlCode}`;
    navigator.clipboard.writeText(link);
    setCopiedRcLink(true);
    setTimeout(() => setCopiedRcLink(false), 2000);
  };

  // 处理“再次提供” (一键向老客户发起新会话邀请)
  const handleReinviteClient = async (client: PastClient) => {
    try {
      const code = await onCreateSession(undefined, client.email);
      setReinviteSuccessNotice(
        lang === 'zh'
          ? `已成功向 ${client.name} 发送直连邀请！会话码: ${code || '已就绪'}`
          : `Sent direct invitation to ${client.name}! Code: ${code || 'Ready'}`
      );
      // 更新该客户会话次数
      setPastClients(prev =>
        prev.map(c =>
          c.id === client.id
            ? { ...c, sessionCount: c.sessionCount + 1, lastSessionTime: '刚刚' }
            : c
        )
      );
      setIsScheduledSessionsOpen(true);
      setTimeout(() => {
        setReinviteSuccessNotice(null);
      }, 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // 保存客户重命名
  const handleSaveClientName = (id: string) => {
    if (editingClientName.trim()) {
      setPastClients(prev =>
        prev.map(c => (c.id === id ? { ...c, name: editingClientName.trim() } : c))
      );
    }
    setEditingClientId(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300 select-none">
      {/* 顶部 Tab 切换胶囊 (精准对标截图 1 和截图 2: 远程编码 / 远程控制) */}
      <div className="flex items-center gap-3">
        {/* 远程编码 Tab */}
        <button
          onClick={() => setSessionSubTab('coding')}
          className={`flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
            sessionSubTab === 'coding'
              ? 'bg-[#a855f7] text-white shadow-purple-600/30'
              : 'bg-[#181b22] text-white/60 hover:text-white hover:bg-[#20232d]'
          }`}
          style={sessionSubTab === 'coding' ? { backgroundColor: accentColor } : undefined}
        >
          <Car className="w-4 h-4" />
          <span>{lang === 'zh' ? '远程编码' : 'Remote Coding'}</span>
        </button>

        {/* 远程控制 Tab */}
        <button
          onClick={() => setSessionSubTab('control')}
          className={`flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
            sessionSubTab === 'control'
              ? 'bg-[#a855f7] text-white shadow-purple-600/30'
              : 'bg-[#181b22] text-white/60 hover:text-white hover:bg-[#20232d]'
          }`}
          style={sessionSubTab === 'control' ? { backgroundColor: accentColor } : undefined}
        >
          <Monitor className="w-4 h-4" />
          <span>{lang === 'zh' ? '远程控制' : 'Remote Control'}</span>
        </button>
      </div>

      {/* ===================== 视图 A: 远程编码 (对标截图 1) ===================== */}
      {sessionSubTab === 'coding' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 标题与描述 */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {lang === 'zh' ? '远程编码' : 'Remote Coding'}
            </h1>
            <p className="text-sm text-white/50">
              {lang === 'zh'
                ? '创建会话码，为客户提供远程编码会话。'
                : 'Create session code to provide remote coding sessions to customers.'}
            </p>
          </div>

          {/* ======================= 状态 1: 会话已创建视图 (100% 精准对标截图 2) ======================= */}
          {activeCodingSession ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 卡片 1: 正在创建会话 ... (对标截图 2 上部卡片) */}
              <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl flex items-center gap-3.5">
                <div 
                  className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin shrink-0"
                  style={{ borderColor: `${accentColor} transparent ${accentColor} ${accentColor}` }}
                />
                <span className="text-sm text-white/90 font-medium">
                  {lang === 'zh' ? '正在创建会话 ...' : 'Creating session ...'}
                </span>
              </div>

              {/* 卡片 2: 会话码与客户链接主卡片 (对标截图 2 中部卡片) */}
              <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
                {/* 紫色小标题 */}
                <div 
                  className="text-xs font-semibold tracking-tight"
                  style={{ color: accentColor }}
                >
                  {lang === 'zh' ? '会话码' : 'Session code'}
                </div>

                {/* 会话码展示框与复制按钮 */}
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#1c202a] border border-white/5 rounded-xl px-5 py-2.5 text-2xl font-bold font-mono text-white tracking-wider select-all shadow-inner">
                    {activeCodingSession.code}
                  </div>
                  <button
                    onClick={handleCopyCodingCode}
                    className="bg-[#1c202a] border border-white/5 hover:bg-[#252936] text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                  >
                    {copiedCodingCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-white/80" />
                    )}
                    <span>{copiedCodingCode ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制' : 'Copy')}</span>
                  </button>
                </div>

                {/* 段落说明 1 */}
                <p className="text-xs text-white/60 leading-relaxed pt-0.5">
                  {lang === 'zh'
                    ? '将此会话码告知客户 - 客户在其程序的「远程编码」下输入。然后启动主控连接；双方必须在 2 分钟内完成连接。'
                    : 'Provide this session code to the customer - customer enters it in "Remote Coding". Then start master connection; both parties must connect within 2 minutes.'}
                </p>

                {/* 客户链接 */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs text-white/60 font-normal block">
                    {lang === 'zh' ? '客户链接' : 'Customer link'}
                  </label>
                  <div className="flex items-center gap-2.5">
                    <div className="bg-[#1c202a] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-white/80 truncate flex-1 max-w-xl select-all shadow-inner">
                      https://remoteservice.app/s/{activeCodingSession.code}
                    </div>
                    <button
                      onClick={handleCopyCodingLink}
                      className="bg-[#1c202a] border border-white/5 hover:bg-[#252936] text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                    >
                      {copiedCodingLink ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-white/80" />
                      )}
                      <span>{copiedCodingLink ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制链接' : 'Copy link')}</span>
                    </button>
                  </div>
                </div>

                {/* 段落说明 2 */}
                <p className="text-xs text-white/50 leading-relaxed">
                  {lang === 'zh'
                    ? '一个链接搞定一切：首次使用者通过它下载内置会话码的程序，回头客则直接打开已安装的程序。'
                    : 'One link for everything: First-time users download the app with embedded code, returning customers open the installed app directly.'}
                </p>

                {/* 对标截图 2: 正在等待客户 ... 与 已找到最佳服务器 德国 */}
                <div className="pt-3 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/[0.04]">
                  {/* 左侧：正在等待客户 ... (紫色缺口旋转圆环) */}
                  <div className="flex items-center gap-3.5">
                    <div 
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin shrink-0"
                      style={{ borderColor: `${accentColor} transparent ${accentColor} ${accentColor}` }}
                    />
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white leading-tight">
                        {lang === 'zh' ? '正在等待客户 ...' : 'Waiting for customer ...'}
                      </div>
                      <div className="text-xs text-white/50 leading-tight">
                        {lang === 'zh'
                          ? '客户通过您的链接进行连接。最多等待 10 分钟。'
                          : 'Customer connects via your link. Waiting up to 10 minutes.'}
                      </div>
                    </div>
                  </div>

                  {/* 右侧：已找到最佳服务器 德国 (对标截图 2 紫色发光边框小卡片，支持点击配置) */}
                  <button
                    onClick={() => setShowServerConfigModal(true)}
                    className="bg-[#161822] border border-[#a855f7]/60 hover:border-[#a855f7] rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-[0_0_15px_rgba(168,85,247,0.18)] transition-all shrink-0 group self-start sm:self-auto text-left active:scale-95"
                    title={lang === 'zh' ? '点击配置与对接中继服务器' : 'Configure Relay Server'}
                  >
                    {/* 国旗：德国国旗 (高保真黑红黄三色旗) 或对应选中的服务器国旗 */}
                    {selectedRelayServer.flagType === 'de' ? (
                      <div className="w-6 h-4 rounded-[2px] overflow-hidden flex flex-col shadow-sm shrink-0 border border-white/15">
                        <div className="w-full h-1/3 bg-black"></div>
                        <div className="w-full h-1/3 bg-[#DD0000]"></div>
                        <div className="w-full h-1/3 bg-[#FFCC00]"></div>
                      </div>
                    ) : selectedRelayServer.flagType === 'cn' ? (
                      <div className="w-6 h-4 rounded-[2px] overflow-hidden bg-[#de2910] flex items-center justify-center shadow-sm shrink-0 border border-white/15 text-[9px] text-[#ffde00] font-bold">
                        ★
                      </div>
                    ) : selectedRelayServer.flagType === 'hk' ? (
                      <div className="w-6 h-4 rounded-[2px] overflow-hidden bg-[#de2910] flex items-center justify-center shadow-sm shrink-0 border border-white/15 text-[8px] text-white">
                        🇭🇰
                      </div>
                    ) : (
                      <div className="w-6 h-4 rounded-[2px] overflow-hidden bg-purple-900/60 flex items-center justify-center shadow-sm shrink-0 border border-white/15 text-purple-300">
                        <Server className="w-3 h-3" />
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="text-[13px] font-bold text-white group-hover:text-purple-300 transition-colors leading-tight">
                        {lang === 'zh' ? '已找到最佳服务器' : 'Optimal server found'}
                      </div>
                      <div className="text-[11px] text-white/60 leading-tight">
                        {selectedRelayServer.countryName}
                      </div>
                    </div>
                  </button>
                </div>

                {/* 对标截图 2: 最下方【放弃】按钮 */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleCancelCodingSession}
                    className="bg-[#242733] hover:bg-[#2e3344] text-white/90 text-xs px-5 py-2 rounded-lg transition-colors border border-white/5 shadow-sm active:scale-95 font-medium"
                  >
                    {lang === 'zh' ? '放弃' : 'Cancel'}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowServerConfigModal(true)}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '服务器对接配置' : 'Relay Server Setup'}</span>
                    </button>

                    {!showCreatedToast && (
                      <button
                        onClick={() => setShowCreatedToast(true)}
                        className="text-[11px] text-sky-400/80 hover:text-sky-300 underline transition-all"
                      >
                        {lang === 'zh' ? '显示提示条' : 'Show banner'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================= 状态 2: 初始创建表单 (对标截图 1) ======================= */
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
              {/* + 创建新会话 按钮 */}
              <div>
                <button
                  onClick={handleCreateNewSession}
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  style={{ 
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 25px -5px ${accentColor}40`
                  }}
                >
                  {isCreating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  )}
                  <span>{lang === 'zh' ? '创建新会话' : 'Create New Session'}</span>
                </button>
              </div>

              {/* 客户电子邮件（可选） */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 block">
                  {lang === 'zh' ? '客户电子邮件（可选）' : 'Customer Email (Optional)'}
                </label>

                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full max-w-md bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#a855f7] transition-all"
                />

                <p className="text-xs text-white/40 leading-relaxed max-w-2xl">
                  {lang === 'zh'
                    ? '如果客户在其程序中保存了此电子邮件，会话会自动以邀请的形式出现在那里 - 无需会话码。'
                    : 'If the customer saved this email in their software, the session appears automatically as an invite there - no code needed.'}
                </p>
              </div>
            </div>
          )}

          {/* 再次提供反馈提示条 */}
          {reinviteSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{reinviteSuccessNotice}</span>
              </div>
              <button 
                onClick={() => setReinviteSuccessNotice(null)} 
                className="text-white/40 hover:text-white"
              >
                ×
              </button>
            </div>
          )}

          {/* 卡片 2: 过往会话 (对标截图 1: 带向下的折叠箭头，可展开查看) */}
          <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
            {/* 卡片头部与折叠切换 */}
            <div 
              onClick={() => setIsPastSessionsOpen(!isPastSessionsOpen)}
              className="flex items-start justify-between cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-white/80">
                  <History className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {lang === 'zh' ? '过往会话' : 'Past Sessions'}
                  </div>
                  <p className="text-xs text-white/40 pt-0.5">
                    {lang === 'zh'
                      ? '一键邀请曾经的客户加入新会话 - 无需新会话码即可加入。'
                      : 'One-click invite previous clients to a new session - join without a new code.'}
                  </p>
                </div>
              </div>

              <button className="text-white/40 hover:text-white p-1">
                {isPastSessionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* 展开内容 */}
            {isPastSessionsOpen && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                {pastClients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-[#191b22] border border-white/[0.06] hover:border-white/15 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    {/* 左侧设备与客户信息 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{client.countryFlag}</span>
                        
                        {editingClientId === client.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingClientName}
                              onChange={(e) => setEditingClientName(e.target.value)}
                              className="bg-[#0e1015] border border-[#a855f7] rounded px-2 py-0.5 text-xs text-white outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveClientName(client.id)}
                              className="text-[11px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/20"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-white tracking-wide">
                            {client.name}
                          </span>
                        )}

                        {editingClientId !== client.id && (
                          <button
                            onClick={() => {
                              setEditingClientId(client.id);
                              setEditingClientName(client.name);
                            }}
                            className="text-white/30 hover:text-white/70 p-0.5 transition-colors"
                            title={lang === 'zh' ? '编辑别名' : 'Edit alias'}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}

                        {/* 在线状态 */}
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium ml-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{lang === 'zh' ? '在线' : 'Online'}</span>
                        </span>
                      </div>

                      {/* 次级信息 */}
                      <div className="text-xs text-white/50 flex items-center gap-2">
                        <span>
                          {client.hasSavedEmail
                            ? (lang === 'zh' ? '已保存电子邮件' : 'Saved email')
                            : (lang === 'zh' ? '未保存邮箱' : 'No email')}
                        </span>
                        <span>·</span>
                        <span>
                          {client.sessionCount} {lang === 'zh' ? '次会话' : 'sessions'}
                        </span>
                      </div>

                      {/* 时间 */}
                      <div className="text-[11px] font-mono text-white/40">
                        {client.lastSessionTime}
                      </div>
                    </div>

                    {/* 右侧：再次提供 按钮 */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleReinviteClient(client)}
                        className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>{lang === 'zh' ? '再次提供' : 'Provide Again'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 卡片 3: 计划中和进行中的会话 (对标截图 1: 带向下的折叠箭头，可展开查看) */}
          <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
            {/* 卡片头部与折叠切换 */}
            <div 
              onClick={() => setIsScheduledSessionsOpen(!isScheduledSessionsOpen)}
              className="flex items-start justify-between cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-white/80">
                  <CalendarClock className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {lang === 'zh' ? '计划中和进行中的会话' : 'Scheduled & Ongoing Sessions'}
                  </div>
                  <p className="text-xs text-white/40 pt-0.5">
                    {lang === 'zh'
                      ? '提前为客户提供预约：链接会立即发送，连接会在预约时间前 15 分钟自动开放。'
                      : 'Offer appointments in advance: Links sent instantly, connection opens 15 min before.'}
                  </p>
                </div>
              </div>

              <button className="text-white/40 hover:text-white p-1">
                {isScheduledSessionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* 展开内容 */}
            {isScheduledSessionsOpen && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                {sessions.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#191b22]/60 border border-white/5 text-center space-y-2">
                    <span className="text-xs text-white/40 block">
                      {lang === 'zh' ? '当前暂无进行中或预约的会话。点击上方「创建新会话」即可发起。' : 'No active or scheduled sessions. Click "Create New Session" above.'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="bg-[#191b22] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-mono font-bold text-[#a855f7] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                              {sess.code}
                            </span>

                            <span className="text-xs font-bold text-white">
                              {sess.carConnected ? (lang === 'zh' ? '车辆已连接' : 'Car Connected') : (lang === 'zh' ? '等待车辆端输入' : 'Waiting for client')}
                            </span>

                            <span className={`w-2 h-2 rounded-full ${sess.carConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                          </div>

                          <div className="text-[11px] text-white/50 flex items-center gap-2">
                            {sess.carVin && <span>VIN: {sess.carVin}</span>}
                            {sess.carIp && <span>IP: {sess.carIp}</span>}
                            <span>{lang === 'zh' ? '模式' : 'Mode'}: {connectionMode.toUpperCase()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {onOpenChat && (
                            <button
                              onClick={() => onOpenChat(sess)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-all"
                            >
                              {lang === 'zh' ? '会话对讲' : 'Chat'}
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteSession(sess.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-medium transition-all"
                          >
                            {lang === 'zh' ? '结束' : 'End'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== 视图 B: 远程控制 (100% 精准对标截图 2) ===================== */}
      {sessionSubTab === 'control' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 标题与描述 (对标截图 2) */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {lang === 'zh' ? '远程控制' : 'Remote Control'}
            </h1>
            <p className="text-sm text-white/50">
              {lang === 'zh'
                ? '连接到客户的电脑 - 即使没有进行中的远程编码会话（例如用于设置和技术支持）。'
                : 'Connect to the customer\'s computer - even without an ongoing remote coding session (e.g. for setup and support).'}
            </p>
          </div>

          {/* 启动后的卡片 (对标截图 2) */}
          {isRemoteControlActive ? (
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
              {/* 紫色小标题 */}
              <div 
                className="text-xs font-semibold tracking-tight"
                style={{ color: accentColor }}
              >
                {lang === 'zh' ? '将链接交给客户' : 'Give the link to the customer'}
              </div>

              {/* 说明段落 */}
              <p className="text-xs text-white/60 -mt-2">
                {lang === 'zh'
                  ? '将此链接发送给客户。客户在 Connect 中打开它并确认一次连接。'
                  : 'Send this link to the customer. The customer opens it in Connect and confirms the connection once.'}
              </p>

              {/* 会话码区 (对标截图 2: 会话码 + 928U-YMT6 + 复制按钮) */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 font-normal block">
                  {lang === 'zh' ? '会话码' : 'Session code'}
                </label>
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#1c202a] border border-white/5 rounded-xl px-5 py-2.5 text-xl font-bold font-mono text-white tracking-wide select-all shadow-inner">
                    {remoteControlCode}
                  </div>
                  <button
                    onClick={handleCopyRcCode}
                    className="bg-[#1c202a] border border-white/5 hover:bg-[#252936] text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    {copiedRcCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedRcCode
                        ? (lang === 'zh' ? '已复制' : 'Copied')
                        : (lang === 'zh' ? '复制' : 'Copy')}
                    </span>
                  </button>
                </div>
              </div>

              {/* 客户链接区 (对标截图 2: 客户链接 + https://remoteservice.app/s/928U-YMT6 + 复制按钮) */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 font-normal block">
                  {lang === 'zh' ? '客户链接' : 'Customer link'}
                </label>
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#1c202a] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-white/90 truncate max-w-md select-all shadow-inner">
                    https://remoteservice.app/s/{remoteControlCode}
                  </div>
                  <button
                    onClick={handleCopyRcLink}
                    className="bg-[#1c202a] border border-white/5 hover:bg-[#252936] text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                  >
                    {copiedRcLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedRcLink
                        ? (lang === 'zh' ? '已复制' : 'Copied')
                        : (lang === 'zh' ? '复制' : 'Copy')}
                    </span>
                  </button>
                </div>
              </div>

              {/* 等待中动画与提示 (对标截图 2: 紫色缺口圆环旋转 + 正在等待客户同意 ...) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2.5 text-xs text-white/90">
                  <div 
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin shrink-0"
                    style={{ borderColor: `${accentColor} transparent ${accentColor} ${accentColor}` }}
                  />
                  <span>
                    {lang === 'zh' ? '正在等待客户同意 ...' : 'Waiting for customer approval ...'}
                  </span>
                </div>
                <p className="text-xs text-white/40">
                  {lang === 'zh'
                    ? '出于安全原因，链接仅在短时间内有效（约 15 分钟）。'
                    : 'For security reasons, the link is only valid for a short time (approx. 15 minutes).'}
                </p>
              </div>

              {/* 取消按钮与模拟直通 (对标截图 2: 带有 [✕ 取消]) */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsRemoteControlActive(false)}
                  className="bg-[#1c202a] border border-white/10 hover:bg-[#242834] text-xs text-white/80 hover:text-white px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '取消' : 'Cancel'}</span>
                </button>

                {/* 辅助交互：允许技师一键模拟客户同意，打开远程控制桌面体验 */}
                <button
                  onClick={() => {
                    setIsRcConnected(true);
                    setShowRcDesktopModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Monitor className="w-3.5 h-3.5 text-purple-400" />
                  <span>{lang === 'zh' ? '模拟客户同意并接管桌面' : 'Simulate approval & control'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* 取消后的待启动状态卡片 */
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
              <div className="space-y-1.5">
                <div className="text-sm font-semibold text-white">
                  {lang === 'zh' ? '准备发起远程控制' : 'Ready to start remote control'}
                </div>
                <p className="text-xs text-white/60 leading-relaxed max-w-2xl">
                  {lang === 'zh'
                    ? '点击下方按钮将重新生成唯一的远程控制专属安全链接与会话码。客户在任何浏览器或 Connect 端确认后，您即可直接对其实施远程桌面协助。'
                    : 'Click the button below to generate a new secure remote control link and session code. Once approved by the customer, remote desktop support begins.'}
                </p>
              </div>
              <div>
                <button
                  onClick={() => {
                    setRemoteControlCode(generateNewRcCode());
                    setIsRemoteControlActive(true);
                  }}
                  className="px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{lang === 'zh' ? '启动远程控制' : 'Start Remote Control'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= 服务器中继对接与链路诊断弹窗 (预留真实服务器对接) ======================= */}
      {showServerConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#141720] border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            {/* 顶栏 */}
            <div className="bg-[#1c202d] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-white font-medium">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm">
                  {lang === 'zh' ? '中继服务器对接与通信状态' : 'Relay Server & Tunnel Config'}
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {lang === 'zh' ? '已自动连接' : 'Auto-Connected'}
                </span>
              </div>
              <button
                onClick={() => setShowServerConfigModal(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* 当前连接概览卡片 */}
              <div className="bg-[#0e1017] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {selectedRelayServer.flagType === 'de' ? (
                    <div className="w-8 h-5 rounded overflow-hidden flex flex-col shadow border border-white/15 shrink-0">
                      <div className="w-full h-1/3 bg-black"></div>
                      <div className="w-full h-1/3 bg-[#DD0000]"></div>
                      <div className="w-full h-1/3 bg-[#FFCC00]"></div>
                    </div>
                  ) : (
                    <div className="w-8 h-5 rounded bg-purple-600/30 flex items-center justify-center text-xs font-bold text-white border border-white/15 shrink-0">
                      ★
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedRelayServer.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-normal">
                        {lang === 'zh' ? '当前最佳节点' : 'Optimal'}
                      </span>
                    </div>
                    <div className="text-xs text-white/50 font-mono mt-0.5">
                      {selectedRelayServer.endpoint}:{selectedRelayServer.port} · Ping: {selectedRelayServer.pingMs}ms · {selectedRelayServer.protocol}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {lang === 'zh' ? '链路通畅 · 握手正常' : 'Tunnel Healthy'}
                  </span>
                </div>
              </div>

              {/* 官方全球分布式节点列表 */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 block">
                  {lang === 'zh' ? '智能中继服务器选路 (系统已自动为您匹配延迟最低的最佳节点)' : 'Global Distributed Relay Mesh'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {relayServers.map(server => {
                    const isCurrent = server.id === selectedRelayServerId;
                    return (
                      <button
                        key={server.id}
                        onClick={() => setSelectedRelayServerId(server.id)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-purple-950/30 border-purple-500/50 shadow-sm'
                            : 'bg-[#181b25] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {server.flagType === 'de' ? (
                            <div className="w-6 h-4 rounded-[2px] overflow-hidden flex flex-col shadow-sm shrink-0 border border-white/10">
                              <div className="w-full h-1/3 bg-black"></div>
                              <div className="w-full h-1/3 bg-[#DD0000]"></div>
                              <div className="w-full h-1/3 bg-[#FFCC00]"></div>
                            </div>
                          ) : server.flagType === 'cn' ? (
                            <div className="w-6 h-4 rounded-[2px] bg-[#de2910] text-[#ffde00] flex items-center justify-center text-[8px] font-bold shrink-0">
                              ★
                            </div>
                          ) : (
                            <div className="w-6 h-4 rounded-[2px] bg-purple-800 text-white flex items-center justify-center text-[9px] shrink-0">
                              🌐
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{server.countryName}</span>
                              {server.status === 'optimal' && (
                                <span className="text-[9px] text-purple-400">★ 最佳</span>
                              )}
                            </div>
                            <div className="text-[10px] text-white/40 truncate max-w-[170px]">
                              {server.name}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs font-mono font-bold ${
                            server.pingMs < 40 ? 'text-emerald-400' : server.pingMs < 100 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {server.pingMs}ms
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 预留自建/私有中继服务器对接设置 (企业专修店自建专网) */}
              <div className="bg-[#10121a] border border-purple-500/20 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">
                      {lang === 'zh' ? '预留私有服务器对接 (企业/专修店自建中继)' : 'Custom Private Relay Server Integration'}
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-300/80 bg-purple-500/10 px-2 py-0.5 rounded">
                    {lang === 'zh' ? '支持内网与云服务器' : 'Self-hosted Ready'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] text-white/60 block">
                      {lang === 'zh' ? '服务器地址 / 域名' : 'Server Host / IP'}
                    </label>
                    <input
                      type="text"
                      value={customRelayHost}
                      onChange={(e) => setCustomRelayHost(e.target.value)}
                      placeholder="relay.mybmwworkshop.com"
                      className="w-full bg-[#191c26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 block">
                      {lang === 'zh' ? '服务端口' : 'Port'}
                    </label>
                    <input
                      type="text"
                      value={customRelayPort}
                      onChange={(e) => setCustomRelayPort(e.target.value)}
                      placeholder="8443"
                      className="w-full bg-[#191c26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 block">
                      {lang === 'zh' ? '访问凭据 Token' : 'Access Token'}
                    </label>
                    <input
                      type="password"
                      value={customRelayToken}
                      onChange={(e) => setCustomRelayToken(e.target.value)}
                      placeholder="sec_live_..."
                      className="w-full bg-[#191c26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 block">
                      {lang === 'zh' ? '传输层协议' : 'Protocol'}
                    </label>
                    <div className="flex rounded-lg bg-[#191c26] p-1 border border-white/10 text-xs">
                      {(['WSS', 'TCP', 'QUIC'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setCustomRelayProto(p)}
                          className={`flex-1 py-1 text-center rounded font-mono font-medium transition-all ${
                            customRelayProto === p ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 测速与保存按钮 */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <button
                    onClick={handleTestServerPing}
                    disabled={isTestingPing}
                    className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isTestingPing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{lang === 'zh' ? '测试连通性与握手' : 'Test Ping & Handshake'}</span>
                    {customRelayPing !== null && (
                      <span className="text-emerald-400 font-mono ml-1">{customRelayPing}ms 正常</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      // 添加或切换至自定义服务器
                      const customId = 'custom-user-relay';
                      const updated = [...relayServers.filter(s => s.id !== customId), {
                        id: customId,
                        name: customRelayHost,
                        countryName: lang === 'zh' ? '私有服务器' : 'Custom Server',
                        flagType: 'custom' as const,
                        endpoint: customRelayHost,
                        port: parseInt(customRelayPort) || 8443,
                        protocol: customRelayProto,
                        pingMs: customRelayPing || 20,
                        status: 'optimal' as const,
                        isCustom: true
                      }];
                      setRelayServers(updated);
                      setSelectedRelayServerId(customId);
                      setShowServerConfigModal(false);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    {lang === 'zh' ? '保存并设为当前中继' : 'Save & Connect'}
                  </button>
                </div>
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="bg-[#1c202d] px-5 py-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-[11px] text-white/40">
                {lang === 'zh'
                  ? '系统已与云端分布式中继自动保持心跳包通信'
                  : 'Heartbeat protocol active with distributed cloud relay'}
              </div>
              <button
                onClick={() => setShowServerConfigModal(false)}
                className="px-5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
              >
                {lang === 'zh' ? '关闭' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模拟的远程桌面视窗 Modal (当技师连接后可真正交互体验) */}
      {showRcDesktopModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#141720] border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
            {/* 顶栏 */}
            <div className="bg-[#1e222e] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-white font-medium">
                <Monitor className="w-4 h-4 text-purple-400" />
                <span className="font-bold">Connect Remote Desktop</span>
                <span className="text-white/40">·</span>
                <span className="font-mono text-purple-400">{remoteControlCode}</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                  {lang === 'zh' ? '已接管 (60 FPS)' : 'Active (60 FPS)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRcDesktopModal(false)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 模拟客户端 Windows 诊断桌面 */}
            <div className="flex-1 bg-[#0b0c10] p-6 flex flex-col items-center justify-center text-center space-y-4 relative min-h-[380px]">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl">
                <Terminal className="w-8 h-8" />
              </div>

              <div className="space-y-1 relative z-10">
                <div className="text-sm font-bold text-white">
                  {lang === 'zh' ? '已安全连接至客户端计算机' : 'Connected to Remote Client Computer'}
                </div>
                <div className="text-xs text-white/50 max-w-md font-mono">
                  Host: LAPTOP-1KVSHUQ1 (192.168.5.23) · Ultra-low Latency (14ms)
                </div>
              </div>

              {/* 快捷诊断操作条 */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 relative z-10">
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                  {lang === 'zh' ? '键盘与鼠标同步: 已启用' : 'Mouse & Keyboard Sync: ON'}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                  {lang === 'zh' ? '剪贴板互通: 正常' : 'Clipboard: Shared'}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                  {lang === 'zh' ? 'OBD DoIP 通道: 激活' : 'OBD DoIP Tunnel: Active'}
                </span>
              </div>

              <div className="pt-4 relative z-10">
                <button
                  onClick={() => setShowRcDesktopModal(false)}
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                >
                  {lang === 'zh' ? '最小化并继续在后台维护' : 'Minimize Window'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ======================= 底部浮动通知条: 会话码已创建 (100% 精准对标截图 3) ======================= */}
      {showCreatedToast && activeCodingSession && sessionSubTab === 'coding' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-5xl z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#00a3ff] text-white rounded-xl px-5 py-3.5 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold leading-tight">
                  {lang === 'zh' ? '会话码已创建' : 'Session code created'}
                </div>
                <div className="text-xs text-white/95 leading-tight">
                  {lang === 'zh' ? '请将会话码告知客户。' : 'Please provide the session code to the customer.'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreatedToast(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
              title={lang === 'zh' ? '关闭' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
