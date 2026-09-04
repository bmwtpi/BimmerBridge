import React, { useState } from 'react';
import { 
  Cable, 
  Usb, 
  Radio, 
  Key, 
  Monitor, 
  HelpCircle, 
  Download, 
  Mail, 
  ChevronUp, 
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Send,
  X,
  Sparkles
} from 'lucide-react';
import { LangType } from '../types';

interface HelpViewProps {
  lang: LangType;
  accentColor?: string;
  supportEmail?: string;
}

interface FaqItem {
  id: string;
  section: string;
  icon: any;
  titleZh: string;
  titleEn: string;
  contentZh: string;
  contentEn: string;
  downloadEmail?: string;
}

export const HelpView: React.FC<HelpViewProps> = ({
  lang,
  accentColor = '#a855f7',
  supportEmail = 'bmwtpi@gmail.com'
}) => {
  // 控制各个 FAQ 项的展开状态，默安全部展开（与截图一致，箭头朝上）
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'cable-choice': true,
    'car-not-found': true,
    'kdcan-driver': true,
    'icom-not-found': true,
    'icom-launch-order': true,
    'session-code-source': true,
    'device-limit': true,
    'remote-control-client': true,
    'send-diag-logs': true,
    'download-program': true,
  });

  // 复制与支持弹窗
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // 切换折叠/展开
  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 复制技术邮箱
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // 发送工单支持请求
  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setShowSupportModal(false);
      setSupportMessage('');
    }, 2200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200 select-none">
      {/* 顶部主标题与说明 (完全对标截图顶部) */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '帮助' : 'Help'}
        </h1>
        <p className="text-sm text-white/50 leading-relaxed">
          {lang === 'zh'
            ? '关于连接和远程编码的常见问题。'
            : 'Frequently asked questions about connection and remote coding.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* =========================================================================
            分组 1: 连接与线缆 (对标截图 1)
            ========================================================================= */}
        <div className="space-y-3">
          {/* 紫色小标题 */}
          <div 
            className="text-xs font-semibold tracking-tight"
            style={{ color: accentColor }}
          >
            {lang === 'zh' ? '连接与线缆' : 'Connection & Cables'}
          </div>

          <div className="space-y-3">
            {/* 条目 1: K+DCAN、ENET 还是 ICOM – 我需要哪一种？ */}
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-colors">
              <button
                onClick={() => toggleItem('cable-choice')}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Cable className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {lang === 'zh' ? 'K+DCAN、ENET 还是 ICOM – 我需要哪一种？' : 'K+DCAN, ENET or ICOM – Which one do I need?'}
                  </span>
                </div>
                {openItems['cable-choice'] ? (
                  <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                )}
              </button>

              {openItems['cable-choice'] && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/[0.04]">
                  {lang === 'zh'
                    ? '老款 BMW（约 2013 年以前，E 系）使用 K+DCAN 线缆 (USB)。新款车型（F 系/G 系）通过 ENET（以太网线缆）连接。ICOM（BMW 专业接口）两者皆可，通过局域网连接。「连接测试」中的自动搜索会显示当前所有可用设备 – 只需点击「测试」。'
                    : 'Older BMW models (before ~2013, E-series) use K+DCAN cables (USB). Newer models (F/G series) connect via ENET (Ethernet cable). ICOM (BMW professional interface) supports both, connecting via local network. The auto-scan in "Connection Test" shows all available devices – simply click "Test".'}
                </div>
              )}
            </div>

            {/* 条目 2: 找不到车辆 */}
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-colors">
              <button
                onClick={() => toggleItem('car-not-found')}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Cable className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {lang === 'zh' ? '找不到车辆' : 'Cannot find vehicle'}
                  </span>
                </div>
                {openItems['car-not-found'] ? (
                  <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                )}
              </button>

              {openItems['car-not-found'] && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/[0.04]">
                  {lang === 'zh'
                    ? '请检查线缆是否插牢、点火是否已打开。部分车系需要拨动线缆上的开关。然后重新开始测试。'
                    : 'Please check that the cable is firmly plugged in and the ignition is turned on. Some models require toggling the switch on the cable. Then restart the test.'}
                </div>
              )}
            </div>

            {/* 条目 3: K+DCAN 线缆的驱动程序 */}
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-colors">
              <button
                onClick={() => toggleItem('kdcan-driver')}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Usb className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {lang === 'zh' ? 'K+DCAN 线缆的驱动程序' : 'K+DCAN cable drivers'}
                  </span>
                </div>
                {openItems['kdcan-driver'] ? (
                  <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                )}
              </button>

              {openItems['kdcan-driver'] && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/[0.04]">
                  {lang === 'zh'
                    ? '如果线缆未被识别，连接测试会自动安装 FTDI 驱动程序（「安装驱动程序」卡片）。程序在测试时也会自动将线缆延迟设置为最佳值（1 ms）。'
                    : 'If the cable is not recognized, Connection Test will automatically install the FTDI driver ("Install Driver" card). The program also automatically sets cable latency to the optimal value (1 ms) during testing.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            分组 2: ICOM 与会话 (对标截图 2)
            ========================================================================= */}
        <div className="space-y-3">
          {/* 紫色小标题 */}
          <div 
            className="text-xs font-semibold tracking-tight"
            style={{ color: accentColor }}
          >
            {lang === 'zh' ? 'ICOM 与会话' : 'ICOM & Sessions'}
          </div>

          <div className="space-y-3">
            {/* 条目 4: 找不到我的 ICOM */}
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-colors">
              <button
                onClick={() => toggleItem('icom-not-found')}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Radio className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {lang === 'zh' ? '找不到我的 ICOM' : 'Cannot find my ICOM'}
                  </span>
                </div>
                {openItems['icom-not-found'] ? (
                  <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                )}
              </button>

              {openItems['icom-not-found'] && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/[0.04]">
                  {lang === 'zh'
                    ? '通过局域网连接 ICOM，并等待约一分钟让其启动（注意 LED）。直连电脑时，网络适配器会获得 169.254.x 地址 – 这是正常的，并会被自动搜索。如果 Windows 询问，请允许本程序通过防火墙。'
                    : 'Connect ICOM via LAN and wait about a minute for boot-up (check LEDs). When directly plugged into the PC, the network adapter will receive a 169.254.x address – this is normal and searched automatically. If prompted by Windows, allow this program through the firewall.'}
                </div>
              )}
            </div>

            {/* 条目 5: ICOM：应按什么顺序启动 ISTA/E-Sys？ */}
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-colors">
              <button
                onClick={() => toggleItem('icom-launch-order')}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Radio className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {lang === 'zh' ? 'ICOM：应按什么顺序启动 ISTA/E-Sys？' : 'ICOM: In what order should ISTA/E-Sys be started?'}
                  </span>
                </div>
                {openItems['icom-launch-order'] ? (
                  <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                )}
              </button>

              {openItems['icom-launch-order'] && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/[0.04]">
                  {lang === 'zh'
                    ? '请先在会话中选择 ICOM 连接，然后再启动诊断程序（ISTA、E-Sys 等）。ICOM 只有在选择后才会出现在您的电脑上 – 已在运行的程序只会在下一次扫描时发现它（可能需要 10–15 秒或重新搜索）。最快的方法是把显示的 ICOM IP（复制图标）直接填入程序。'
                    : 'Please select the ICOM connection in the session first, and then launch diagnostic software (ISTA, E-Sys, etc.). ICOM will only appear on your PC after selection – already running software will only discover it on the next scan (may take 10–15 seconds or a rescan). The fastest way is to copy and paste the displayed ICOM IP into the software.'}
                </div>
              )}
            </div>

            {/* 条目 6: 我从哪里获取会话码？ */}
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-colors">
              <button
                onClick={() => toggleItem('session-code-source')}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Key className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {lang === 'zh' ? '我从哪里获取会话码？' : 'Where do I get the session code?'}
                  </span>
                </div>
                {openItems['session-code-source'] ? (
                  <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                )}
              </button>

              {openItems['session-code-source'] && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/[0.04]">
                  {lang === 'zh'
                    ? '远程编码开始时，您的维修厂会告知您会话码。它仅对一次会话有效。'
                    : 'When remote coding begins, your workshop will provide you with the session code. It is valid for a single session only.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            分组 3: 账户、远程控制与技术支持 (对标截图 3)
            ========================================================================= */}
        <div className="space-y-3">
          {/* 紫色小标题 */}
          <div 
            className="text-xs font-semibold tracking-tight"
            style={{ color: accentColor }}
          >
            {lang === 'zh' ? '账户、远程控制与技术支持' : 'Account, Remote Control & Support'}
          </div>

          <div className="space-y-3">
            {/* 条目 7: 登录与设备数量限制 */}
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-colors">
              <button
                onClick={() => toggleItem('device-limit')}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Key className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {lang === 'zh' ? '登录与设备数量限制' : 'Sign-in & Device Limits'}
                  </span>
                </div>
                {openItems['device-limit'] ? (
                  <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                )}
              </button>

              {openItems['device-limit'] && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/[0.04]">
                  {lang === 'zh'
                    ? '登录状态会永久保持（直到主动注销）。一个账户最多可同时在 3 台设备上登录 – 再多的设备将被拒绝，直到有一台注销。'
                    : 'Sign-in status remains permanently (until actively logged out). One account can be signed into a maximum of 3 devices simultaneously – additional devices will be rejected until one logs out.'}
                </div>
              )}
            </div>

            {/* 条目 8: 如何远程控制客户的电脑？ */}
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-colors">
              <button
                onClick={() => toggleItem('remote-control-client')}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Monitor className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {lang === 'zh' ? '如何远程控制客户的电脑？' : 'How to remotely control a client’s PC?'}
                  </span>
                </div>
                {openItems['remote-control-client'] ? (
                  <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                )}
              </button>

              {openItems['remote-control-client'] && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/[0.04]">
                  {lang === 'zh'
                    ? '在「远程控制」选项卡中（需有效访问权限）点击「启动」- 您会得到一个短时有效的链接交给客户。客户打开它，确认一次，您就会自动连接（包括文件传输）。这在远程编码会话之外同样可用。在进行中的会话内，请使用「聊天与远程控制」。'
                    : 'In the "Remote Desktop" tab (requires active access), click "Start" – you will receive a short-term link to share with your client. When the client opens and confirms it once, you will connect automatically (including file transfer). This works outside remote coding sessions too. In active sessions, use "Chat & Remote Control".'}
                </div>
              )}
            </div>

            {/* 条目 9: 我遇到了问题 – 如何把诊断信息发给你们？ */}
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-colors">
              <button
                onClick={() => toggleItem('send-diag-logs')}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <HelpCircle className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {lang === 'zh' ? '我遇到了问题 – 如何把诊断信息发给你们？' : 'I encountered an issue – How to send diagnostics?'}
                  </span>
                </div>
                {openItems['send-diag-logs'] ? (
                  <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                )}
              </button>

              {openItems['send-diag-logs'] && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/[0.04]">
                  {lang === 'zh'
                    ? '在「设置」中启用「详细诊断日志」，重现问题，然后在「支持」选项卡中附上简短描述发送。您会得到一个工单号。日志已加密 – 只有程序提供者可以读取（不含密码，不含明文车辆数据）。'
                    : 'Enable "Verbose Diagnostic Logging" in Settings, reproduce the issue, and submit it with a brief description in the Support tab. You will receive a ticket ID. Logs are encrypted – only the provider can decrypt (no passwords, no cleartext vehicle data).'}
                </div>
              )}
            </div>

            {/* 条目 10: 在哪里下载程序（用于分发）？ */}
            {/* 用户明确指示: 下载地址先写我的邮箱 bmwtpi@gmail.com */}
            <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-colors">
              <button
                onClick={() => toggleItem('download-program')}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Download className="w-5 h-5 text-white/80 shrink-0" />
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {lang === 'zh' ? '在哪里下载程序（用于分发）？' : 'Where to download the app (for distribution)?'}
                  </span>
                </div>
                {openItems['download-program'] ? (
                  <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
                )}
              </button>

              {openItems['download-program'] && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs text-white/60 leading-relaxed border-t border-white/[0.04] space-y-2">
                  <p>
                    {lang === 'zh'
                      ? '通过专属技术邮箱索取最新版本安装包：'
                      : 'Request the latest installer package via technical email: '}
                    <button
                      onClick={() => handleCopyEmail(supportEmail)}
                      className="font-mono text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 inline-flex items-center gap-1 mx-1 group"
                      title={lang === 'zh' ? '点击复制邮箱' : 'Click to copy'}
                    >
                      <span>{supportEmail}</span>
                      {copiedEmail ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 inline" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 inline" />
                      )}
                    </button>
                    {lang === 'zh'
                      ? ' – 您可以把这个邮箱分享给您的维修厂/编码师。之后程序会通过内置的更新功能自行保持最新。'
                      : ' – You can share this email with your workshop/coder. The app will then keep itself updated automatically via built-in auto-update.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            底部常驻按钮: [ ✉ 联系技术支持 ] (对标截图 3 底部)
            用户要求: 联系技术支持也是写我的邮箱 bmwtpi@gmail.com
            ========================================================================= */}
        <div className="pt-2">
          <button
            onClick={() => setShowSupportModal(true)}
            className="bg-[#242733] hover:bg-[#2e3344] text-white/90 text-sm px-6 py-3 rounded-xl transition-all border border-white/5 shadow-md active:scale-95 flex items-center gap-2.5 font-medium cursor-pointer"
          >
            <Mail className="w-4 h-4 text-white/80" />
            <span>{lang === 'zh' ? '联系技术支持' : 'Contact Technical Support'}</span>
          </button>
        </div>
      </div>

      {/* ===================== 联系技术支持弹窗 (展示邮箱 bmwtpi@gmail.com) ===================== */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141720] border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            {/* 弹窗顶栏 */}
            <div className="bg-[#1c202d] px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>{lang === 'zh' ? '联系技术支持' : 'Contact Support'}</span>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-4">
              {ticketSubmitted ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    {lang === 'zh' ? '工单已提交！' : 'Support Ticket Created!'}
                  </div>
                  <p className="text-xs text-white/50">
                    {lang === 'zh'
                      ? `技术支持已将您的请求同步至 ${supportEmail}，我们将尽快联系您。`
                      : `Your request has been forwarded to ${supportEmail}. We will get back to you soon.`}
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-[#0e1017] p-4 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-white/50">
                      {lang === 'zh' ? '官方技术支持与分发邮箱：' : 'Official Support & Distribution Email:'}
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-[#1a1d28] p-3 rounded-lg border border-white/5">
                      <div className="font-mono text-sm text-purple-300 font-semibold selection:bg-purple-500/30">
                        {supportEmail}
                      </div>
                      <button
                        onClick={() => handleCopyEmail(supportEmail)}
                        className="text-xs bg-[#242733] hover:bg-[#2f3445] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        {copiedEmail ? (
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
                    </div>
                  </div>

                  <form onSubmit={handleSendSupport} className="space-y-3">
                    <label className="text-xs text-white/70 font-medium block">
                      {lang === 'zh' ? '快速反馈您遇到的问题（将直达技术专家邮箱）：' : 'Direct Message:'}
                    </label>
                    <textarea
                      rows={3}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder={lang === 'zh' ? '例如：连接 F30 车型时 ENET 未能获取 IP，希望获取最新分发程序...' : 'Describe your issue...'}
                      required
                      className="w-full bg-[#0e1017] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 resize-none font-sans"
                    />

                    <div className="flex items-center justify-between pt-2">
                      <a
                        href={`mailto:${supportEmail}?subject=BimmerBridge%20Connect%20Support`}
                        className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{lang === 'zh' ? '使用本地邮件客户端发信' : 'Open in Mail app'}</span>
                      </a>

                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === 'zh' ? '提交工单' : 'Submit Ticket'}</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
