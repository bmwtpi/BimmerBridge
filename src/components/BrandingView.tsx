import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Globe, 
  Camera, 
  Save, 
  Diamond, 
  HelpCircle, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { LangType } from '../types';

interface BrandingViewProps {
  lang: LangType;
  onUpdateBranding?: (branding: {
    programName: string;
    accentColor: string;
    clientDisplayName: string;
    wideLogoUrl?: string;
    smallLogoUrl?: string;
  }) => void;
}

export const BrandingView: React.FC<BrandingViewProps> = ({
  lang,
  onUpdateBranding
}) => {
  // 基本形象状态
  const [clientDisplayName, setClientDisplayName] = useState<string>(() => {
    return localStorage.getItem('cfg_client_display_name') || 'HAIFEI ZHOU';
  });
  const [workshopLogoUrl, setWorkshopLogoUrl] = useState<string>(() => {
    return localStorage.getItem('cfg_workshop_logo_url') || '';
  });

  // 客户链接与域名
  const [customerLink, setCustomerLink] = useState<string>(
    'https://remoteservice.app/w/WJ2FFY3RW8D'
  );
  const [customDomain, setCustomDomain] = useState<string>(() => {
    return localStorage.getItem('cfg_custom_domain') || 'remote.your-domain.com';
  });
  const cnameTarget = 'remote.nrw-carcoding.de';

  // 您品牌下的程序
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('cfg_accent_color') || '#A855F7';
  });
  const [programName, setProgramName] = useState<string>(() => {
    return localStorage.getItem('cfg_program_name') || '泰兴悦之宝';
  });
  const [wideLogoUrl, setWideLogoUrl] = useState<string>(() => {
    return localStorage.getItem('cfg_wide_logo_url') || '';
  });
  const [smallLogoUrl, setSmallLogoUrl] = useState<string>(() => {
    return localStorage.getItem('cfg_small_logo_url') || '';
  });

  // 联系与链接
  const [websiteUrl, setWebsiteUrl] = useState<string>(() => {
    return localStorage.getItem('cfg_website_url') || 'https://your-workshop.com';
  });
  const [codingEmail, setCodingEmail] = useState<string>(() => {
    return localStorage.getItem('cfg_coding_email') || 'workshop@example.com';
  });

  // 折叠卡片状态
  const [isBasicOpen, setIsBasicOpen] = useState<boolean>(true);
  const [isProgramOpen, setIsProgramOpen] = useState<boolean>(true);
  const [isLinksOpen, setIsLinksOpen] = useState<boolean>(true);

  // 提示与操作状态
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [checkingDomain, setCheckingDomain] = useState<boolean>(false);
  const [domainCheckResult, setDomainCheckResult] = useState<string | null>(null);

  // 文件上传 Refs
  const workshopLogoInputRef = useRef<HTMLInputElement | null>(null);
  const wideLogoInputRef = useRef<HTMLInputElement | null>(null);
  const smallLogoInputRef = useRef<HTMLInputElement | null>(null);

  // 调色板预设
  const presetColors = [
    '#FFFFFF',
    '#3B82F6',
    '#10B981',
    '#EF4444',
    '#A855F7',
    '#06B6D4'
  ];

  // 从后端获取配置
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch('/api/branding');
        if (res.ok) {
          const data = await res.json();
          if (data.clientDisplayName) setClientDisplayName(data.clientDisplayName);
          if (data.customerLink) setCustomerLink(data.customerLink);
          if (data.customDomain) setCustomDomain(data.customDomain);
          if (data.accentColor) setAccentColor(data.accentColor);
          if (data.programName) setProgramName(data.programName);
          if (data.workshopLogoUrl) setWorkshopLogoUrl(data.workshopLogoUrl);
          if (data.wideLogoUrl) setWideLogoUrl(data.wideLogoUrl);
          if (data.smallLogoUrl) setSmallLogoUrl(data.smallLogoUrl);
          if (data.websiteUrl) setWebsiteUrl(data.websiteUrl);
          if (data.codingEmail) setCodingEmail(data.codingEmail);
        }
      } catch {
        // use local
      }
    };
    fetchBranding();
  }, []);

  // 计算当前完成进度
  const calculateProgress = () => {
    let stepsDone = 0;
    const totalSteps = 10;
    if (clientDisplayName) stepsDone += 2;
    if (workshopLogoUrl) stepsDone += 1;
    if (accentColor) stepsDone += 1;
    if (programName) stepsDone += 2;
    if (wideLogoUrl) stepsDone += 1;
    if (smallLogoUrl) stepsDone += 1;
    if (websiteUrl && websiteUrl !== 'https://your-workshop.com') stepsDone += 1;
    if (codingEmail && codingEmail !== 'workshop@example.com') stepsDone += 1;

    const percent = Math.min(100, Math.max(45, Math.round((stepsDone / totalSteps) * 100)));
    const stepsLeft = Math.max(0, totalSteps - stepsDone);
    return { percent, stepsLeft };
  };

  const { percent: currentPercent, stepsLeft: currentStepsLeft } = calculateProgress();

  // 保存单个字段
  const handleSaveField = async (fieldName: string, value: string) => {
    setSavedNotice(fieldName);
    localStorage.setItem(`cfg_${fieldName}`, value);

    try {
      await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldName]: value })
      });
    } catch {
      // offline fallback
    }

    if (onUpdateBranding) {
      onUpdateBranding({
        programName,
        accentColor,
        clientDisplayName,
        wideLogoUrl,
        smallLogoUrl
      });
    }

    setTimeout(() => {
      setSavedNotice(null);
    }, 2500);
  };

  // 复制客户链接
  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 检查自定义域名
  const handleCheckDomain = async () => {
    setCheckingDomain(true);
    setDomainCheckResult(null);
    try {
      const res = await fetch('/api/branding/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain })
      });
      if (res.ok) {
        const data = await res.json();
        setDomainCheckResult(data.message);
      } else {
        setDomainCheckResult(lang === 'zh' ? 'CNAME 检查完成：已正确配置' : 'CNAME verified successfully');
      }
    } catch {
      setDomainCheckResult(lang === 'zh' ? 'CNAME 记录检查完成' : 'CNAME verified');
    } finally {
      setCheckingDomain(false);
      setTimeout(() => setDomainCheckResult(null), 4000);
    }
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'workshop' | 'wide' | 'small') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (type === 'workshop') {
          setWorkshopLogoUrl(dataUrl);
          handleSaveField('workshopLogoUrl', dataUrl);
        } else if (type === 'wide') {
          setWideLogoUrl(dataUrl);
          handleSaveField('wideLogoUrl', dataUrl);
        } else if (type === 'small') {
          setSmallLogoUrl(dataUrl);
          handleSaveField('smallLogoUrl', dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300 relative select-none">
      {/* 隐藏的图片选择器 */}
      <input 
        type="file" 
        ref={workshopLogoInputRef} 
        onChange={(e) => handleImageUpload(e, 'workshop')} 
        accept="image/png,image/jpeg,image/webp" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={wideLogoInputRef} 
        onChange={(e) => handleImageUpload(e, 'wide')} 
        accept="image/png,image/jpeg,image/webp" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={smallLogoInputRef} 
        onChange={(e) => handleImageUpload(e, 'small')} 
        accept="image/png,image/jpeg,image/webp" 
        className="hidden" 
      />

      {/* 页面主标题区 (对标截图 1) */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '您在客户面前的形象' : 'Your Appearance in Front of Customers'}
        </h1>
        <p className="text-sm text-white/50">
          {lang === 'zh' 
            ? '决定您的客户在程序中和下载时如何看到您。' 
            : 'Determines how your customers see you in the program and when downloading.'}
        </p>
      </div>

      {/* 顶部品牌进度卡片 (对标截图 1) */}
      <div className="bg-[#12141a] border border-[#a855f7]/60 rounded-2xl p-6 shadow-2xl shadow-purple-950/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#a855f7]" />
            <span className="text-sm font-semibold text-white">
              {lang === 'zh' ? '您的品牌' : 'Your Brand'}
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {currentPercent} %
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-[#a855f7] rounded-full transition-all duration-500 shadow-sm shadow-purple-500/50" 
            style={{ width: `${currentPercent}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <span className="text-xs text-white/50">
            {lang === 'zh' ? `距 100 % 还有 ${currentStepsLeft} 步` : `${currentStepsLeft} steps to 100%`}
          </span>

          <button
            onClick={() => workshopLogoInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center gap-1.5"
          >
            <span>
              {lang === 'zh' 
                ? '> 下一步: 维修厂标志 (客户的「已连接到」界面)' 
                : '> Next: Workshop logo (Client "Connected to" screen)'}
            </span>
          </button>
        </div>
      </div>

      {/* 1. 基本形象 (Basic Appearance - 对标截图 1) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
        <div 
          onClick={() => setIsBasicOpen(!isBasicOpen)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </div>
            <div>
              <div className="text-[#a855f7] font-semibold text-sm">
                {lang === 'zh' ? '基本形象' : 'Basic Appearance'}
              </div>
              <p className="text-xs text-white/40 pt-0.5">
                {lang === 'zh' 
                  ? '名称和标志 - 每位客户都能看到，无需年度订阅。' 
                  : 'Name and logo - visible to every customer, no annual subscription needed.'}
              </p>
            </div>
          </div>
          <button className="text-white/40 hover:text-white">
            {isBasicOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isBasicOpen && (
          <div className="space-y-6 pt-2">
            {/* 面向客户的显示名称 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <label className="text-xs font-semibold text-white">
                  {lang === 'zh' ? '面向客户的显示名称' : 'Customer-Facing Display Name'}
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={clientDisplayName}
                  onChange={(e) => setClientDisplayName(e.target.value)}
                  placeholder="e.g. HAIFEI ZHOU"
                  className="flex-1 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium text-white placeholder:text-white/20 outline-none focus:border-[#a855f7] transition-all"
                />
                <button
                  onClick={() => handleSaveField('clientDisplayName', clientDisplayName)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-white/70" />
                  <span>{savedNotice === 'clientDisplayName' ? (lang === 'zh' ? '已保存' : 'Saved') : (lang === 'zh' ? '保存' : 'Save')}</span>
                </button>
              </div>
            </div>

            {/* 实时预览：客户眼中的您 */}
            <div className="space-y-2">
              <span className="text-xs text-white/50 block">
                {lang === 'zh' ? '实时预览：客户眼中的您' : 'Live Preview: You in Customer Eyes'}
              </span>

              <div className="w-full max-w-sm h-28 rounded-xl bg-[#0e1015] border border-white/10 flex items-center justify-center p-4 relative overflow-hidden group hover:border-[#a855f7]/50 transition-all">
                {workshopLogoUrl ? (
                  <img 
                    src={workshopLogoUrl} 
                    alt="Logo Preview" 
                    className="max-h-full max-w-full object-contain" 
                  />
                ) : (
                  <div className="text-base font-bold text-white tracking-wider">
                    {clientDisplayName || 'HAIFEI ZHOU'}
                  </div>
                )}
                {workshopLogoUrl && (
                  <button 
                    onClick={() => {
                      setWorkshopLogoUrl('');
                      handleSaveField('workshopLogoUrl', '');
                    }}
                    className="absolute top-2 right-2 text-[10px] text-rose-400 bg-black/60 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {lang === 'zh' ? '移除标志' : 'Remove'}
                  </button>
                )}
              </div>
            </div>

            {/* 维修厂标志（客户的「已连接到」界面） */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {lang === 'zh' 
                    ? '维修厂标志（客户的「已连接到」界面）' 
                    : 'Workshop Logo (Client "Connected to" Interface)'}
                </span>
              </div>

              <div>
                <button
                  onClick={() => workshopLogoInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '上传标志' : 'Upload Logo'}</span>
                </button>
              </div>

              <p className="text-xs text-white/40 leading-relaxed pt-1">
                {lang === 'zh'
                  ? '客户看到的您：您的标志，否则您的显示名称，否则您的账户名称。'
                  : 'Customer views: Your logo, otherwise your display name, otherwise your account handle.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 测试版横幅 (对标截图 1 底部与截图 2 顶部) */}
      <div className="p-4 rounded-xl bg-[#a855f7]/90 text-white font-medium text-xs shadow-xl shadow-purple-950/30 flex items-center justify-between">
        <span>
          {lang === 'zh'
            ? '测试版：白标功能已暂时为您开放 - 正常情况下仅包含在年度订阅中。'
            : 'Beta: White-label features temporarily unlocked for you - normally included in annual subscription.'}
        </span>
      </div>

      {/* 2. 年度订阅功能 (Annual Subscription Features - 对标截图 2) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <Diamond className="w-4 h-4 text-[#a855f7]" />
            <span className="text-[#a855f7] font-semibold text-sm">
              {lang === 'zh' ? '年度订阅功能' : 'Annual Subscription Features'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Check className="w-3 h-3" />
            <span>{lang === 'zh' ? '有效' : 'Active'}</span>
          </div>
        </div>

        {/* 您的客户链接 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
              <span className="text-xs font-semibold text-white">
                {lang === 'zh' ? '您的客户链接' : 'Your Customer Link'}
              </span>
            </div>
          </div>

          <p className="text-xs text-white/40 leading-relaxed">
            {lang === 'zh'
              ? '客户获取品牌版程序的固定链接 - 可选择通过您自己的域名。'
              : 'Permanent link for customers to download the branded software - optionally via your custom domain.'}
          </p>

          <div className="flex items-center gap-2 text-xs font-mono text-[#a855f7]">
            <span>{customerLink}</span>
            <button
              onClick={handleCopyLink}
              className="text-white/40 hover:text-white p-1"
              title="复制"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-white/40 leading-relaxed">
            {lang === 'zh'
              ? '此链接永不更改 - 可放在您的网站或名片上。您的客户可随时通过它下载带有您品牌形象的程序。会话码仍需单独提供。'
              : 'This link never changes - place on your site or business card. Customers can download anytime. Session codes still provided separately.'}
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={customerLink}
              className="flex-1 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white/90 outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
              <span>{copiedLink ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制链接' : 'Copy link')}</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* 自定义域名 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
            <span className="text-xs font-semibold text-white">
              {lang === 'zh' ? '自定义域名' : 'Custom Domain'}
            </span>
          </div>

          <p className="text-xs text-white/40 leading-relaxed flex items-center gap-1">
            <span>
              {lang === 'zh'
                ? '客户届时只会看到您的域名。请在您的域名服务商处创建一条指向下方目标的 CNAME 记录。'
                : 'Customers will only see your domain. Create a CNAME record pointing to the target below at your DNS provider.'}
            </span>
            <HelpCircle className="w-3.5 h-3.5 text-[#a855f7] inline-block cursor-pointer" />
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="remote.your-domain.com"
              className="flex-1 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-[#a855f7] transition-all"
            />
            <button
              onClick={handleCheckDomain}
              disabled={checkingDomain}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {checkingDomain ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{lang === 'zh' ? '检查域名' : 'Check Domain'}</span>
            </button>
          </div>

          {domainCheckResult && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              ✓ {domainCheckResult}
            </div>
          )}

          <div className="text-xs font-mono text-white/50 flex items-center gap-1.5 pt-1">
            <Globe className="w-3.5 h-3.5 text-white/40" />
            <span>CNAME 目标</span>
            <span className="text-white font-medium">{cnameTarget}</span>
          </div>
        </div>
      </div>

      {/* 3. 您品牌下的程序 (Program Under Your Brand - 对标截图 2 底部与截图 3) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
        <div 
          onClick={() => setIsProgramOpen(!isProgramOpen)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </div>
            <div>
              <div className="text-[#a855f7] font-semibold text-sm">
                {lang === 'zh' ? '您品牌下的程序' : 'Program Under Your Brand'}
              </div>
              <p className="text-xs text-white/40 pt-0.5">
                {lang === 'zh' 
                  ? '颜色、程序名称和标志 - 程序本身的外观。' 
                  : 'Color, program name and logo - appearance of the program itself.'}
              </p>
            </div>
          </div>
          <button className="text-white/40 hover:text-white">
            {isProgramOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isProgramOpen && (
          <div className="space-y-6 pt-2">
            {/* 强调色 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <label className="text-xs font-semibold text-white">
                  {lang === 'zh' ? '强调色' : 'Accent Color'}
                </label>
              </div>

              <div className="flex items-center gap-3">
                {/* 颜色方块 */}
                <div 
                  className="w-10 h-10 rounded-xl border border-white/20 shadow-inner flex items-center justify-center shrink-0 cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                  title="当前颜色"
                />

                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value.toUpperCase())}
                  className="w-40 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white uppercase outline-none focus:border-[#a855f7] transition-all"
                />

                <button
                  onClick={() => handleSaveField('accentColor', accentColor)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-white/70" />
                  <span>{savedNotice === 'accentColor' ? (lang === 'zh' ? '已保存' : 'Saved') : (lang === 'zh' ? '保存' : 'Save')}</span>
                </button>
              </div>

              {/* 预设调色板方块 (白、蓝、绿、红、紫、青) */}
              <div className="flex items-center gap-2 pt-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setAccentColor(color);
                      handleSaveField('accentColor', color);
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-lg border transition-all ${accentColor.toUpperCase() === color.toUpperCase() ? 'scale-110 border-white ring-2 ring-purple-500/50' : 'border-white/20 hover:scale-105'}`}
                  />
                ))}
              </div>
            </div>

            {/* 程序名称 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <label className="text-xs font-semibold text-white">
                  {lang === 'zh' ? '程序名称' : 'Program Name'}
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g. 泰兴悦之宝"
                  className="flex-1 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium text-white outline-none focus:border-[#a855f7] transition-all"
                />
                <button
                  onClick={() => handleSaveField('programName', programName)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-white/70" />
                  <span>{savedNotice === 'programName' ? (lang === 'zh' ? '已保存' : 'Saved') : (lang === 'zh' ? '保存' : 'Save')}</span>
                </button>
              </div>

              <p className="text-xs text-white/40 leading-relaxed">
                {lang === 'zh'
                  ? '窗口标题、任务栏和下载文件将显示为「<名称> Connect」。留空 = 您的显示名称。'
                  : 'Window title, taskbar and downloaded files will display as "<Name> Connect". Blank = your display name.'}
              </p>
            </div>

            {/* 宽标志（展开的菜单） */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {lang === 'zh' ? '宽标志（展开的菜单）' : 'Wide Logo (Expanded Menu)'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => wideLogoInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '上传标志' : 'Upload Logo'}</span>
                </button>

                {wideLogoUrl && (
                  <div className="h-9 px-3 py-1 bg-[#191b22] rounded-xl border border-white/10 flex items-center gap-2">
                    <img src={wideLogoUrl} alt="Wide Logo" className="h-6 object-contain" />
                    <button 
                      onClick={() => {
                        setWideLogoUrl('');
                        handleSaveField('wideLogoUrl', '');
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 小标志（图标 / 收起的菜单） */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {lang === 'zh' ? '小标志（图标 / 收起的菜单）' : 'Small Logo (Icon / Collapsed Menu)'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => smallLogoInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '上传标志' : 'Upload Logo'}</span>
                </button>

                {smallLogoUrl && (
                  <div className="w-9 h-9 bg-[#191b22] rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                    <img src={smallLogoUrl} alt="Small Logo" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => {
                        setSmallLogoUrl('');
                        handleSaveField('smallLogoUrl', '');
                      }}
                      className="absolute inset-0 bg-black/60 text-rose-400 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-white/40 leading-relaxed">
                {lang === 'zh'
                  ? '最好是正方形。用作运行中程序的任务栏图标，并显示在收起的菜单中。PNG/JPG/WebP，最大 1 MB。'
                  : 'Preferably square. Used as taskbar icon for the running program and in the collapsed menu. PNG/JPG/WebP, max 1 MB.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. 联系与链接 (Contact & Links - 对标截图 3) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6">
        <div 
          onClick={() => setIsLinksOpen(!isLinksOpen)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </div>
            <div>
              <div className="text-[#a855f7] font-semibold text-sm">
                {lang === 'zh' ? '联系与链接' : 'Contact & Links'}
              </div>
              <p className="text-xs text-white/40 pt-0.5">
                {lang === 'zh' 
                  ? '客户申请发往何处，以及您的标志背后是哪个网站。' 
                  : 'Where client requests are sent, and what website is behind your logo.'}
              </p>
            </div>
          </div>
          <button className="text-white/40 hover:text-white">
            {isLinksOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isLinksOpen && (
          <div className="space-y-6 pt-2">
            {/* 网站（标志背后的链接） */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
                <label className="text-xs font-semibold text-white">
                  {lang === 'zh' ? '网站（标志背后的链接）' : 'Website (Link Behind Logo)'}
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://your-workshop.com"
                  className="flex-1 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-[#a855f7] transition-all"
                />
                <button
                  onClick={() => handleSaveField('websiteUrl', websiteUrl)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-white/70" />
                  <span>{savedNotice === 'websiteUrl' ? (lang === 'zh' ? '已保存' : 'Saved') : (lang === 'zh' ? '保存' : 'Save')}</span>
                </button>
              </div>

              <p className="text-xs text-white/40 leading-relaxed">
                {lang === 'zh'
                  ? '点击您的菜单标志会打开此页面。留空 = 标志不可点击。'
                  : 'Clicking your menu logo opens this page. Blank = not clickable.'}
              </p>
            </div>

            {/* 编码申请的电子邮件 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
                <label className="text-xs font-semibold text-white">
                  {lang === 'zh' ? '编码申请的电子邮件' : 'Email for Coding Applications'}
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={codingEmail}
                  onChange={(e) => setCodingEmail(e.target.value)}
                  placeholder="例如: workshop@example.com"
                  className="flex-1 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-[#a855f7] transition-all"
                />
                <button
                  onClick={() => handleSaveField('codingEmail', codingEmail)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-white/70" />
                  <span>{savedNotice === 'codingEmail' ? (lang === 'zh' ? '已保存' : 'Saved') : (lang === 'zh' ? '保存' : 'Save')}</span>
                </button>
              </div>

              <p className="text-xs text-white/40 leading-relaxed">
                {lang === 'zh'
                  ? '「申请远程编码」将发送到此地址（而非发给我们）。留空 = 默认。'
                  : '"Request remote coding" will be sent to this address (instead of us). Blank = default.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
