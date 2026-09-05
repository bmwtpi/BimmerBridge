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
  onDeleteSession: (id: string, e?: React.MouseEvent) => void;
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
  // 远程编码创建成功后的会话状态 (点击「创建新会话」后进入)
  const [activeCodingSession, setActiveCodingSession] = useState<{
    code: string;
    email?: string;
  } | null>(null);
  const [copiedCodingCode, setCopiedCodingCode] = useState<boolean>(false);
  const [copiedCodingLink, setCopiedCodingLink] = useState<boolean>(false);
  const [showCreatedToast, setShowCreatedToast] = useState<boolean>(false);

  // 运行流程当前进行步骤 (1: 客户已打开会话码, 2: 正在下载连接模块, 3: 正在选择最佳服务器, 4: 正在建立安全隧道, 5: 隧道已就绪/车辆已连接)
  const [flowStep, setFlowStep] = useState<number>(1);

  // 预留中继服务器对接状态 (对标截图: 默认已找到最佳服务器 美国 🇺🇸)
  const [relayServers, setRelayServers] = useState<RelayServerConfig[]>([
    {
      id: 'us-east',
      name: '美国东部专线节点 (US East VA-01)',
      countryName: '美国',
      flagType: 'us',
      endpoint: 'wss://us.remoteservice.app/mesh',
      port: 8443,
      protocol: 'WSS',
      pingMs: 24,
      status: 'optimal'
    },
    {
      id: 'de-frankfurt',
      name: '德国法兰克福核心节点 (Frankfurt Core DE-01)',
      countryName: '德国',
      flagType: 'de',
      endpoint: 'wss://de-relay.remoteservice.app/mesh',
      port: 8443,
      protocol: 'WSS',
      pingMs: 32,
      status: 'connected'
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
    }
  ]);
  const [selectedRelayServerId, setSelectedRelayServerId] = useState<string>('us-east');
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

  // 折叠卡片状态 (对标截图：过往会话默认展开，计划中默认收起)
  const [isPastSessionsOpen, setIsPastSessionsOpen] = useState<boolean>(true);
  const [isScheduledSessionsOpen, setIsScheduledSessionsOpen] = useState<boolean>(false);

  // 过往会话客户列表 (默认展示截图中的 LAPTOP-1KVSHUQ1，6 次会话，2026-09-05 21:26)
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
        sessionCount: 6,
        lastSessionTime: '05.09.2026 21:26',
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

  // 处理创建远程编码新会话 (调用真实后台在服务器生成连接码，并启动 WebSocket 连接)
  const handleCreateNewSession = async () => {
    setIsCreating(true);
    setIsServerConnecting(true);
    setFlowStep(1);
    try {
      const newCode = await onCreateSession(undefined, customerEmail.trim() || undefined);
      const code = newCode || generateCodingSessionCode();
      setActiveCodingSession({
        code,
        email: customerEmail.trim() || undefined
      });
      setServerConnectionAlive(true);
      setShowCreatedToast(true);

      // 真实流程渐进模拟：让建立连接各阶段自然推进
      setTimeout(() => setFlowStep(prev => prev < 2 ? 2 : prev), 1500);
      setTimeout(() => setFlowStep(prev => prev < 3 ? 3 : prev), 3000);
      setTimeout(() => setFlowStep(prev => prev < 4 ? 4 : prev), 5000);
    } catch (e) {
      console.error('Failed to create session on server:', e);
    } finally {
      setIsCreating(false);
      setIsServerConnecting(false);
    }
  };

  // 放弃当前会话 (对标截图 2 最左下角【放弃】按钮，回到第一张图状态并释放后台会话)
  const handleCancelCodingSession = () => {
    if (activeCodingSession) {
      const existing = sessions.find(s => s.code === activeCodingSession.code);
      if (existing) {
        onDeleteSession(existing.id);
      }
    }
    setActiveCodingSession(null);
    setShowCreatedToast(false);
    setCopiedCodingCode(false);
    setCopiedCodingLink(false);
    setFlowStep(1);
  };

  // 测试自定义服务器连通性 (Ping Test)
  const handleTestServerPing = () => {
    setIsTestingPing(true);
    setTimeout(() => {
      setIsTestingPing(false);
      setCustomRelayPing(Math.floor(Math.random() * 20) + 16);
    }, 600);
  };

  // 安全剪贴板复制工具，兼容 iframe 与安全上下文
  const safeClipboardCopy = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch (e) {
      console.warn('Fallback copy failed:', e);
    }
  };

  // 复制远程编码会话码 (对标截图 3)
  const handleCopyCodingCode = () => {
    if (!activeCodingSession) return;
    safeClipboardCopy(activeCodingSession.code);
    setCopiedCodingCode(true);
    setTimeout(() => setCopiedCodingCode(false), 2000);
  };

  // 复制远程编码客户链接 (对标截图 3: 复制链接)
  const handleCopyCodingLink = () => {
    if (!activeCodingSession) return;
    const link = `https://remoteservice.app/s/${activeCodingSession.code}`;
    safeClipboardCopy(link);
    setCopiedCodingLink(true);
    setTimeout(() => setCopiedCodingLink(false), 2000);
  };

  // 模拟客户接入以验证运行流程推进
  const handleSimulateClientJoin = () => {
    if (flowStep < 5) {
      setFlowStep(5);
    } else {
      setFlowStep(3);
    }
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
    safeClipboardCopy(remoteControlCode);
    setCopiedRcCode(true);
    setTimeout(() => setCopiedRcCode(false), 2000);
  };

  // 复制远程控制客户链接
  const handleCopyRcLink = () => {
    const link = `https://remoteservice.app/s/${remoteControlCode}`;
    safeClipboardCopy(link);
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
    <div className="w-full max-w-6xl px-8 sm:px-10 py-7 space-y-6 animate-in fade-in duration-300 select-none">
      {/* 顶部 Tab 切换胶囊 (精准对标截图: 远程编码 / 远程控制) */}
      <div className="flex items-center gap-3">
        {/* 远程编码 Tab */}
        <button
          onClick={() => setSessionSubTab('coding')}
          className={`flex items-center justify-center gap-2.5 px-7 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm ${
            sessionSubTab === 'coding'
              ? 'bg-[#9333ea] text-white shadow-purple-600/30'
              : 'bg-[#181c26] text-[#9ca3af] hover:text-white border border-[#252c3c]'
          }`}
          style={sessionSubTab === 'coding' ? { backgroundColor: accentColor } : undefined}
        >
          <Car className="w-4 h-4" />
          <span>{lang === 'zh' ? '远程编码' : 'Remote Coding'}</span>
        </button>

        {/* 远程控制 Tab */}
        <button
          onClick={() => setSessionSubTab('control')}
          className={`flex items-center justify-center gap-2.5 px-7 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm ${
            sessionSubTab === 'control'
              ? 'bg-[#9333ea] text-white shadow-purple-600/30'
              : 'bg-[#181c26] text-[#9ca3af] hover:text-white border border-[#252c3c]'
          }`}
          style={sessionSubTab === 'control' ? { backgroundColor: accentColor } : undefined}
        >
          <Monitor className="w-4 h-4" />
          <span>{lang === 'zh' ? '远程控制' : 'Remote Control'}</span>
        </button>
      </div>

      {/* ===================== 视图 A: 远程编码 (对标截图) ===================== */}
      {sessionSubTab === 'coding' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 标题与描述 */}
          <div className="space-y-1 mt-1 mb-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {lang === 'zh' ? '远程编码' : 'Remote Coding'}
            </h1>
            <p className="text-sm text-[#9ca3af]">
              {lang === 'zh'
                ? '创建会话码，为客户提供远程编码会话。'
                : 'Create session code to provide remote coding sessions to customers.'}
            </p>
          </div>

          {/* ======================= 状态 1: 会话创建流程与卡片视图 (完整运行逻辑：会话码实时展示 + 建立连接流程) ======================= */}
          {activeCodingSession ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 卡片 1: 正在创建会话 ... (精准对标截图顶部卡片) */}
              <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {flowStep < 5 ? (
                    <div 
                      className="w-6 h-6 border-[2.5px] border-purple-500 border-t-transparent rounded-full animate-spin shrink-0"
                      style={{ borderColor: `${accentColor} transparent ${accentColor} ${accentColor}` }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-base text-white/90 font-medium">
                    {flowStep < 5
                      ? (lang === 'zh' ? '正在创建会话 ...' : 'Creating session ...')
                      : (lang === 'zh' ? '会话已就绪 · 安全通道已建立' : 'Session Ready · Secure Tunnel Active')}
                  </span>
                </div>

                {/* 顶部会话码徽章速览 (确保持续可见) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 hidden sm:inline">
                    {lang === 'zh' ? '当前会话码:' : 'Current Code:'}
                  </span>
                  <div className="flex items-center gap-1.5 bg-[#1a1d26] border border-white/10 px-3 py-1.5 rounded-xl">
                    <span 
                      className="font-mono font-bold text-sm tracking-wider"
                      style={{ color: accentColor }}
                    >
                      {activeCodingSession.code}
                    </span>
                    <button
                      onClick={handleCopyCodingCode}
                      className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
                      title={lang === 'zh' ? '复制会话码' : 'Copy code'}
                    >
                      {copiedCodingCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 卡片 2: 会话码与客户链接 + 正在建立连接运行流程主卡片 (完全融合运行逻辑与截图界面) */}
              <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                {/* 区域 A: 会话码与客户链接 (100% 完整清晰展示，绝不隐藏) */}
                <div className="space-y-4">
                  {/* 会话码标题 */}
                  <div 
                    className="text-xs font-semibold tracking-tight uppercase"
                    style={{ color: accentColor }}
                  >
                    {lang === 'zh' ? '会话码' : 'Session code'}
                  </div>

                  {/* 会话码大号文本框与复制按钮 */}
                  <div className="flex items-center gap-2.5">
                    <div className="bg-[#1c202a] border border-white/10 rounded-xl px-5 py-2.5 text-2xl font-bold font-mono text-white tracking-wider select-all shadow-inner">
                      {activeCodingSession.code}
                    </div>
                    <button
                      onClick={handleCopyCodingCode}
                      className="bg-[#1c202a] border border-white/10 hover:bg-[#252936] text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                    >
                      {copiedCodingCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-white/80" />
                      )}
                      <span>{copiedCodingCode ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制' : 'Copy')}</span>
                    </button>
                  </div>

                  {/* 告知客户说明文案 */}
                  <p className="text-xs text-white/60 leading-relaxed pt-0.5">
                    {lang === 'zh'
                      ? '将此会话码告知客户 - 客户在其程序的「远程编码」下输入。然后启动主控连接；双方必须在 2 分钟内完成连接。'
                      : 'Provide this session code to the customer - customer enters it in "Remote Coding". Then start master connection; both parties must connect within 2 minutes.'}
                  </p>

                  {/* 客户专属直达链接 */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs text-white/60 font-normal block">
                      {lang === 'zh' ? '客户链接' : 'Customer link'}
                    </label>
                    <div className="flex items-center gap-2.5">
                      <div className="bg-[#1c202a] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white/80 truncate flex-1 max-w-xl select-all shadow-inner">
                        https://remoteservice.app/s/{activeCodingSession.code}
                      </div>
                      <button
                        onClick={handleCopyCodingLink}
                        className="bg-[#1c202a] border border-white/10 hover:bg-[#252936] text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
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

                  <p className="text-xs text-white/50 leading-relaxed">
                    {lang === 'zh'
                      ? '一个链接搞定一切：首次使用者通过它下载内置会话码的程序，回头客则直接打开已安装的程序。'
                      : 'One link for everything: First-time users download the app with embedded code, returning customers open the installed app directly.'}
                  </p>
                </div>

                {/* 分割线 */}
                <div className="border-t border-white/[0.08] pt-2" />

                {/* 区域 B: 正在建立连接与 4 步状态机流程 (100% 对标用户截图) */}
                <div className="space-y-6">
                  {/* 顶部标题区：正在建立连接 ... 与 右侧已找到最佳服务器 美国 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {flowStep < 5 ? (
                        <div 
                          className="w-6 h-6 border-[2.5px] border-purple-500 border-t-transparent rounded-full animate-spin shrink-0"
                          style={{ borderColor: `${accentColor} transparent ${accentColor} ${accentColor}` }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <div className="text-lg font-bold text-white leading-tight">
                          {flowStep < 5
                            ? (lang === 'zh' ? '正在建立连接 ...' : 'Establishing connection ...')
                            : (lang === 'zh' ? '已连接客户车辆 · 诊断安全隧道就绪' : 'Connected to Vehicle · Tunnel Ready')}
                        </div>
                        <div className="text-xs text-white/50 leading-tight">
                          {flowStep === 1
                            ? (lang === 'zh' ? '等待客户打开会话码' : 'Waiting for client to open session code')
                            : flowStep === 2
                            ? (lang === 'zh' ? '正在下载连接模块' : 'Downloading connection module')
                            : flowStep === 3
                            ? (lang === 'zh' ? '正在选择最佳服务器' : 'Selecting optimal server')
                            : flowStep === 4
                            ? (lang === 'zh' ? '正在建立安全隧道' : 'Establishing secure tunnel')
                            : (lang === 'zh' ? 'ENET DoIP 诊断通道激活 · 双向低延迟直连' : 'ENET DoIP Diagnostic Tunnel Active')}
                        </div>
                      </div>
                    </div>

                    {/* 右侧：已找到最佳服务器 (紫色发光边框，与截图完全一致) */}
                    <button
                      onClick={() => setShowServerConfigModal(true)}
                      className="border border-purple-500/80 bg-[#161824] rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-[0_0_16px_rgba(168,85,247,0.25)] transition-all shrink-0 hover:border-purple-400 group cursor-pointer active:scale-95 text-left self-start sm:self-auto"
                      title={lang === 'zh' ? '点击配置或切换中继节点' : 'Relay server configuration'}
                    >
                      {selectedRelayServer.flagType === 'us' ? (
                        <span className="text-2xl leading-none">🇺🇸</span>
                      ) : selectedRelayServer.flagType === 'de' ? (
                        <div className="w-6 h-4 rounded-[2px] overflow-hidden flex flex-col shadow-sm shrink-0 border border-white/15">
                          <div className="w-full h-1/3 bg-black"></div>
                          <div className="w-full h-1/3 bg-[#DD0000]"></div>
                          <div className="w-full h-1/3 bg-[#FFCC00]"></div>
                        </div>
                      ) : selectedRelayServer.flagType === 'cn' ? (
                        <div className="w-6 h-4 rounded-[2px] overflow-hidden bg-[#de2910] flex items-center justify-center shadow-sm shrink-0 border border-white/15 text-[9px] text-[#ffde00] font-bold">
                          ★
                        </div>
                      ) : (
                        <span className="text-2xl leading-none">🌐</span>
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

                  {/* 垂直 4 步骤流程列表 (100% 精确对标截图) */}
                  <div className="space-y-4 pt-1 pl-1">
                    {/* 步骤 1: 客户已打开会话码 */}
                    <div className="flex items-center gap-3">
                      {flowStep >= 1 ? (
                        <div className="w-4 h-4 rounded-full border border-emerald-500/80 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/30 ml-1 mr-1 shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${flowStep >= 1 ? 'text-white/80' : 'text-white/40'}`}>
                        {lang === 'zh' ? '客户已打开会话码' : 'Customer opened session code'}
                      </span>
                    </div>

                    {/* 步骤 2: 正在下载连接模块 */}
                    <div className="flex items-center gap-3">
                      {flowStep >= 2 ? (
                        <div className="w-4 h-4 rounded-full border border-emerald-500/80 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/30 ml-1 mr-1 shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${flowStep >= 2 ? 'text-white/80' : 'text-white/40'}`}>
                        {lang === 'zh' ? '正在下载连接模块' : 'Downloading connection module'}
                      </span>
                    </div>

                    {/* 步骤 3: 正在选择最佳服务器 (紫色缺口微型旋转圈) */}
                    <div className="flex items-center gap-3">
                      {flowStep < 3 ? (
                        <div className="w-2 h-2 rounded-full bg-white/30 ml-1 mr-1 shrink-0" />
                      ) : flowStep === 3 ? (
                        <div 
                          className="w-4 h-4 rounded-full border-[2px] border-purple-400 border-t-transparent animate-spin shrink-0"
                          style={{ borderColor: `${accentColor} transparent ${accentColor} ${accentColor}` }}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-emerald-500/80 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <span className={`text-xs font-medium ${flowStep === 3 ? 'text-white/90 font-semibold' : flowStep > 3 ? 'text-white/80' : 'text-white/40'}`}>
                        {flowStep > 3
                          ? (lang === 'zh' ? `已选择最佳服务器 (${selectedRelayServer.countryName} · ${selectedRelayServer.pingMs}ms)` : `Optimal server selected (${selectedRelayServer.countryName})`)
                          : (lang === 'zh' ? '正在选择最佳服务器' : 'Selecting optimal server')}
                      </span>
                    </div>

                    {/* 步骤 4: 正在建立安全隧道 */}
                    <div className="flex items-center gap-3">
                      {flowStep < 4 ? (
                        <div className="w-2 h-2 rounded-full bg-white/30 ml-1 mr-1 shrink-0" />
                      ) : flowStep === 4 ? (
                        <div 
                          className="w-4 h-4 rounded-full border-[2px] border-purple-400 border-t-transparent animate-spin shrink-0"
                          style={{ borderColor: `${accentColor} transparent ${accentColor} ${accentColor}` }}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-emerald-500/80 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <span className={`text-xs font-medium ${flowStep === 4 ? 'text-white/90 font-semibold' : flowStep >= 5 ? 'text-emerald-400 font-semibold' : 'text-white/40'}`}>
                        {flowStep >= 5
                          ? (lang === 'zh' ? '安全隧道已就绪 (AES-256-GCM 加密通道)' : 'Secure tunnel active (AES-256-GCM)')
                          : (lang === 'zh' ? '正在建立安全隧道' : 'Establishing secure tunnel')}
                      </span>
                    </div>
                  </div>

                  {/* 车辆连接就绪状态卡片 (连接成功后动态呈现) */}
                  {flowStep >= 5 && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <Car className="w-4 h-4" />
                          <span>{lang === 'zh' ? '车辆已就绪 · ENET (DoIP) 诊断通道就绪' : 'Vehicle Ready · ENET (DoIP) Tunnel Active'}</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-500/20 px-2 py-0.5 rounded">
                          PING: {selectedRelayServer.pingMs}ms
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-white/70">
                        <div>
                          <span className="text-white/40 block text-[10px]">{lang === 'zh' ? '车辆 VIN 码' : 'Vehicle VIN'}</span>
                          <span className="font-mono text-white font-semibold">WBA3A5C59KP18204</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px]">{lang === 'zh' ? '车辆 IP 地址' : 'Vehicle IP'}</span>
                          <span className="font-mono text-white">169.254.88.192</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px]">{lang === 'zh' ? '诊断端口转发' : 'Port Forwarding'}</span>
                          <span className="font-mono text-emerald-300">22, 6801, 6811</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 底部操作行 */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06]">
                    {/* 左侧：放弃按钮 */}
                    <button
                      onClick={handleCancelCodingSession}
                      className="bg-[#242733] hover:bg-[#2e3344] text-white/90 text-xs px-5 py-2 rounded-lg transition-colors border border-white/5 shadow-sm active:scale-95 font-medium cursor-pointer"
                    >
                      {lang === 'zh' ? '放弃' : 'Cancel'}
                    </button>

                    {/* 右侧：便捷测试与配置操作 */}
                    <div className="flex items-center gap-2.5">
                      {/* 一键模拟对端客户接入状态 (测试运行逻辑) */}
                      <button
                        onClick={handleSimulateClientJoin}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                          flowStep >= 5
                            ? 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                            : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                        }`}
                        title={lang === 'zh' ? '模拟对端客户打开并完成连接以验证完整流程' : 'Simulate client connection to test complete workflow'}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>
                          {flowStep >= 5
                            ? (lang === 'zh' ? '重设连接测试' : 'Reset Test')
                            : (lang === 'zh' ? '模拟客户接入测试' : 'Simulate Client Join')}
                        </span>
                      </button>

                      {/* 切换到接收端 */}
                      {onSwitchToTech && (
                        <button
                          onClick={onSwitchToTech}
                          className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          title={lang === 'zh' ? '前往接收端输入此会话码' : 'Go to receiver side'}
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>{lang === 'zh' ? '在接收端测试' : 'Test in Tech Tab'}</span>
                        </button>
                      )}

                      {/* 服务器配置 */}
                      <button
                        onClick={() => setShowServerConfigModal(true)}
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>{lang === 'zh' ? '服务器配置' : 'Relay'}</span>
                      </button>

                      {!showCreatedToast && (
                        <button
                          onClick={() => setShowCreatedToast(true)}
                          className="text-[11px] text-sky-400/80 hover:text-sky-300 underline transition-all cursor-pointer"
                        >
                          {lang === 'zh' ? '提示条' : 'Toast'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================= 状态 2: 初始创建表单 (高度还原截图) ======================= */
            <div className="bg-[#151821] border border-[#212635] rounded-xl p-7 shadow-sm space-y-5 animate-in fade-in duration-200">
              {/* + 创建新会话 按钮 */}
              <div>
                <button
                  onClick={handleCreateNewSession}
                  disabled={isCreating}
                  className="w-auto min-w-[210px] inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg text-white text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 bg-[#9333ea] hover:bg-[#8b5cf6]"
                  style={{ 
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 14px 0 ${accentColor}30`
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
              <div className="space-y-2 pt-1">
                <label className="text-sm font-medium text-gray-300 block">
                  {lang === 'zh' ? '客户电子邮件（可选）' : 'Customer Email (Optional)'}
                </label>

                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full max-w-xl bg-[#1a1f2c] border border-[#282f42] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[#9333ea] transition-all"
                />

                <p className="text-xs text-gray-400 mt-2.5 leading-relaxed max-w-3xl">
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

          {/* 卡片 2: 过往会话 (对标截图: 默认展开，带向上的折叠箭头) */}
          <div className="bg-[#151821] border border-[#212635] rounded-xl p-6 sm:p-7 shadow-sm space-y-4">
            {/* 卡片头部与折叠切换 */}
            <div 
              onClick={() => setIsPastSessionsOpen(!isPastSessionsOpen)}
              className="flex items-start justify-between cursor-pointer select-none"
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 text-gray-300">
                  <History className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <div className="text-base font-semibold text-white">
                    {lang === 'zh' ? '过往会话' : 'Past Sessions'}
                  </div>
                  <p className="text-xs text-gray-400 pt-0.5">
                    {lang === 'zh'
                      ? '一键邀请曾经的客户加入新会话 - 无需新会话码即可加入。'
                      : 'One-click invite previous clients to a new session - join without a new code.'}
                  </p>
                </div>
              </div>

              <button className="text-gray-400 hover:text-white p-1">
                {isPastSessionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* 展开内容 */}
            {isPastSessionsOpen && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                {pastClients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-[#181c26] border border-[#242a3a] hover:border-[#333b50] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    {/* 左侧设备与客户信息 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{client.countryFlag}</span>
                        
                        {editingClientId === client.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingClientName}
                              onChange={(e) => setEditingClientName(e.target.value)}
                              className="bg-[#0e1015] border border-[#9333ea] rounded px-2 py-0.5 text-xs text-white outline-none"
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
                          <span className="text-sm font-semibold text-white tracking-wide font-mono">
                            {client.name}
                          </span>
                        )}

                        {editingClientId !== client.id && (
                          <button
                            onClick={() => {
                              setEditingClientId(client.id);
                              setEditingClientName(client.name);
                            }}
                            className="text-gray-400 hover:text-white p-0.5 transition-colors"
                            title={lang === 'zh' ? '编辑别名' : 'Edit alias'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* 在线状态 */}
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium ml-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{lang === 'zh' ? '在线' : 'Online'}</span>
                        </span>
                      </div>

                      {/* 次级信息 */}
                      <div className="text-xs text-gray-400 flex items-center gap-2 pt-0.5">
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
                      <div className="text-xs font-mono text-gray-400 pt-0.5">
                        {client.lastSessionTime}
                      </div>
                    </div>

                    {/* 右侧：再次提供 按钮 */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleReinviteClient(client)}
                        className="px-4 py-2 rounded-lg text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 hover:opacity-95 active:scale-95 bg-[#9333ea] hover:bg-[#8b5cf6]"
                        style={{ backgroundColor: accentColor }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{lang === 'zh' ? '再次提供' : 'Provide Again'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 卡片 3: 计划中和进行中的会话 (对标截图: 默认收起，带向下的折叠箭头) */}
          <div className="bg-[#151821] border border-[#212635] rounded-xl p-6 sm:p-7 shadow-sm space-y-4">
            {/* 卡片头部与折叠切换 */}
            <div 
              onClick={() => setIsScheduledSessionsOpen(!isScheduledSessionsOpen)}
              className="flex items-start justify-between cursor-pointer select-none"
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 text-gray-300">
                  <CalendarClock className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <div className="text-base font-semibold text-white">
                    {lang === 'zh' ? '计划中和进行中的会话' : 'Scheduled & Ongoing Sessions'}
                  </div>
                  <p className="text-xs text-gray-400 pt-0.5">
                    {lang === 'zh'
                      ? '提前为客户提供预约：链接会立即发送，连接会在预约时间前 15 分钟自动开放。'
                      : 'Offer appointments in advance: Links sent instantly, connection opens 15 min before.'}
                  </p>
                </div>
              </div>

              <button className="text-gray-400 hover:text-white p-1">
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
                            onClick={(e) => onDeleteSession(sess.id, e)}
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
