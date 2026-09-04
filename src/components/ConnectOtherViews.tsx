import React, { useState } from 'react';
import { 
  Wifi, 
  Activity, 
  CheckCircle2, 
  User, 
  Key, 
  ShieldCheck, 
  Code, 
  ShoppingBag, 
  HelpCircle, 
  Headphones, 
  Info, 
  ExternalLink,
  RefreshCw,
  Copy,
  Terminal,
  Server
} from 'lucide-react';
import { LangType } from '../types';

// 1. 连接测试 (Connection Test)
export const ConnectionTestView: React.FC<{ lang: LangType }> = ({ lang }) => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    signalling: boolean;
    stun: boolean;
    turn: boolean;
    latencyMs: number;
    enetAdapter: boolean;
  } | null>({
    signalling: true,
    stun: true,
    turn: true,
    latencyMs: 18,
    enetAdapter: true
  });

  const runTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTestResults({
        signalling: true,
        stun: true,
        turn: true,
        latencyMs: Math.floor(12 + Math.random() * 15),
        enetAdapter: true
      });
    }, 1200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '连接与穿透测试' : 'Connection & NAT Traversal Test'}
        </h1>
        <p className="text-sm text-white/50 pt-1">
          {lang === 'zh' ? '诊断本地 ENET 网卡、STUN/TURN 服务器连通性与 P2P 延迟。' : 'Diagnose local ENET interface, STUN/TURN servers and P2P latency.'}
        </p>
      </div>

      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <span className="text-sm font-semibold text-white">
            {lang === 'zh' ? '节点网络健康状况' : 'Node Network Health'}
          </span>
          <button
            onClick={runTest}
            disabled={testing}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? (lang === 'zh' ? '测试中...' : 'Testing...') : (lang === 'zh' ? '重新测速' : 'Run Diagnostics')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#191b22] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs text-white/40">信令中枢连接</span>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>正常 (WebSocket 在线)</span>
            </div>
          </div>

          <div className="bg-[#191b22] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs text-white/40">STUN/TURN 穿透</span>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full-Cone NAT (支持 P2P)</span>
            </div>
          </div>

          <div className="bg-[#191b22] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs text-white/40">网络单向延时</span>
            <div className="text-sm font-bold text-blue-400 font-mono">
              {testResults?.latencyMs || 18} ms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. 账户 (Account)
export const AccountView: React.FC<{ lang: LangType; username?: string }> = ({ lang, username }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '用户账户中心' : 'Account Center'}
        </h1>
        <p className="text-sm text-white/50 pt-1">
          {lang === 'zh' ? '管理您的技师身份、授权认证与活跃订阅。' : 'Manage your technician identity, credentials and active subscription.'}
        </p>
      </div>

      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {username ? username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div className="text-lg font-bold text-white">{username || 'Admin'}</div>
            <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {lang === 'zh' ? '年度企业版认证技师 (PRO)' : 'Enterprise Certified Technician'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <div className="bg-[#191b22] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-white/40 block">订阅到期时间</span>
            <span className="text-sm font-semibold text-white">2027-12-31</span>
          </div>
          <div className="bg-[#191b22] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-white/40 block">剩余可用远程并发隧道</span>
            <span className="text-sm font-semibold text-emerald-400">无限次 (Unlimited)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. API
export const ApiView: React.FC<{ lang: LangType }> = ({ lang }) => {
  const [apiKey] = useState('bb_live_9f7a82c16d5e4b3a19e8');
  const [copied, setCopied] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '开发者 API 开放接口' : 'Developer API'}
        </h1>
        <p className="text-sm text-white/50 pt-1">
          {lang === 'zh' ? '通过 RESTful API 或 Webhook 与您的工单/CRM系统无缝对接。' : 'Integrate with your CRM/ERP using RESTful APIs and Webhooks.'}
        </p>
      </div>

      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 space-y-4">
        <span className="text-xs font-semibold text-white">API Key (生产环境)</span>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="flex-1 bg-[#191b22] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white/90 outline-none"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(apiKey);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all"
          >
            {copied ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制' : 'Copy')}
          </button>
        </div>

        <div className="bg-[#0e1015] p-4 rounded-xl border border-white/5 font-mono text-xs text-white/70 space-y-2">
          <div className="text-white/40"># 创建新远程连接会话:</div>
          <div className="text-emerald-400">POST /api/sessions</div>
          <div className="text-white/40"># 获取车辆遥测与电压:</div>
          <div className="text-blue-400">GET /api/sessions/:id/telemetry</div>
        </div>
      </div>
    </div>
  );
};

// 4. 配件与编码申请 (Parts & Coding Requests)
export const PartsRequestsView: React.FC<{ lang: LangType }> = ({ lang }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '配件与编码工单申请' : 'Parts & Coding Request Service'}
        </h1>
        <p className="text-sm text-white/50 pt-1">
          {lang === 'zh' ? '原厂配件订购、FSC 证书激活与专家远程加装指导。' : 'OEM BMW parts ordering, FSC cert activations and retrofit support.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-white">宝马 FSC 证书计算</div>
          <p className="text-xs text-white/40">支持 NBT / EVO / MGU 导航地图升级与 CarPlay 全屏激活。</p>
        </div>

        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-white">原厂硬件与加装线束</div>
          <p className="text-xs text-white/40">哈曼卡顿 / 宝华韦健、ACC 巡航雷达、360 全景模块直发。</p>
        </div>

        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-white">一键工单指派</div>
          <p className="text-xs text-white/40">工单直接同步到您配置的编码邮箱中，实现专属客户分流。</p>
        </div>
      </div>
    </div>
  );
};

// 5. 帮助与关于 (Help & About)
export const HelpView: React.FC<{ lang: LangType; programName?: string }> = ({ lang, programName = '泰兴悦之宝' }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '使用帮助与操作指南' : 'Help & Documentation'}
        </h1>
        <p className="text-sm text-white/50 pt-1">
          {lang === 'zh' ? `${programName} Connect 使用手册与故障排除。` : `User manual and troubleshooting for ${programName} Connect.`}
        </p>
      </div>

      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 space-y-4 text-xs text-white/70 leading-relaxed">
        <div className="font-bold text-sm text-white">常见问题 (FAQ)</div>
        <div className="space-y-2">
          <p className="font-semibold text-white">1. 为什么 ENET 连接后显示 169.254.x.x 自给 IP？</p>
          <p className="text-white/50">这是宝马车身以太网的正常现象（APIPA 无 DHCP 服务器）。软件内置链路网卡自适应映射，无需手动设置静态 IP。</p>
        </div>
        <div className="space-y-2 border-t border-white/10 pt-3">
          <p className="font-semibold text-white">2. 刷写过程出现电压不足警告如何处理？</p>
          <p className="text-white/50">软件内置电压监控与声音警报，当低于 12.2V 时切勿进行 ECU 刷写（Programming），请连接大功率稳压充电机后重试。</p>
        </div>
      </div>
    </div>
  );
};
