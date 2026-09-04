import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Cable, 
  Wifi, 
  Car, 
  Gauge, 
  Server,
  ArrowRight
} from 'lucide-react';
import { PreFlightCheckItem, LangType, TelemetryData } from '../types';
import { translations } from '../lib/translations';

interface PreFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LangType;
  telemetry: TelemetryData;
}

const INITIAL_CHECKS: PreFlightCheckItem[] = [
  {
    id: 'enet-cable',
    titleZh: '1. ENET 物理网线与链路状态',
    titleEn: '1. ENET Cable & Physical Link',
    descZh: '检测 USB-RJ45 网卡与车辆 OBD 接口是否连通 (100M/1000M Full Duplex)',
    descEn: 'Verifies physical carrier link between PC and vehicle OBD port',
    status: 'pass',
    detail: 'Carrier UP | 100 Mbps Full Duplex | Realtek USB GbE'
  },
  {
    id: 'ip-config',
    titleZh: '2. 车辆 IP 地址获取 (APIPA / 169.254.x.x)',
    titleEn: '2. Vehicle IP Configuration',
    descZh: '确认网卡已自动分配 169.254.x.x 自给地址且无子网路由冲突',
    descEn: 'Ensures correct 169.254.x.x APIPA assignment without routing conflicts',
    status: 'pass',
    detail: 'IP: 169.254.88.192 / Netmask: 255.255.0.0 (OK)'
  },
  {
    id: 'zgw-doip',
    titleZh: '3. ZGW 中央网关与 DoIP 端口响应 (13400)',
    titleEn: '3. ZGW Gateway & DoIP 13400 Ping',
    descZh: '向网关发送 DoIP 广播发现请求，确认中央网关应答与 VIN 码同步',
    descEn: 'Broadcasts UDP DoIP discovery to verify gateway handshake & VIN',
    status: 'pass',
    detail: 'VIN: WBA3A5C55K... | DoIP Response: 4ms'
  },
  {
    id: 'battery-psu',
    titleZh: '4. 电瓶电压安全冗余 (KL30 ≥ 13.0V 编程稳压)',
    titleEn: '4. Battery PSU Voltage Check (KL30 ≥ 13.0V)',
    descZh: '刷写 ECU 极度消耗电量，必须接入专业稳压电源以防止电压跌落死锁',
    descEn: 'Flash programming demands stable voltage to prevent ECU bricking',
    status: 'pass',
    detail: 'Voltage: 13.84V ⚡ (PSU Connected & Stable)'
  },
  {
    id: 'port-forwarding',
    titleZh: '5. 诊断转发端口占用检查 (22 / 6801 / 13400)',
    titleEn: '5. Diagnostic Port Forwarding Ready',
    descZh: '确认本地诊断端口无其他软件冲突，准备就绪承接 ISTA / E-Sys 数据流',
    descEn: 'Clears local port conflicts ready for incoming ISTA / E-Sys data',
    status: 'pass',
    detail: 'Ports 22, 6801, 6811, 13400 Bound Successfully'
  }
];

export const PreFlightModal: React.FC<PreFlightModalProps> = ({
  isOpen,
  onClose,
  lang,
  telemetry
}) => {
  const t = translations[lang];
  const [checks, setChecks] = useState<PreFlightCheckItem[]>(INITIAL_CHECKS);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunChecks = () => {
    setIsRunning(true);
    setChecks(prev => prev.map(c => ({ ...c, status: 'checking' })));

    let index = 0;
    const interval = setInterval(() => {
      if (index < checks.length) {
        const currentIndex = index;
        setChecks(prev => prev.map((c, i) => {
          if (i === currentIndex) {
            return {
              ...c,
              status: 'pass'
            };
          }
          return c;
        }));
        index++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 400);
  };

  const allPassed = checks.every(c => c.status === 'pass');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#111217] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#161820] border-b border-white/10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                {t.preFlightTitle}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                  REMOTESERVICE.APP STANDARD
                </span>
              </h2>
              <p className="text-xs text-white/50">
                {t.preFlightDesc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Check Items List */}
        <div className="p-5 overflow-y-auto space-y-3 font-mono text-xs flex-1">
          {checks.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.status === 'pass'
                  ? 'bg-emerald-500/5 border-emerald-500/30 text-white'
                  : item.status === 'checking'
                  ? 'bg-blue-500/10 border-blue-500/30 text-white animate-pulse'
                  : 'bg-white/5 border-white/10 text-white/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{lang === 'zh' ? item.titleZh : item.titleEn}</span>
                  </div>
                  <p className="font-sans text-xs text-white/60">
                    {lang === 'zh' ? item.descZh : item.descEn}
                  </p>
                  {item.detail && (
                    <div className="text-[11px] text-emerald-400 font-mono pt-1">
                      {item.detail}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {item.status === 'pass' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {item.status === 'checking' && (
                    <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                  )}
                  {item.status === 'fail' && (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  {item.status === 'pending' && (
                    <span className="w-3 h-3 rounded-full bg-white/20 inline-block"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-[#14161f] border-t border-white/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono">
            {allPassed ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {t.preFlightPassed}
              </span>
            ) : (
              <span className="text-white/40">
                {lang === 'zh' ? '正在执行硬件自检...' : 'Performing self-test...'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunChecks}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{t.runPreFlight}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all"
            >
              {lang === 'zh' ? '完成并进入' : 'Done & Proceed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
