import React, { useState } from 'react';
import { 
  Info, 
  ShieldCheck, 
  Cpu, 
  Check, 
  Copy, 
  RefreshCw, 
  Mail, 
  ExternalLink,
  Layers,
  Radio,
  Cable
} from 'lucide-react';
import { LangType } from '../types';

interface AboutViewProps {
  lang: LangType;
  programName?: string;
  accentColor?: string;
  supportEmail?: string;
}

export const AboutView: React.FC<AboutViewProps> = ({
  lang,
  programName = '泰兴悦之宝',
  accentColor = '#A855F7',
  supportEmail = 'bmwtpi@gmail.com'
}) => {
  const [copied, setCopied] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckUpdate = () => {
    setCheckingUpdate(true);
    setUpdateStatus(null);
    setTimeout(() => {
      setCheckingUpdate(false);
      setUpdateStatus(lang === 'zh' ? '当前已是最新稳定版本 (v3.26.0)' : 'Already on the latest stable version (v3.26.0)');
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200 select-none">
      {/* 顶部标题 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '关于' : 'About'}
        </h1>
        <p className="text-sm text-white/50 leading-relaxed">
          {lang === 'zh' ? `${programName} Connect 客户端系统与版本信息。` : `System and build information for ${programName} Connect.`}
        </p>
      </div>

      {/* 主信息卡片 */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              C
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{programName} Connect</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono font-normal">
                  v3.26.0
                </span>
              </div>
              <div className="text-xs text-white/40 pt-0.5">
                BMW Remote Programming & Diagnostics Bridge
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleCheckUpdate}
              disabled={checkingUpdate}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white/90 border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
              <span>{checkingUpdate ? (lang === 'zh' ? '检查中...' : 'Checking...') : (lang === 'zh' ? '检查更新' : 'Check for Updates')}</span>
            </button>
            {updateStatus && (
              <div className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-mono">
                <Check className="w-3 h-3" />
                <span>{updateStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* 协议与硬件兼容矩阵 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#171922] p-4 rounded-xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-white/90 text-xs font-semibold">
              <Cable className="w-4 h-4 text-purple-400" />
              <span>ENET & K+DCAN</span>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              支持 F/G 系以太网 DoIP 链路直通与 E 系 FTDI USB 1ms 毫秒级低延迟响应。
            </p>
          </div>

          <div className="bg-[#171922] p-4 rounded-xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-white/90 text-xs font-semibold">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>BMW ICOM Professional</span>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              支持 ICOM A2 / A3 / Next 自动局域网侦测与广播重定向。
            </p>
          </div>

          <div className="bg-[#171922] p-4 rounded-xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-white/90 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>E2E 安全与加密</span>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              全链路端到端加密握手，仅在诊断会话期间透传数据，保障车辆安全。
            </p>
          </div>
        </div>

        {/* 技术支持与程序分发 */}
        <div className="bg-[#171922] p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
          <div className="text-xs font-semibold text-white/80">
            {lang === 'zh' ? '程序分发与技术支持渠道' : 'Program Distribution & Support'}
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            {lang === 'zh'
              ? '如需获取独立离线分发安装包、申请 API 密钥或咨询疑难车型远程诊断，请直接联系技术支持：'
              : 'For offline standalone packages, API keys, or remote diagnosis inquiries, contact technical support:'}
          </p>

          <div className="flex items-center justify-between gap-3 bg-[#111319] p-3 rounded-lg border border-white/5 max-w-md">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-sm text-purple-300 font-semibold selection:bg-purple-500/30">
                {supportEmail}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyEmail}
                className="text-xs bg-[#242733] hover:bg-[#2f3445] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'zh' ? '已复制' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white/70" />
                    <span>{lang === 'zh' ? '复制' : 'Copy'}</span>
                  </>
                )}
              </button>
              <a
                href={`mailto:${supportEmail}?subject=BimmerBridge%20Connect%20Support`}
                className="text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                title={lang === 'zh' ? '调起邮件应用发信' : 'Send email'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* 底部系统信息 */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-white/30 gap-2 border-t border-white/[0.04]">
          <span>© 2026 {programName} Connect · All rights reserved.</span>
          <span className="font-mono">Engine: WebRTC / WebSocket Relay v3.26</span>
        </div>
      </div>
    </div>
  );
};
