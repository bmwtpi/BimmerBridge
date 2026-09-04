import React, { useState } from 'react';
import { 
  Wrench, 
  Cpu, 
  Trash2, 
  Play, 
  Terminal, 
  FileCode, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  Gauge, 
  ShieldCheck, 
  RefreshCw,
  Zap,
  Sliders,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { EdiabasEcu, DtcCode, PrgJob, LangType, Session } from '../types';
import { translations } from '../lib/translations';

interface EdiabasViewProps {
  lang: LangType;
  activeSession?: Session;
  onOpenLogs: () => void;
}

const INITIAL_ECUS: EdiabasEcu[] = [
  {
    id: 'dme',
    name: 'DME / DDE',
    description: 'Digital Motor Electronics (Engine ECU)',
    address: '0x12',
    sgbd: 'D_MOTOR.PRG',
    diagnosticIndex: '0x0024',
    softwareNum: '0089.041.002',
    codingIndex: '0x0A',
    status: 'ok',
    dtcCount: 0
  },
  {
    id: 'egs',
    name: 'EGS',
    description: 'Electronic Transmission Control (ZF 8HP)',
    address: '0x18',
    sgbd: 'D_EGS.PRG',
    diagnosticIndex: '0x001B',
    softwareNum: '0075.020.001',
    codingIndex: '0x06',
    status: 'ok',
    dtcCount: 0
  },
  {
    id: 'dsc',
    name: 'DSC',
    description: 'Dynamic Stability Control & ABS',
    address: '0x29',
    sgbd: 'D_DSC.PRG',
    diagnosticIndex: '0x0032',
    softwareNum: '0062.011.003',
    codingIndex: '0x08',
    status: 'fault',
    dtcCount: 1
  },
  {
    id: 'bdc',
    name: 'BDC_BODY',
    description: 'Body Domain Controller (ZGW Gateway)',
    address: '0x40',
    sgbd: 'D_BDC.PRG',
    diagnosticIndex: '0x0041',
    softwareNum: '0092.050.004',
    codingIndex: '0x12',
    status: 'ok',
    dtcCount: 0
  },
  {
    id: 'hu',
    name: 'HU_MGU',
    description: 'Headunit High / iDrive 7.0 Infotainment',
    address: '0x63',
    sgbd: 'D_HUK.PRG',
    diagnosticIndex: '0x0055',
    softwareNum: '0104.082.010',
    codingIndex: '0x1F',
    status: 'fault',
    dtcCount: 2
  },
  {
    id: 'kombi',
    name: 'KOMBI',
    description: 'Digital Live Cockpit Instrument Cluster',
    address: '0x60',
    sgbd: 'D_KOMBI.PRG',
    diagnosticIndex: '0x002D',
    softwareNum: '0081.033.002',
    codingIndex: '0x09',
    status: 'ok',
    dtcCount: 0
  },
  {
    id: 'eps',
    name: 'EPS',
    description: 'Electronic Power Steering',
    address: '0x30',
    sgbd: 'D_EPS.PRG',
    diagnosticIndex: '0x0019',
    softwareNum: '0054.015.001',
    codingIndex: '0x05',
    status: 'ok',
    dtcCount: 0
  },
  {
    id: 'ihka',
    name: 'IHKA',
    description: 'Integrated Automatic Heating / Air Conditioning',
    address: '0x78',
    sgbd: 'D_KLIMA.PRG',
    diagnosticIndex: '0x0022',
    softwareNum: '0048.012.001',
    codingIndex: '0x04',
    status: 'ok',
    dtcCount: 0
  }
];

const INITIAL_DTCS: DtcCode[] = [
  {
    id: 'dtc-1',
    code: '130002',
    hexCode: '0x130002',
    ecu: 'DME / DDE',
    descriptionZh: 'VANOS 排气凸轮轴：未达到目标位置，但未卡死',
    descriptionEn: 'VANOS exhaust: camshaft position not reached',
    frequency: 1,
    status: 'STORED',
    severity: 'medium'
  },
  {
    id: 'dtc-2',
    code: 'CD0487',
    hexCode: '0xCD0487',
    ecu: 'DSC',
    descriptionZh: '中央网关接口通信中断（休眠唤醒阶段超时）',
    descriptionEn: 'ZGW interface: communication interrupted during wake-up',
    frequency: 2,
    status: 'STORED',
    severity: 'low'
  },
  {
    id: 'dtc-3',
    code: '801201',
    hexCode: '0x801201',
    ecu: 'HU_MGU',
    descriptionZh: '空调冷媒压力传感器：由于压力偏低临时限制',
    descriptionEn: 'A/C refrigerant pressure: temporary shut-off low pressure',
    frequency: 3,
    status: 'ACTIVE',
    severity: 'low'
  }
];

export const EdiabasView: React.FC<EdiabasViewProps> = ({
  lang,
  activeSession,
  onOpenLogs
}) => {
  const t = translations[lang];

  // State
  const [ecus, setEcus] = useState<EdiabasEcu[]>(INITIAL_ECUS);
  const [dtcs, setDtcs] = useState<DtcCode[]>(INITIAL_DTCS);
  const [isScanning, setIsScanning] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);
  const [selectedEcu, setSelectedEcu] = useState<EdiabasEcu>(INITIAL_ECUS[0]);

  // Job Runner State
  const [selectedJob, setSelectedJob] = useState<string>('IDENT');
  const [jobRunning, setJobRunning] = useState(false);
  const [jobOutput, setJobOutput] = useState<string>(
`API JOB: IDENT
ECU: DME / DDE (SGBD: D_MOTOR.PRG, 0x12)
JOB_STATUS = OKAY
VARIANTE = B48B20O0
DIAGNOSEINDEX = 0x0024
ECU_HERSTELLER_DATUM = 2021.06.18
CODING_INDEX = 0x0A
FLASH_PROGRAMMIER_ZAEHLER = 2`
  );

  // EDIABAS.INI generator
  const [copiedIni, setCopiedIni] = useState(false);
  const ediabasIniContent = `; =========================================================
; BimmerBridge EdiabasLib Config - Generated for BMW Tools
; Compatible with: ISTA-D, ISTA-P, E-Sys, INPA, Tool32
; =========================================================
[CONFIGURATION]
Interface = ENET
RemoteHost = 127.0.0.1
Port = 6801
DoIPPort = 13400
TimeoutConnect = 2000
TimeoutReceive = 2000
RetryConnect = 3
EnetTimeout = 2000
TracePath = C:\\EDIABAS\\TRACE
Simulation = 0
`;

  const handleCopyIni = () => {
    navigator.clipboard.writeText(ediabasIniContent);
    setCopiedIni(true);
    setTimeout(() => setCopiedIni(false), 2000);
  };

  // SVT Quick Scan
  const handleScanEcus = () => {
    setIsScanning(true);
    setTimeout(() => {
      setEcus(prev => prev.map(ecu => ({
        ...ecu,
        status: ecu.id === 'dsc' || ecu.id === 'hu' ? 'fault' : 'ok',
        dtcCount: ecu.id === 'dsc' ? 1 : ecu.id === 'hu' ? 2 : 0
      })));
      setIsScanning(false);
    }, 1200);
  };

  // Clear all DTCs (FS_LOESCHEN)
  const handleClearAllDtcs = () => {
    setIsClearing(true);
    setTimeout(() => {
      setDtcs([]);
      setEcus(prev => prev.map(ecu => ({
        ...ecu,
        status: 'ok',
        dtcCount: 0
      })));
      setIsClearing(false);
      setClearedSuccess(true);
      setTimeout(() => setClearedSuccess(false), 3000);
    }, 1500);
  };

  // Run selected PRG job
  const handleExecuteJob = () => {
    setJobRunning(true);
    setTimeout(() => {
      let output = `API JOB: ${selectedJob}\nECU: ${selectedEcu.name} (SGBD: ${selectedEcu.sgbd}, ${selectedEcu.address})\n`;
      if (selectedJob === 'IDENT') {
        output += `JOB_STATUS = OKAY\nVARIANTE = ${selectedEcu.id.toUpperCase()}_V3\nDIAGNOSEINDEX = ${selectedEcu.diagnosticIndex}\nCODING_INDEX = ${selectedEcu.codingIndex}\nSOFTWARE_NUM = ${selectedEcu.softwareNum}`;
      } else if (selectedJob === 'STATUS_LESEN') {
        output += `JOB_STATUS = OKAY\nSTAT_MOTORDREHZAHL_WERT = 0.00 U/min\nSTAT_KUEHLMITTELTEMPERATUR_WERT = 88.5 °C\nSTAT_UBATT_WERT = 13.84 V\nSTAT_KL15_WERT = 1 (IGNITION ON)\nSTAT_KRAFTSTOFFDRUCK_WERT = 5.8 bar`;
      } else if (selectedJob === 'FS_LESEN') {
        output += `JOB_STATUS = OKAY\nFS_ANZAHL = ${selectedEcu.dtcCount}\n` + 
          (selectedEcu.dtcCount > 0 ? `FEHLER_1 = 0x130002 (VANOS exhaust position error)\nFEHLER_STATUS = STORED\nFEHLER_HAEUFIGKEIT = 1` : `NO_FAULTS_STORED`);
      } else if (selectedJob === 'FS_LOESCHEN') {
        output += `JOB_STATUS = OKAY\nFS_LOESCHEN_STATUS = SUCCESS\nFEHLER_SPEICHER_GELOESCHT = 1`;
      } else if (selectedJob === 'I_STUFE_LESEN') {
        output += `JOB_STATUS = OKAY\nI_STUFE_WERK = F020-17-03-502\nI_STUFE_AKTUELL = F020-21-07-500\nI_STUFE_HOECHST = F020-23-11-540`;
      } else if (selectedJob === 'UBATT_LESEN') {
        output += `JOB_STATUS = OKAY\nSTAT_UBATT = 13.84 V\nSTAT_KL15 = 1\nSTAT_SPANNUNG_STABIL = 1 (PSU SAFE)`;
      } else {
        output += `JOB_STATUS = OKAY\nRESULT_CODE = 0x00\nBYTES_RETURNED = 16`;
      }
      setJobOutput(output);
      setJobRunning(false);
    }, 600);
  };

  const totalDtcCount = dtcs.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: EdiabasLib Engine */}
      <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  {t.ediabasTitle}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                    OPEN SOURCE .NET EDIABAS
                  </span>
                </h2>
              </div>
              <p className="text-xs text-white/50 mt-1 max-w-2xl leading-relaxed">
                {t.ediabasDesc}
              </p>
            </div>
          </div>

          {/* Quick Vehicle Telemetry Strip */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="p-2.5 bg-black/60 rounded-xl border border-white/10 text-center min-w-[100px]">
              <span className="text-[9px] text-white/40 uppercase block">{t.chassisSeries}</span>
              <span className="font-bold text-white">BMW G20 (330i)</span>
            </div>
            <div className="p-2.5 bg-black/60 rounded-xl border border-white/10 text-center min-w-[120px]">
              <span className="text-[9px] text-white/40 uppercase block">{t.iStepCurrent}</span>
              <span className="font-bold text-blue-400">F020-21-07-500</span>
            </div>
            <div className="p-2.5 bg-black/60 rounded-xl border border-white/10 text-center min-w-[90px]">
              <span className="text-[9px] text-white/40 uppercase block">{t.batteryVoltage}</span>
              <span className="font-black text-emerald-400">13.8V ⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: ECU Tree & DTC List */}
        <div className="lg:col-span-7 space-y-6">
          {/* ECU SVT Topology Card */}
          <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {t.ecuQuickScan}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleScanEcus}
                  disabled={isScanning}
                  className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? t.scanningEcus : t.ecuQuickScan}</span>
                </button>
              </div>
            </div>

            {/* ECU Modules Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ecus.map((ecu) => {
                const isSelected = selectedEcu.id === ecu.id;
                const hasFault = ecu.status === 'fault';

                return (
                  <div
                    key={ecu.id}
                    onClick={() => setSelectedEcu(ecu)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-500/20 border-emerald-500 shadow-md shadow-emerald-500/10 scale-102' 
                        : hasFault 
                        ? 'bg-rose-500/10 border-rose-500/40 hover:border-rose-500' 
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white truncate">{ecu.name}</span>
                      <span className={`w-2 h-2 rounded-full ${hasFault ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-white/50 flex justify-between">
                      <span>{ecu.address}</span>
                      <span className={hasFault ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {ecu.dtcCount > 0 ? `${ecu.dtcCount} DTC` : 'OK'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected ECU Meta Details */}
            <div className="p-3.5 bg-black/60 rounded-xl border border-white/10 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-white">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5" />
                  {selectedEcu.name} — {selectedEcu.description}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70">
                  {selectedEcu.address}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-white/60 pt-1 border-t border-white/5">
                <div>SGBD: <span className="text-white font-bold">{selectedEcu.sgbd}</span></div>
                <div>DiagIndex: <span className="text-white font-bold">{selectedEcu.diagnosticIndex}</span></div>
                <div>CodingIndex: <span className="text-white font-bold">{selectedEcu.codingIndex}</span></div>
              </div>
            </div>
          </div>

          {/* Fault Code Memory (DTC) Card */}
          <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {t.faultCodeMemory}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                  {totalDtcCount} Total
                </span>
              </div>

              <button
                onClick={handleClearAllDtcs}
                disabled={isClearing || totalDtcCount === 0}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearing ? t.clearingDtc : t.clearAllDtc}</span>
              </button>
            </div>

            {/* Clear Success Alert */}
            {clearedSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.dtcClearedSuccess}</span>
              </div>
            )}

            {/* DTC List */}
            {dtcs.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-white/40 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-emerald-400 font-bold">{t.dtcClearedSuccess}</div>
                <div>All ECU error memory clean (FS_LOESCHEN OK)</div>
              </div>
            ) : (
              <div className="space-y-2">
                {dtcs.map(dtc => (
                  <div 
                    key={dtc.id}
                    className="p-3 bg-black/40 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold font-mono">
                          {dtc.code}
                        </span>
                        <span className="text-white/60 font-bold">[{dtc.ecu}]</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                          dtc.status === 'ACTIVE' ? 'bg-rose-500/30 text-rose-300' : 'bg-white/10 text-white/60'
                        }`}>
                          {dtc.status}
                        </span>
                      </div>
                      <p className="text-white/80 font-sans text-xs">
                        {lang === 'zh' ? dtc.descriptionZh : dtc.descriptionEn}
                      </p>
                    </div>

                    <div className="text-[10px] text-white/40 shrink-0 text-right">
                      <div>Freq: {dtc.frequency}</div>
                      <div>Hex: {dtc.hexCode}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: SGBD PRG Job Runner & EDIABAS.INI Generator */}
        <div className="lg:col-span-5 space-y-6">
          {/* SGBD PRG Job Console */}
          <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {t.sgbdJobRunner}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-white/40">{selectedEcu.sgbd}</span>
            </div>

            {/* Job Selection & Run */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-white/40 font-bold block">
                {t.selectJob}
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-blue-500"
                >
                  <option value="IDENT">IDENT (ECU Identification)</option>
                  <option value="STATUS_LESEN">STATUS_LESEN (Live Sensors)</option>
                  <option value="FS_LESEN">FS_LESEN (Read Error Memory)</option>
                  <option value="FS_LOESCHEN">FS_LOESCHEN (Clear Error Memory)</option>
                  <option value="UBATT_LESEN">UBATT_LESEN (Terminal 30 Voltage)</option>
                  <option value="I_STUFE_LESEN">I_STUFE_LESEN (Read I-Level)</option>
                  <option value="FA_READ">FA_READ (Vehicle Order Ausstattung)</option>
                </select>

                <button
                  onClick={handleExecuteJob}
                  disabled={jobRunning}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${jobRunning ? 'animate-spin' : ''}`} />
                  <span>RUN</span>
                </button>
              </div>
            </div>

            {/* Job Output Terminal */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-white/40 font-bold block">
                {t.jobOutput}
              </span>
              <pre className="p-3 bg-black/80 rounded-xl border border-white/10 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-56 leading-relaxed">
                {jobOutput}
              </pre>
            </div>
          </div>

          {/* EDIABAS.INI Bridge Generator */}
          <div className="bg-[#111217] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {t.ediabasIniGenerator}
                </h3>
              </div>
              <button
                onClick={handleCopyIni}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
              >
                {copiedIni ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{t.copyIni}</span>
              </button>
            </div>

            <p className="text-[11px] text-white/50 leading-relaxed">
              {lang === 'zh' 
                ? '复制此配置文件覆盖至 C:\\EDIABAS\\BIN\\EDIABAS.INI，即可让本地 ISTA / INPA / E-Sys 自动直连 BimmerBridge 远端隧道。' 
                : 'Replace C:\\EDIABAS\\BIN\\EDIABAS.INI with this configuration to enable zero-config connection for ISTA / INPA / E-Sys.'}
            </p>

            <pre className="p-3 bg-black/80 rounded-xl border border-white/10 font-mono text-[10px] text-white/70 overflow-x-auto max-h-40 leading-relaxed select-all">
              {ediabasIniContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
