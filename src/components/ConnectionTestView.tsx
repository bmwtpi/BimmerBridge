import React, { useState, useEffect } from 'react';
import { 
  Cable, 
  Link2, 
  Wifi, 
  RefreshCw, 
  Info, 
  ChevronUp, 
  ChevronDown, 
  SlidersHorizontal, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Activity,
  Zap
} from 'lucide-react';
import { LangType } from '../types';

interface ConnectionTestViewProps {
  lang: LangType;
  accentColor?: string;
  onNavigateToSession?: () => void;
}

export const ConnectionTestView: React.FC<ConnectionTestViewProps> = ({
  lang,
  accentColor = '#A855F7',
  onNavigateToSession
}) => {
  // 选中的连接方式: 'kdcan' | 'enet' | 'icom'
  const [connectionType, setConnectionType] = useState<'kdcan' | 'enet' | 'icom'>('kdcan');

  // 手动选择折叠开关 (截图默认为展开)
  const [isManualSelectorOpen, setIsManualSelectorOpen] = useState<boolean>(true);

  // 模拟/真实硬件状态
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasSimulatedPlugIn, setHasSimulatedPlugIn] = useState<boolean>(false);
  const [comPort, setComPort] = useState<string | null>(null);

  // 以太网网卡数据
  const [enetAdapters, setEnetAdapters] = useState<{ name: string; ip: string }[]>([]);
  const [selectedEnet, setSelectedEnet] = useState<string>('');

  // ICOM 输入
  const [icomIp, setIcomIp] = useState<string>('169.254.92.38');

  // 测试中与测试结果状态
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testStage, setTestStage] = useState<string>('');
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'failed';
    vin?: string;
    model?: string;
    voltage?: number;
    ignition?: boolean;
    protocol?: string;
    latencyMs?: number;
    errorMsg?: string;
  }>({
    status: 'idle'
  });

  // 获取以太网网卡
  useEffect(() => {
    fetch('/api/network-interfaces')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEnetAdapters(data);
          if (data.length > 0) setSelectedEnet(data[0].ip || data[0].name);
        }
      })
      .catch(() => {});
  }, []);

  // 刷新扫描 COM 口或设备
  const handleScanPorts = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // 如果已模拟插入，则找到 COM3，否则提示未找到
      if (hasSimulatedPlugIn) {
        setComPort('COM3 (FTDI USB Serial Port - Latency 1ms)');
      } else {
        setComPort(null);
      }
    }, 900);
  };

  // 触发连接测试
  const handleRunTest = () => {
    setIsTesting(true);
    setTestResult({ status: 'idle' });
    setTestStage(lang === 'zh' ? '正在打开通信接口...' : 'Opening communication interface...');

    setTimeout(() => {
      setTestStage(lang === 'zh' ? '正在侦测车辆点火开关 (KL15)...' : 'Detecting vehicle ignition (KL15)...');
    }, 700);

    setTimeout(() => {
      setTestStage(lang === 'zh' ? '正在与车载网关 ZGW/BDC 进行握手...' : 'Handshaking with vehicle gateway (ZGW/BDC)...');
    }, 1400);

    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        status: 'success',
        vin: 'WBA3A5C5' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        model: connectionType === 'kdcan' ? 'BMW E90 (325i N52)' : 'BMW G38 (530Li B48)',
        voltage: 12.6,
        ignition: true,
        protocol: connectionType === 'kdcan' ? 'D-CAN (500 kbit/s)' : (connectionType === 'enet' ? 'DoIP ISO-13400 (100 Mbit/s)' : 'ICOM Next Direct API'),
        latencyMs: connectionType === 'kdcan' ? 14 : 3
      });
    }, 2200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300 select-none">
      {/* 标题和副标题 (精准还原截图: 连接车辆 / 连接线缆，打开点火 - 然后测试连接。) */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'zh' ? '连接车辆' : 'Connect Vehicle'}
        </h1>
        <p className="text-sm text-white/50">
          {lang === 'zh' ? '连接线缆，打开点火 - 然后测试连接。' : 'Connect cable, turn on ignition - then test connection.'}
        </p>
      </div>

      {/* 主卡片 1: 发现连接与手动选择 */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
        {/* 顶部状态条 (左: 已发现的连接(紫色) / 右: 自动搜索(带弧形旋转)) */}
        <div className="flex items-center justify-between">
          <span 
            className="text-xs font-semibold tracking-wide"
            style={{ color: accentColor }}
          >
            {lang === 'zh' ? '已发现的连接' : 'Discovered Connections'}
          </span>

          <div className="flex items-center gap-2 text-xs text-white/50">
            {/* 紫色旋转小圆环 (对标截图中的自动搜索指示器) */}
            <div 
              className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${accentColor} transparent transparent transparent` }}
            />
            <span>{lang === 'zh' ? '自动搜索' : 'Auto Search'}</span>
          </div>
        </div>

        {/* 描述 (精准对标截图文本) */}
        <p className="text-xs text-white/50 leading-relaxed">
          {lang === 'zh'
            ? '尚未发现任何设备 - 请连接线缆/ICOM，或在下方手动测试。'
            : 'No devices found yet - please connect cable/ICOM, or test manually below.'}
        </p>

        {/* 水平微弱分割线 */}
        <div className="border-t border-white/[0.06] pt-1" />

        {/* 内嵌卡片: 手动选择连接方式 (对标截图带边框圆角卡片) */}
        <div className="bg-[#141720] border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
          {/* 头部与折叠切换 */}
          <div 
            onClick={() => setIsManualSelectorOpen(!isManualSelectorOpen)}
            className="flex items-start justify-between cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-white/80">
                <SlidersHorizontal className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {lang === 'zh' ? '手动选择连接方式' : 'Manually Select Connection Method'}
                </div>
                <p className="text-xs text-white/40 pt-0.5">
                  {lang === 'zh' ? '仅在自动搜索没有结果时需要。' : 'Only required when automatic search yields no results.'}
                </p>
              </div>
            </div>

            <button className="text-white/40 hover:text-white p-1">
              {isManualSelectorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* 展开内容 */}
          {isManualSelectorOpen && (
            <div className="space-y-5 pt-1">
              {/* 三个连接方式切换胶囊 (K+DCAN / ENET / ICOM) */}
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. K+DCAN (线缆) */}
                <button
                  onClick={() => {
                    setConnectionType('kdcan');
                    setTestResult({ status: 'idle' });
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                    connectionType === 'kdcan'
                      ? 'text-white shadow-purple-600/30'
                      : 'bg-[#1c202a] text-white/70 hover:text-white hover:bg-[#252a36]'
                  }`}
                  style={connectionType === 'kdcan' ? { backgroundColor: accentColor } : undefined}
                >
                  <Cable className="w-4 h-4" />
                  <span>K+DCAN {lang === 'zh' ? '(线缆)' : '(Cable)'}</span>
                </button>

                {/* 2. ENET (以太网) */}
                <button
                  onClick={() => {
                    setConnectionType('enet');
                    setTestResult({ status: 'idle' });
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                    connectionType === 'enet'
                      ? 'text-white shadow-purple-600/30'
                      : 'bg-[#1c202a] text-white/70 hover:text-white hover:bg-[#252a36]'
                  }`}
                  style={connectionType === 'enet' ? { backgroundColor: accentColor } : undefined}
                >
                  <Link2 className="w-4 h-4" />
                  <span>ENET {lang === 'zh' ? '(以太网)' : '(Ethernet)'}</span>
                </button>

                {/* 3. ICOM */}
                <button
                  onClick={() => {
                    setConnectionType('icom');
                    setTestResult({ status: 'idle' });
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                    connectionType === 'icom'
                      ? 'text-white shadow-purple-600/30'
                      : 'bg-[#1c202a] text-white/70 hover:text-white hover:bg-[#252a36]'
                  }`}
                  style={connectionType === 'icom' ? { backgroundColor: accentColor } : undefined}
                >
                  <Wifi className="w-4 h-4" />
                  <span>ICOM</span>
                </button>
              </div>

              {/* 方式 A: K+DCAN 配置区域 (精准还原截图状态) */}
              {connectionType === 'kdcan' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* 端口 (COM) 标题 */}
                  <div className="text-xs text-white/60 font-medium">
                    {lang === 'zh' ? '端口 (COM)' : 'Port (COM)'}
                  </div>

                  {/* 扫描结果与刷新按钮行 */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-white/50 flex items-center gap-2">
                      {comPort ? (
                        <span className="text-emerald-400 font-medium font-mono">{comPort}</span>
                      ) : (
                        <span>
                          {lang === 'zh'
                            ? '未找到 COM 端口 - 请插入线缆并重新扫描。'
                            : 'No COM port found - please insert cable and rescan.'}
                        </span>
                      )}
                    </div>

                    {/* 刷新小方块按钮 (对标截图右侧小方块) */}
                    <div className="flex items-center gap-2">
                      {/* 辅助模拟测试插入按钮 (方便随时体验连通效果) */}
                      <button
                        onClick={() => {
                          setHasSimulatedPlugIn(!hasSimulatedPlugIn);
                          if (!hasSimulatedPlugIn) {
                            setComPort('COM3 (FTDI USB Serial Port - Latency 1ms)');
                          } else {
                            setComPort(null);
                          }
                        }}
                        className="text-[10px] text-white/40 hover:text-white/80 underline cursor-pointer"
                      >
                        {hasSimulatedPlugIn 
                          ? (lang === 'zh' ? '模拟断开线缆' : 'Unplug cable') 
                          : (lang === 'zh' ? '模拟插上线缆' : 'Plug in cable')}
                      </button>

                      <button
                        onClick={handleScanPorts}
                        disabled={isScanning}
                        className="w-8 h-8 rounded-lg bg-[#1a1e28] border border-white/10 hover:border-white/20 text-white/60 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"
                        title={lang === 'zh' ? '重新扫描端口' : 'Rescan Ports'}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-purple-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* 提示行 (圆圈叹号图标) */}
                  <div className="flex items-start gap-2 text-xs text-white/40 leading-relaxed">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-white/30" />
                    <span>
                      {lang === 'zh'
                        ? '您的线缆有开关或按钮（K-Line / D-CAN）吗？它必须与车辆匹配 - 较老的 E 系：K-Line。'
                        : 'Does your cable have a switch or button (K-Line / D-CAN)? It must match the car - older E-Series: K-Line.'}
                    </span>
                  </div>

                  {/* 点火 (KL15) 信号状态行 */}
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span 
                      className={`w-2 h-2 rounded-full ${
                        comPort ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'
                      }`} 
                    />
                    <span>
                      {lang === 'zh' ? '点火 (KL15) : ' : 'Ignition (KL15) : '}
                      <span className="font-mono text-white/70">
                        {comPort ? (lang === 'zh' ? '打开 (12.6V)' : 'ON (12.6V)') : '—'}
                      </span>
                    </span>
                  </div>

                  {/* 测试连接 按钮 */}
                  <div>
                    <button
                      onClick={handleRunTest}
                      disabled={isTesting || (!comPort && !hasSimulatedPlugIn)}
                      className={`px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 ${
                        comPort || hasSimulatedPlugIn
                          ? 'text-white hover:opacity-90 active:scale-95'
                          : 'bg-[#1c202a] text-white/30 cursor-not-allowed border border-white/5'
                      }`}
                      style={
                        (comPort || hasSimulatedPlugIn)
                          ? { backgroundColor: accentColor }
                          : undefined
                      }
                    >
                      {isTesting && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>
                        {isTesting
                          ? (lang === 'zh' ? '正在测试...' : 'Testing...')
                          : (lang === 'zh' ? '测试连接' : 'Test Connection')}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* 方式 B: ENET (以太网) 配置区域 (100%精准对标用户截图) */}
              {connectionType === 'enet' && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  {/* 标题行与右侧刷新按钮 */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="text-xs text-white/60 font-normal">
                        {lang === 'zh' ? '活动的网络适配器' : 'Active network adapters'}
                      </div>

                      {/* 适配器垂直列表 (对标截图: IP · 适配器全名) */}
                      <div className="space-y-1 text-xs text-white/90 font-mono tracking-tight">
                        {enetAdapters.length > 0 ? (
                          enetAdapters.map((a, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span>{a.ip || '192.168.5.23'}</span>
                              <span className="text-white/40">·</span>
                              <span className="font-sans text-white/80">{a.name}</span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span>192.168.5.23</span>
                              <span className="text-white/40">·</span>
                              <span className="font-sans text-white/80">Realtek Gaming USB 2.5GbE Family Controller</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>192.168.5.31</span>
                              <span className="text-white/40">·</span>
                              <span className="font-sans text-white/80">Intel(R) Wireless-AC 9560 160MHz</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 右侧独立小方块刷新按钮 (对标截图) */}
                    <button
                      onClick={() => {
                        setIsScanning(true);
                        setTimeout(() => setIsScanning(false), 600);
                      }}
                      className="w-8 h-8 rounded-lg bg-[#1a1e28] border border-white/10 hover:border-white/20 text-white/60 hover:text-white flex items-center justify-center transition-all shrink-0"
                      title={lang === 'zh' ? '刷新网卡适配器' : 'Refresh network adapters'}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-purple-400' : ''}`} />
                    </button>
                  </div>

                  {/* 紫色提示文案 (对标截图) */}
                  <div 
                    className="text-xs font-medium pt-1"
                    style={{ color: accentColor }}
                  >
                    {lang === 'zh'
                      ? '测试会自动在所有活动的适配器上搜索车辆 - 无需选择任何内容。'
                      : 'The test will automatically search for vehicles on all active adapters - no selection needed.'}
                  </div>

                  {/* 测试连接按钮 (紫色高亮圆角按钮) */}
                  <div className="pt-1">
                    <button
                      onClick={handleRunTest}
                      disabled={isTesting}
                      className="px-10 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: accentColor }}
                    >
                      {isTesting && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>
                        {isTesting
                          ? (lang === 'zh' ? '正在测试...' : 'Testing...')
                          : (lang === 'zh' ? '测试连接' : 'Test Connection')}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* 方式 C: ICOM 配置区域 (100%精准对标用户截图) */}
              {connectionType === 'icom' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* 说明文案 (精准对标截图) */}
                  <p className="text-xs text-white/60 leading-relaxed max-w-4xl">
                    {lang === 'zh'
                      ? '通过局域网将 ICOM 连接到电脑（或维修厂网络）并等待其启动。测试会自动查找 ICOM（包括 169.254.x 直连），短暂预留它并显示识别到的车辆。'
                      : 'Connect the ICOM to your computer (or workshop network) via LAN and wait for it to boot. The test will automatically discover ICOMs (including 169.254.x direct connections), temporarily reserve it and display the identified vehicle.'}
                  </p>

                  {/* 测试连接按钮 (紫色高亮圆角按钮) */}
                  <div className="pt-1">
                    <button
                      onClick={handleRunTest}
                      disabled={isTesting}
                      className="px-10 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: accentColor }}
                    >
                      {isTesting && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>
                        {isTesting
                          ? (lang === 'zh' ? '正在测试...' : 'Testing...')
                          : (lang === 'zh' ? '测试连接' : 'Test Connection')}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 底部卡片 2: 测试结果卡片 (精准对标截图: 灰色汽车图标 / 尚未进行测试 / 请在上方开始连接测试以检查您的车辆。) */}
      <div className="bg-[#12141a] border border-white/[0.08] rounded-2xl p-6 shadow-xl transition-all">
        {testResult.status === 'idle' && !isTesting && (
          <div className="flex items-center gap-4">
            {/* 灰色汽车图标 (对标截图) */}
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 shrink-0">
              <Car className="w-7 h-7 stroke-[1.5]" />
            </div>

            <div className="space-y-0.5">
              <div className="text-sm font-bold text-white tracking-wide">
                {lang === 'zh' ? '尚未进行测试' : 'Not Tested Yet'}
              </div>
              <p className="text-xs text-white/40">
                {lang === 'zh'
                  ? '请在上方开始连接测试以检查您的车辆。'
                  : 'Please start connection test above to check your vehicle.'}
              </p>
            </div>
          </div>
        )}

        {/* 正在测试中状态 */}
        {isTesting && (
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>{lang === 'zh' ? '正在执行诊断链路测试...' : 'Running diagnostic link test...'}</span>
              </div>
              <p className="text-xs text-purple-300 font-mono">
                {testStage}
              </p>
            </div>
          </div>
        )}

        {/* 测试成功后的详细车辆信息报告 */}
        {testResult.status === 'success' && !isTesting && (
          <div className="space-y-4 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{lang === 'zh' ? '连接测试通过 - 车辆通信正常' : 'Connection Test Passed - Car Responding'}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                      {testResult.latencyMs} ms
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    {lang === 'zh' ? '车辆网关通讯畅通，点火已激活，可直接开启远程编码。' : 'Gateway reachable, ignition active, ready for remote coding.'}
                  </p>
                </div>
              </div>

              {onNavigateToSession && (
                <button
                  onClick={onNavigateToSession}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  {lang === 'zh' ? '前往远程会话' : 'Go to Remote Session'}
                </button>
              )}
            </div>

            {/* 参数卡片矩阵 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#181b22] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-white/40 block">VIN 车架号</span>
                <span className="text-xs font-mono font-bold text-white">{testResult.vin}</span>
              </div>
              <div className="bg-[#181b22] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-white/40 block">车型底盘</span>
                <span className="text-xs font-bold text-white">{testResult.model}</span>
              </div>
              <div className="bg-[#181b22] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-white/40 block">蓄电池电压 (KL30)</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  {testResult.voltage} V 稳定
                </span>
              </div>
              <div className="bg-[#181b22] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-white/40 block">诊断协议</span>
                <span className="text-xs font-bold text-purple-300">{testResult.protocol}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
