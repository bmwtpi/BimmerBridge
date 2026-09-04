import React, { useState } from 'react';
import { 
  LogOut, 
  Check, 
  ShoppingCart, 
  Receipt, 
  Key, 
  Laptop, 
  X, 
  ShieldCheck, 
  ExternalLink,
  CreditCard,
  User,
  Mail,
  Lock,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { LangType } from '../types';

interface AccountViewProps {
  lang: LangType;
  username?: string;
  email?: string;
  onLogout: () => void;
  accentColor?: string;
}

export const AccountView: React.FC<AccountViewProps> = ({
  lang,
  username = 'haifeizhou',
  email = 'bmwtpi@gmail.com',
  onLogout,
  accentColor = '#a855f7'
}) => {
  // 弹窗状态
  const [activeModal, setActiveModal] = useState<'billing' | 'security' | 'devices' | 'extend' | null>(null);

  // 模拟设备列表
  const [devices, setDevices] = useState([
    { id: 'd-1', name: 'Windows 11 PC (当前设备)', ip: '192.168.1.108', lastActive: '当前在线', current: true },
    { id: 'd-2', name: 'MacBook Pro M2 (技术支持备用机)', ip: '192.168.1.120', lastActive: '2 天前', current: false },
    { id: 'd-3', name: 'iPhone 15 Pro (移动通知终端)', ip: '10.0.0.45', lastActive: '1 周前', current: false }
  ]);

  // 注销单台设备
  const handleRemoveDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200 select-none">
      {/* 顶部标题与说明 (对标截图) */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '账户' : 'Account'}
        </h1>
        <p className="text-sm text-white/50 leading-relaxed">
          {lang === 'zh'
            ? '登录或创建账户以使用远程编码。'
            : 'Sign in or create an account to use remote coding.'}
        </p>
      </div>

      {/* 主卡片容器 */}
      <div className="space-y-5">
        {/* ===================== 卡片 1: 账户与品牌形象 (对标截图上部) ===================== */}
        <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
          {/* 紫色小标题 */}
          <div 
            className="text-xs font-semibold tracking-tight"
            style={{ color: accentColor }}
          >
            {lang === 'zh' ? '账户与品牌形象' : 'Account & Branding'}
          </div>

          {/* 登录身份与注销按钮行 */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-base text-white font-normal">
              <span>{lang === 'zh' ? '登录身份：' : 'Logged in as: '}</span>
              <span className="font-semibold text-white">{username}</span>
            </div>

            {/* 注销按钮 (对标截图中的微圆角深灰按钮带注销图标) */}
            <button
              onClick={onLogout}
              className="bg-[#242733] hover:bg-[#2e3344] text-white/90 text-xs px-4 py-2 rounded-xl transition-all border border-white/5 shadow-sm active:scale-95 flex items-center gap-1.5 font-medium shrink-0"
              title={lang === 'zh' ? '注销当前账户并返回登录界面' : 'Log out'}
            >
              <LogOut className="w-3.5 h-3.5 text-white/80" />
              <span>{lang === 'zh' ? '注销' : 'Log out'}</span>
            </button>
          </div>

          {/* 电子邮件展示行 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-12 text-sm">
            <span className="text-white/60 sm:w-24 shrink-0">
              {lang === 'zh' ? '电子邮件' : 'Email'}
            </span>
            <span className="text-white font-mono font-medium">
              {email}
            </span>
          </div>

          {/* 访问权限有效 · beta 卡片 (对标截图内部深色框) */}
          <div className="bg-[#1c202a] border border-white/5 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
            <div className="flex items-start gap-3.5">
              {/* 绿色圆圈勾标 */}
              <div className="w-6 h-6 rounded-full border border-emerald-400/50 bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
              </div>

              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-white">
                  {lang === 'zh' ? '访问权限有效 · beta' : 'Access valid · beta'}
                </div>
                <div className="text-xs text-white/50">
                  {lang === 'zh' ? '有效期至 01.11.2026 06:59' : 'Valid until 01.11.2026 06:59'}
                </div>
              </div>
            </div>

            {/* 扩展访问权限按钮 */}
            <button
              onClick={() => setActiveModal('extend')}
              className="bg-[#242733] hover:bg-[#2e3344] text-white/90 text-xs px-4 py-2.5 rounded-xl transition-all border border-white/5 shadow-sm active:scale-95 flex items-center gap-2 font-medium shrink-0 self-start sm:self-auto"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-white/80" />
              <span>{lang === 'zh' ? '扩展访问权限' : 'Extend access'}</span>
            </button>
          </div>
        </div>

        {/* ===================== 卡片 2: 管理账户 (对标截图下部) ===================== */}
        <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
          {/* 紫色小标题 */}
          <div 
            className="text-xs font-semibold tracking-tight"
            style={{ color: accentColor }}
          >
            {lang === 'zh' ? '管理账户' : 'Manage account'}
          </div>

          {/* 描述说明 */}
          <p className="text-xs text-white/60 leading-relaxed">
            {lang === 'zh'
              ? '这些区域会在程序内安全打开。您的订阅和套餐购买在上方的「访问权限」下。'
              : 'These areas open securely within the program. Your subscription and package purchases are under "Access" above.'}
          </p>

          {/* 选项列表 */}
          <div className="space-y-3 pt-1">
            {/* 项 1: 账单 */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-white/[0.04] last:border-0">
              <div className="flex items-start gap-3.5">
                <Receipt className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white">
                    {lang === 'zh' ? '账单' : 'Billing'}
                  </div>
                  <div className="text-xs text-white/50">
                    {lang === 'zh' ? '您账户的账单地址和发票。' : 'Billing address and invoices for your account.'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('billing')}
                className="bg-[#242733] hover:bg-[#2e3344] text-white/90 text-xs px-5 py-2.5 rounded-xl transition-all border border-white/5 shadow-sm active:scale-95 font-medium shrink-0"
              >
                {lang === 'zh' ? '打开' : 'Open'}
              </button>
            </div>

            {/* 项 2: 登录信息 */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-white/[0.04] last:border-0">
              <div className="flex items-start gap-3.5">
                <Key className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white">
                    {lang === 'zh' ? '登录信息' : 'Sign-in information'}
                  </div>
                  <div className="text-xs text-white/50">
                    {lang === 'zh'
                      ? '更改电子邮件和密码，关联 Google 或 Facebook。'
                      : 'Change email and password, link Google or Facebook.'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('security')}
                className="bg-[#242733] hover:bg-[#2e3344] text-white/90 text-xs px-5 py-2.5 rounded-xl transition-all border border-white/5 shadow-sm active:scale-95 font-medium shrink-0"
              >
                {lang === 'zh' ? '打开' : 'Open'}
              </button>
            </div>

            {/* 项 3: 设备 */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-start gap-3.5">
                <Laptop className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white">
                    {lang === 'zh' ? '设备' : 'Devices'}
                  </div>
                  <div className="text-xs text-white/50">
                    {lang === 'zh' ? '查看已登录的设备并逐个注销。' : 'View signed-in devices and sign out individually.'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('devices')}
                className="bg-[#242733] hover:bg-[#2e3344] text-white/90 text-xs px-5 py-2.5 rounded-xl transition-all border border-white/5 shadow-sm active:scale-95 font-medium shrink-0"
              >
                {lang === 'zh' ? '打开' : 'Open'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== 账单管理弹窗 ===================== */}
      {activeModal === 'billing' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141720] border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-[#1c202d] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Receipt className="w-4 h-4 text-purple-400" />
                <span>{lang === 'zh' ? '账户账单与发票' : 'Invoices & Billing'}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-[#0e1017] p-3.5 rounded-xl border border-white/5 space-y-1">
                <div className="text-xs text-white/40">{lang === 'zh' ? '当前订阅方案' : 'Current Plan'}</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Connect Pro Enterprise Edition</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">ACTIVE</span>
                </div>
                <div className="text-xs text-white/50 pt-1">
                  {lang === 'zh' ? '账单周期：每年自动续订 · 下次扣费日 2026-11-01' : 'Cycle: Annual auto-renew · Next date 2026-11-01'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80">{lang === 'zh' ? '历史电子发票' : 'Past Invoices'}</label>
                <div className="space-y-1.5 text-xs">
                  <div className="bg-[#1a1d28] p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">INV-202511-00892</div>
                      <div className="text-white/40 text-[10px]">2025-11-01 · 899.00 EUR (VAT Paid)</div>
                    </div>
                    <span className="text-purple-400 hover:text-purple-300 cursor-pointer font-mono">{lang === 'zh' ? '下载 PDF' : 'PDF'}</span>
                  </div>
                  <div className="bg-[#1a1d28] p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">INV-202411-00341</div>
                      <div className="text-white/40 text-[10px]">2024-11-01 · 899.00 EUR</div>
                    </div>
                    <span className="text-purple-400 hover:text-purple-300 cursor-pointer font-mono">{lang === 'zh' ? '下载 PDF' : 'PDF'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1c202d] px-5 py-3 border-t border-white/10 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                {lang === 'zh' ? '关闭' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 登录信息与安全设置弹窗 ===================== */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141720] border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-[#1c202d] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Key className="w-4 h-4 text-purple-400" />
                <span>{lang === 'zh' ? '登录凭据与身份绑定' : 'Sign-in Credentials'}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 block">{lang === 'zh' ? '绑定的主邮箱' : 'Primary Email'}</label>
                <input
                  type="text"
                  readOnly
                  value={email}
                  className="w-full bg-[#0e1017] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-xs font-semibold text-white/80">{lang === 'zh' ? '第三方快捷登录关联' : 'Connected Accounts'}</label>
                <div className="flex items-center justify-between p-3 bg-[#1a1d28] rounded-xl text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-white font-medium">Google Account ({email})</span>
                  </div>
                  <span className="text-emerald-400 text-[11px]">{lang === 'zh' ? '已关联' : 'Connected'}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1c202d] px-5 py-3 border-t border-white/10 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                {lang === 'zh' ? '完成' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 设备管理弹窗 ===================== */}
      {activeModal === 'devices' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141720] border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-[#1c202d] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Laptop className="w-4 h-4 text-purple-400" />
                <span>{lang === 'zh' ? '已授权登录设备' : 'Authorized Devices'}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {devices.map(device => (
                <div
                  key={device.id}
                  className="bg-[#1a1d28] border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-purple-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{device.name}</span>
                        {device.current && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">THIS DEVICE</span>
                        )}
                      </div>
                      <div className="text-white/40 text-[10px] font-mono mt-0.5">
                        IP: {device.ip} · {device.lastActive}
                      </div>
                    </div>
                  </div>

                  {!device.current && (
                    <button
                      onClick={() => handleRemoveDevice(device.id)}
                      className="text-rose-400 hover:text-rose-300 text-xs px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                    >
                      {lang === 'zh' ? '注销' : 'Revoke'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-[#1c202d] px-5 py-3 border-t border-white/10 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                {lang === 'zh' ? '关闭' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 扩展访问权限弹窗 ===================== */}
      {activeModal === 'extend' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141720] border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-[#1c202d] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ShoppingCart className="w-4 h-4 text-purple-400" />
                <span>{lang === 'zh' ? '扩展与续订访问权限' : 'Extend Access & Packages'}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-[#1a1d28] border border-purple-500/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">Connect 商业尊享版 (1 年)</span>
                  <span className="text-purple-400 font-bold font-mono text-base">€899</span>
                </div>
                <p className="text-xs text-white/50">
                  包含不限量远程编码并发隧道、DoIP 硬件穿透、专属技术支持与企业独立品牌白标。
                </p>
                <button
                  onClick={() => {
                    alert(lang === 'zh' ? '已成功续订 1 年！' : 'Successfully renewed for 1 year!');
                    setActiveModal(null);
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  {lang === 'zh' ? '立即续订' : 'Renew Subscription'}
                </button>
              </div>
            </div>

            <div className="bg-[#1c202d] px-5 py-3 border-t border-white/10 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
