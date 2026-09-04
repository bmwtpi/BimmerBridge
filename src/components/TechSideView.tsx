import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Trash2, 
  Save, 
  Check, 
  X, 
  Sparkles,
  Car,
  Wifi,
  Radio,
  Activity,
  CheckCircle2,
  Terminal,
  Clock,
  Shield
} from 'lucide-react';
import { Session, LangType, ConnectionMode } from '../types';

interface TechSideViewProps {
  lang: LangType;
  techCode: string;
  setTechCode: (code: string) => void;
  techStatus: 'idle' | 'connecting' | 'connected' | 'error';
  onTechConnect: () => void;
  onTechDisconnect: () => void;
  isPeerConnected: boolean;
  connectionMode: ConnectionMode;
  sessions: Session[];
  activeDiagSessions: Set<string>;
  isDiagModeLoading: boolean;
  onEnableDiagMode: (sessionId: string) => void;
  onOpenChat: (session: Session) => void;
  latency?: number;
  onNavigateToRemoteDesktop?: () => void;
  onNavigateToEdiabas?: () => void;
  accentColor?: string;
}

export const TechSideView: React.FC<TechSideViewProps> = ({
  lang,
  techCode,
  setTechCode,
  techStatus,
  onTechConnect,
  onTechDisconnect,
  isPeerConnected,
  connectionMode,
  sessions,
  activeDiagSessions,
  isDiagModeLoading,
  onEnableDiagMode,
  onOpenChat,
  latency = 18,
  onNavigateToRemoteDesktop,
  onNavigateToEdiabas,
  accentColor = '#a855f7'
}) => {
  // 维修厂列表及自动接受设置 (对标截图 1: 您的维修厂 HAIFEI ZHOU 自动接受)
  const [workshops, setWorkshops] = useState<Array<{ id: string; name: string; autoAccept: boolean }>>(() => {
    const saved = localStorage.getItem('cfg_client_workshops');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [{ id: 'w-1', name: 'HAIFEI ZHOU', autoAccept: false }];
  });

  // 客户邮箱 (对标截图 1: 电子邮件（可选）)
  const [clientEmail, setClientEmail] = useState<string>(() => {
    return localStorage.getItem('cfg_client_email') || '';
  });
  const [emailSavedToast, setEmailSavedToast] = useState(false);

  // 会话状态: false 为图 1 (输入会话码界面), true 为图 2 (正在等待维修厂 ... 界面)
  const [isSessionActive, setIsSessionActive] = useState<boolean>(() => {
    return techStatus === 'connecting' || techStatus === 'connected' || Boolean(techCode && techCode.length >= 8);
  });

  // 内部连接测量状态 (对标截图 2 动态显示)
  const [measuringQuality, setMeasuringQuality] = useState(true);
  const [detectingVehicle, setDetectingVehicle] = useState(true);

  // 保存客户邮箱
  const handleSaveEmail = () => {
    localStorage.setItem('cfg_client_email', clientEmail.trim());
    setEmailSavedToast(true);
    setTimeout(() => setEmailSavedToast(false), 2000);
  };

  // 切换维修厂自动接受开关
  const handleToggleAutoAccept = (id: string) => {
    const updated = workshops.map(w => w.id === id ? { ...w, autoAccept: !w.autoAccept } : w);
    setWorkshops(updated);
    localStorage.setItem('cfg_client_workshops', JSON.stringify(updated));
  };

  // 删除维修厂
  const handleDeleteWorkshop = (id: string) => {
    const updated = workshops.filter(w => w.id !== id);
    setWorkshops(updated);
    localStorage.setItem('cfg_client_workshops', JSON.stringify(updated));
  };

  // 自动格式化会话码输入 (XXXX-XXXX)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    
    let formatted = val;
    if (val.length > 4) {
      formatted = `${val.slice(0, 4)}-${val.slice(4)}`;
    }
    setTechCode(formatted);

    // 格式完整自动触发连接 (对标文案: 会话码输入完整后，我们会自动连接)
    if (val.length === 8) {
      triggerConnect(formatted);
    }
  };

  // 触发连接并切换至截图 2 状态
  const triggerConnect = (codeToConnect?: string) => {
    setIsSessionActive(true);
    setMeasuringQuality(true);
    setDetectingVehicle(true);
    onTechConnect();

    // 模拟真实测量质量与检测车辆
    setTimeout(() => {
      setMeasuringQuality(false);
    }, 2200);

    setTimeout(() => {
      setDetectingVehicle(false);
    }, 3000);
  };

  // 结束会话 (对标截图 2 右下角【✕ 结束会话】)
  const handleEndSession = () => {
    setIsSessionActive(false);
    setTechCode('');
    onTechDisconnect();
  };

  // 监听外部 techStatus 联动
  useEffect(() => {
    if (techStatus === 'connected' || techStatus === 'connecting') {
      setIsSessionActive(true);
    }
  }, [techStatus]);

  // 寻找匹配会话供聊天
  const currentSession = sessions.find(s => s.code === techCode.replace('-', '')) || sessions[0] || {
    id: 'active-session-local',
    code: techCode || '77JM-3HQS',
    carVin: 'WBA5R11030FG91823',
    carIp: '169.254.85.12',
    createdAt: Date.now(),
    role: 'car' as const,
    active: true
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200 select-none">
      {/* ======================= 顶部主标题与说明 (对标两张截图顶部) ======================= */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '接收远程会话' : 'Receive Remote Session'}
        </h1>
        <p className="text-sm text-white/50 leading-relaxed max-w-4xl">
          {lang === 'zh'
            ? '输入维修厂告知您的会话码。通常这是一次远程编码会话；如有需要，维修厂也可以通过它启动远程控制作为技术支持 - 两者使用同一个会话码或链接。'
            : 'Enter the session code provided by the workshop. Usually this is a remote coding session; if needed, the workshop can also launch remote control as technical support - both use the same session code or link.'}
        </p>
      </div>

      {/* =========================================================================
          视图 2: 正在等待维修厂 ... 界面 (100% 精确对标第二张截图)
          ========================================================================= */}
      {isSessionActive ? (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          {/* 主状态卡片 */}
          <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-7">
            {/* 卡片大标题 */}
            <h2 className="text-xl font-bold text-white tracking-tight">
              {lang === 'zh' ? '正在等待维修厂 ...' : 'Waiting for workshop ...'}
            </h2>

            {/* 分组 1: 连接 */}
            <div className="space-y-3">
              <div 
                className="text-xs font-semibold tracking-tight"
                style={{ color: accentColor }}
              >
                {lang === 'zh' ? '连接' : 'Connection'}
              </div>

              <div className="space-y-2.5 max-w-md">
                {/* 状态 */}
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-white/60">
                    {lang === 'zh' ? '状态' : 'Status'}
                  </span>
                  <span className="text-white font-medium">
                    {lang === 'zh' ? '等待维修厂' : 'Waiting for workshop'}
                  </span>
                </div>

                {/* 连接质量 */}
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-white/60">
                    {lang === 'zh' ? '连接质量' : 'Quality'}
                  </span>
                  <span className="text-white font-medium flex items-center gap-2">
                    {measuringQuality ? (
                      <span className="text-white/80">
                        {lang === 'zh' ? '正在测量 ...' : 'Measuring ...'}
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1.5 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {lang === 'zh' ? `极佳 (${latency} ms)` : `Excellent (${latency} ms)`}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 分组 2: 车辆 */}
            <div className="space-y-3">
              <div 
                className="text-xs font-semibold tracking-tight"
                style={{ color: accentColor }}
              >
                {lang === 'zh' ? '车辆' : 'Vehicle'}
              </div>

              <div className="space-y-2.5 max-w-md">
                {/* 连接方式 */}
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-white/60">
                    {lang === 'zh' ? '连接方式' : 'Connection mode'}
                  </span>
                  <span 
                    className="font-medium"
                    style={{ color: detectingVehicle ? accentColor : '#a855f7' }}
                  >
                    {detectingVehicle ? (
                      lang === 'zh' ? '正在检测 ...' : 'Detecting ...'
                    ) : (
                      'ENET (DoIP) · 169.254.85.12'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 底部按钮组 (对标截图 2 左右分布) */}
            <div className="pt-4 flex items-center justify-between gap-4 border-t border-white/[0.04]">
              {/* 左侧: [ 💬 聊天 ] 按钮 */}
              <button
                onClick={() => onOpenChat(currentSession as any)}
                className="bg-[#242733] hover:bg-[#2e3344] text-white/90 text-sm px-5 py-2.5 rounded-xl transition-all border border-white/5 shadow-sm active:scale-95 flex items-center gap-2 font-medium"
              >
                <MessageSquare className="w-4 h-4 text-white/70" />
                <span>{lang === 'zh' ? '聊天' : 'Chat'}</span>
              </button>

              {/* 右侧: [ ✕ 结束会话 ] 按钮 */}
              <button
                onClick={handleEndSession}
                className="bg-[#242733] hover:bg-[#2e3344] text-white/90 text-sm px-5 py-2.5 rounded-xl transition-all border border-white/5 shadow-sm active:scale-95 flex items-center gap-2 font-medium"
              >
                <X className="w-4 h-4 text-white/70" />
                <span>{lang === 'zh' ? '结束会话' : 'End session'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            视图 1: 输入会话码界面 (100% 精确对标第一张截图)
            ========================================================================= */
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 卡片 1: 您的维修厂 (对标截图 1 上部卡片) */}
          <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-3.5">
            {/* 紫色小标题 */}
            <div 
              className="text-xs font-semibold tracking-tight"
              style={{ color: accentColor }}
            >
              {lang === 'zh' ? '您的维修厂' : 'Your Workshop'}
            </div>

            {/* 说明文案 */}
            <p className="text-xs text-white/60 leading-relaxed">
              {lang === 'zh'
                ? '您之前连接过的维修厂。启用自动接受后，该维修厂提供的下一个会话将自动开始。'
                : 'Workshops you previously connected to. When auto-accept is enabled, the next session provided by this workshop will start automatically.'}
            </p>

            {/* 维修厂列表条目 */}
            {workshops.length > 0 ? (
              <div className="space-y-2 pt-1">
                {workshops.map((w) => (
                  <div
                    key={w.id}
                    className="bg-[#1c202a] border border-white/5 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-inner"
                  >
                    <span className="text-sm font-semibold text-white tracking-wide font-sans">
                      {w.name}
                    </span>

                    <div className="flex items-center gap-4">
                      {/* 自动接受 Toggle 开关 */}
                      <button
                        onClick={() => handleToggleAutoAccept(w.id)}
                        className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
                      >
                        <div 
                          className={`w-11 h-6 rounded-full transition-colors relative border flex items-center p-0.5 ${
                            w.autoAccept 
                              ? 'bg-[#a855f7] border-purple-400' 
                              : 'bg-[#12141a] border-white/20'
                          }`}
                          style={w.autoAccept ? { backgroundColor: accentColor } : undefined}
                        >
                          <div 
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              w.autoAccept ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </div>
                        <span className="text-xs text-white/80 font-medium select-none group-hover:text-white transition-colors">
                          {lang === 'zh' ? '自动接受' : 'Auto accept'}
                        </span>
                      </button>

                      {/* 垃圾桶图标 (删除此维修厂) */}
                      <button
                        onClick={() => handleDeleteWorkshop(w.id)}
                        className="text-white/40 hover:text-white/90 p-1 rounded transition-colors"
                        title={lang === 'zh' ? '删除维修厂记录' : 'Remove workshop'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1c202a]/60 border border-dashed border-white/10 rounded-xl px-5 py-3 text-xs text-white/40 text-center">
                {lang === 'zh' ? '暂无保存的维修厂' : 'No saved workshops'}
              </div>
            )}
          </div>

          {/* 卡片 2: 会话码与客户邮箱 (对标截图 1 中部主卡片) */}
          <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
            {/* 紫色小标题 */}
            <div 
              className="text-xs font-semibold tracking-tight"
              style={{ color: accentColor }}
            >
              {lang === 'zh' ? '会话码' : 'Session code'}
            </div>

            {/* 会话码大号输入框 (深黑色，居中大字，格式化) */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={techCode}
                  onChange={handleCodeChange}
                  placeholder="XXXX - XXXX"
                  maxLength={9}
                  className="w-full bg-[#1c202a] border border-white/5 rounded-xl px-6 py-4 text-2xl sm:text-3xl font-bold font-mono text-center text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 shadow-inner tracking-widest transition-all uppercase"
                />
              </div>

              {/* 格式提示文案 */}
              <p className="text-xs text-white/60 leading-relaxed">
                {lang === 'zh'
                  ? '格式：XXXX-XXXX - 会话码输入完整后，我们会自动连接。'
                  : 'Format: XXXX-XXXX - Once the code is complete, we will connect automatically.'}
              </p>

              {/* GDPR 与免责条款 */}
              <p className="text-xs text-white/40 leading-relaxed pt-1">
                {lang === 'zh'
                  ? '连接即表示您同意：本软件的提供者不对因使用本软件而产生的损失或损害承担责任。您的车架号和车辆信息将按照《通用数据保护条例》(GDPR) 的规定传输给创建此会话的维修厂。'
                  : 'By connecting, you agree: the provider of this software is not liable for loss or damage resulting from use. Your VIN and vehicle info will be transmitted to the workshop per GDPR regulations.'}
              </p>
            </div>

            {/* 电子邮件 (可选) */}
            <div className="pt-2 space-y-1.5">
              <label className="text-xs text-white/60 font-normal block">
                {lang === 'zh' ? '电子邮件（可选）' : 'Email (optional)'}
              </label>

              <div className="flex items-center gap-2.5 max-w-md">
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="bg-[#1c202a] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 flex-1 shadow-inner font-sans transition-all"
                />
                <button
                  onClick={handleSaveEmail}
                  className="bg-[#1c202a] border border-white/5 hover:bg-[#252936] text-white/80 hover:text-white p-2.5 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
                  title={lang === 'zh' ? '保存邮箱设置' : 'Save Email'}
                >
                  {emailSavedToast ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* 电子邮件说明文案 */}
              <p className="text-xs text-white/40 leading-relaxed pt-0.5">
                {lang === 'zh'
                  ? '仅当您希望维修厂以后无需会话码即可再次邀请您时才需要。仅在您填写时传输 - 不会发送任何电子邮件。'
                  : 'Only needed if you want the workshop to invite you again without a session code in the future. Transmitted only when filled - no emails will be sent.'}
              </p>
            </div>

            {/* 快速演示辅助按键: 填入刚才创建的会话码 */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-white/30">
                {lang === 'zh' ? '提示：直接输入 8 位会话码即可自动接入' : 'Tip: Enter 8 digits code to auto-connect'}
              </span>
              <button
                onClick={() => {
                  const demo = '77JM-3HQS';
                  setTechCode(demo);
                  triggerConnect(demo);
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>{lang === 'zh' ? '快速填入 77JM-3HQS 并模拟连接' : 'Demo 77JM-3HQS'}</span>
              </button>
            </div>
          </div>

          {/* 卡片 3: 安全且透明 (对标截图 1 底部卡片) */}
          <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/80">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white">
                {lang === 'zh' ? '安全且透明' : 'Secure and Transparent'}
              </h3>
              <p className="text-xs text-white/50 leading-relaxed">
                {lang === 'zh'
                  ? '只有使用维修厂提供的有效会话码才能建立连接。我们只会看到您的车辆，您可以随时结束。'
                  : 'A connection can only be established using a valid session code provided by the workshop. We only see your vehicle, and you can end it at any time.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
