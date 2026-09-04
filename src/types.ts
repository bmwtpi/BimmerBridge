export interface Session {
  id: string;
  code: string;
  carConnected: boolean;
  techConnected: boolean;
  carIp?: string;
  carVin?: string;
  carModel?: string;
  iStepCurrent?: string;
  createdAt: number;
  owner?: string;
  telemetry?: TelemetryData;
  rustdeskId?: string;
  rustdeskPassword?: string;
}

export interface TelemetryData {
  voltage: number;
  voltageStatus: 'safe' | 'warning' | 'danger';
  ignition: boolean; // KL15
  customerLaptopBattery: {
    level: number;
    isCharging: boolean;
  };
  customerNetwork: {
    type: 'wifi' | 'ethernet';
    signalDbm: number;
    speedMbps: number;
    ssid?: string;
  };
  latencyMs: number;
  packetsForwarded?: number;
  bytesRelayed?: number;
  timestamp: number;
}

export interface NetworkAdapter {
  id?: string;
  name: string;
  ip: string;
  family?: string;
  internal?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'admin' | 'car' | 'tech' | string;
  text?: string;
  file?: {
    name: string;
    url: string;
    size?: number;
  };
  timestamp: number;
  recalled?: boolean;
}

export interface DebugLog {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface EdiabasEcu {
  id: string;
  name: string;
  description: string;
  address: string; // e.g. 0x12
  sgbd: string; // e.g. D_MOTOR.PRG
  diagnosticIndex: string;
  softwareNum: string;
  codingIndex: string;
  status: 'ok' | 'fault' | 'warning';
  dtcCount: number;
}

export interface DtcCode {
  id: string;
  code: string; // e.g. 130002
  hexCode: string;
  ecu: string;
  descriptionZh: string;
  descriptionEn: string;
  frequency: number;
  status: 'ACTIVE' | 'STORED' | 'PENDING';
  severity: 'high' | 'medium' | 'low';
}

export interface PrgJob {
  name: string;
  description: string;
  ecu: string;
  lastExecuted?: number;
  lastResult?: string;
}

export interface RustDeskConfig {
  idServer: string;
  relayServer: string;
  apiServer: string;
  key: string;
  quality: 'balanced' | 'quality' | 'speed';
  viewOnly: boolean;
  remoteResolution: '1080p' | '720p' | 'fit';
}

export interface PreFlightCheckItem {
  id: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  status: 'pending' | 'checking' | 'pass' | 'fail' | 'warning';
  detail?: string;
}

export type TabType = 
  | 'dashboard' 
  | 'downloads' 
  | 'tech' 
  | 'remote-desktop' 
  | 'ediabas' 
  | 'settings' 
  | 'branding'
  | 'connection-test'
  | 'account'
  | 'api'
  | 'parts-requests'
  | 'help'
  | 'support'
  | 'about';
export type ConnectionMode = 'relay' | 'p2p';
export type LangType = 'zh' | 'en';
export type AuthMode = 'login' | 'register' | 'admin';
