import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { LangType } from '../types';

interface EmailAuthModalProps {
  lang: LangType;
  onLoginSuccess: (userData: { username: string; email: string }) => void;
  programName?: string;
  version?: string;
  accentColor?: string;
}

export const EmailAuthModal: React.FC<EmailAuthModalProps> = ({
  lang,
  onLoginSuccess,
  programName = '泰兴悦之宝 Connect',
  version = 'v3.26.0',
  accentColor = '#a855f7'
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // 表单状态
  const [email, setEmail] = useState('bmwtpi@gmail.com');
  const [username, setUsername] = useState('haifeizhou');
  const [password, setPassword] = useState('12345678');
  const [confirmPassword, setConfirmPassword] = useState('12345678');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // 提示与加载
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError(lang === 'zh' ? '请输入有效的电子邮箱地址' : 'Please enter a valid email address');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg(lang === 'zh' ? `密码重置邮件已发送至 ${trimmedEmail}，请查收！` : `Password reset link sent to ${trimmedEmail}!`);
        setTimeout(() => setMode('login'), 3000);
      }, 800);
      return;
    }

    if (!password.trim()) {
      setError(lang === 'zh' ? '请输入登录密码' : 'Please enter password');
      return;
    }

    if (mode === 'register') {
      if (!username.trim()) {
        setError(lang === 'zh' ? '请输入您的用户名 / 登录身份' : 'Please enter a username');
        return;
      }
      if (password !== confirmPassword) {
        setError(lang === 'zh' ? '两次输入的密码不一致' : 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError(lang === 'zh' ? '密码长度至少需 6 位字符' : 'Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const finalUsername = username.trim() || trimmedEmail.split('@')[0];
      
      // 保存用户数据到本地
      if (rememberMe) {
        localStorage.setItem('cfg_user_email', trimmedEmail);
        localStorage.setItem('cfg_user_name', finalUsername);
        localStorage.setItem('bimmerbridge_user', finalUsername);
        localStorage.setItem('cfg_is_logged_in', 'true');
      }

      onLoginSuccess({
        username: finalUsername,
        email: trimmedEmail
      });
    }, 600);
  };

  // 快速体验登录
  const handleQuickDemo = () => {
    setEmail('bmwtpi@gmail.com');
    setUsername('haifeizhou');
    setPassword('12345678');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('cfg_user_email', 'bmwtpi@gmail.com');
      localStorage.setItem('cfg_user_name', 'haifeizhou');
      localStorage.setItem('bimmerbridge_user', 'haifeizhou');
      localStorage.setItem('cfg_is_logged_in', 'true');
      onLoginSuccess({
        username: 'haifeizhou',
        email: 'bmwtpi@gmail.com'
      });
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0c10] text-white flex flex-col font-sans select-none">
      {/* 顶部模拟窗口栏 (对标截图最顶部) */}
      <div className="h-10 bg-[#07080b] border-b border-white/[0.06] flex items-center justify-between px-4 text-xs select-none">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
            C
          </div>
          <span className="font-medium text-white/90">{programName}</span>
          <span className="text-white/40 font-mono text-[11px]">· {version}</span>
        </div>
        <div className="flex items-center gap-3 text-white/40">
          <span className="hover:text-white cursor-pointer">一</span>
          <span className="hover:text-white cursor-pointer">□</span>
          <span className="hover:text-white cursor-pointer">✕</span>
        </div>
      </div>

      {/* 主居中认证卡片 */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* 背景氛围微光 */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#12141a] border border-white/[0.08] rounded-2xl p-7 sm:p-8 shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* 标题部分 */}
          <div className="space-y-1.5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/10">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {mode === 'login' && (lang === 'zh' ? '登录 Connect 账户' : 'Sign in to Connect')}
              {mode === 'register' && (lang === 'zh' ? '创建新账户' : 'Create New Account')}
              {mode === 'forgot' && (lang === 'zh' ? '找回密码' : 'Reset Password')}
            </h1>
            <p className="text-xs text-white/50">
              {lang === 'zh'
                ? '登录或创建账户以使用远程编码。'
                : 'Sign in or create an account to use remote coding.'}
            </p>
          </div>

          {/* 模式切换选项卡 (登录 / 注册) */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-[#1c202a] border border-white/5 rounded-xl">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-[#242733] text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {lang === 'zh' ? '邮箱登录' : 'Email Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-[#242733] text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {lang === 'zh' ? '注册新账号' : 'Register'}
              </button>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 成功提示 */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 电子邮箱 */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-medium flex items-center justify-between">
                <span>{lang === 'zh' ? '电子邮箱' : 'Email Address'}</span>
                <span className="text-[10px] text-white/40">RFC 5322</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#1c202a] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 shadow-inner font-sans transition-all"
                />
                <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 用户名/登录身份 (注册模式下显示) */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <label className="text-xs text-white/60 font-medium">
                  {lang === 'zh' ? '用户名 / 登录身份' : 'Username / Identity'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. haifeizhou"
                    required
                    className="w-full bg-[#1c202a] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 shadow-inner font-sans transition-all"
                  />
                  <User className="w-4 h-4 text-white/40 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* 密码输入 */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <label className="font-medium">{lang === 'zh' ? '密码' : 'Password'}</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); }}
                      className="text-purple-400 hover:text-purple-300 text-[11px] transition-colors"
                    >
                      {lang === 'zh' ? '忘记密码？' : 'Forgot?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#1c202a] border border-white/5 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 shadow-inner font-mono transition-all"
                  />
                  <Lock className="w-4 h-4 text-white/40 absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* 确认密码 (注册模式下显示) */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <label className="text-xs text-white/60 font-medium">
                  {lang === 'zh' ? '确认密码' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#1c202a] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 shadow-inner font-mono transition-all"
                  />
                  <KeyRound className="w-4 h-4 text-white/40 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* 记住我 */}
            {mode === 'login' && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#1c202a] border-white/20 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-white/60 cursor-pointer select-none">
                  {lang === 'zh' ? '保持登录状态 (记住我的凭据)' : 'Keep me logged in on this device'}
                </label>
              </div>
            )}

            {/* 提交主按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: accentColor }}
            >
              <span>
                {isLoading ? (lang === 'zh' ? '正在验证身份 ...' : 'Verifying...') : (
                  mode === 'login' ? (lang === 'zh' ? '登录并进入远程系统' : 'Sign In') :
                  mode === 'register' ? (lang === 'zh' ? '完成注册并登录' : 'Complete Registration') :
                  (lang === 'zh' ? '发送密码重置链接' : 'Send Reset Link')
                )}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 快捷一键体验登录 (方便直接体验 haifeizhou 账户) */}
          <div className="pt-2 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center gap-1.5 mx-auto py-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? '一键以 haifeizhou (bmwtpi@gmail.com) 快速登录' : 'Quick Demo: haifeizhou'}</span>
            </button>
          </div>

          {/* 底部保障与条款 */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/30 text-center">
            <ShieldCheck className="w-3 h-3 text-emerald-400/70" />
            <span>{lang === 'zh' ? 'TLS 1.3 端到端加密 · 账户符合 GDPR 合规规范' : 'TLS 1.3 Encrypted · GDPR Compliant'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
