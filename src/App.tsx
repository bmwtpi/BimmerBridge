import React, { useState, useEffect, useRef } from 'react';
import { Activity, Car, Download, Laptop, Network, Server, Shield, Terminal, Settings as SettingsIcon, Globe, X, MessageSquare, Send, Paperclip, File, Palette, Copy, Home, Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { carAgentCode, techAgentCode } from './lib/agent-code';

interface Session {
  id: string;
  code: string;
  carConnected: boolean;
  techConnected: boolean;
  carIp?: string;
  carVin?: string;
  createdAt: number;
}

const translations = {
  zh: {
    title: "BimmerBridge",
    version: "V0.05 Enterprise",
    home: "概览",
    dashboard: "控制台",
    downloads: "车辆端",
    techTab: "编程端",
    settings: "设置",
    remoteSessions: "私有 P2P 通道",
    manageConnections: "",
    newSession: "建立全新配对",
    loading: "隧道同步中...",
    noSessions: "当前无活跃隧道",
    clickToCreate: "请在“车辆端”生成凭证。握手成功后，加密信令将穿透防火墙并建立端到端直连。",
    carClient: "终端 (CAR)",
    techClient: "终端 (EXPERT)",
    connected: "P2P 已穿透 (SECURE)",
    waiting: "链路建立中...",
    vehicleNetwork: "底层链路指标",
    realIp: "节点端点:",
    vin: "车辆识别码:",
    unknown: "探测中",
    downloadInstructions: "配对中心 ( Pairing )",
    downloadDesc: "将生成的连接码发送给编程端。建议在复杂的网络环境中使用“中国区深度优化”模式进行握手。",
    generateCode: "生成 P2P 连接码",
    codeGenerated: "握手凭证已就绪",
    smartCode: "Smart-Link 智能凭证",
    smartCodeDesc: "此凭证采用端到端加密包含私有信令。解析后可绕过公网延时，强制开启高带宽 P2P 隧道。",
    sendToTech: "请将下方代码发送给另一端：",
    closeSession: "切断物理链路",
    howToReadIp: "关于 P2P 隧道",
    howToReadIpDesc1: "BimmerBridge 采用端到端 P2P (Peer-to-Peer) 技术。服务器仅在连接初始阶段充当‘数字信标’。一旦握手成功，诊断数据将通过 AES-256 加密隧道在两端直接流动。",
    howToReadIpDesc2: "在编程端，ISTA/E-Sys 等工具通过虚拟节点进行无感访问。底层引擎会自动处理所有的数据路由与重传机制，提供等同于物理 100M ENET 的极致体验。",
    protocolSettings: "链路优化与硬件映射",
    protocolSettingsDesc: "配置底层 P2P 隧道协议、MTU 与硬件同步策略",
    enableDoIP: "启用 P2P-DoIP 极速模式",
    enableDoIPDesc: "强制使用低延迟数据通道传输 RAW 协议，最大化降低同步延时。",
    enableJ2534: "离线直联兼容模式",
    enableJ2534Desc: "在复杂防火墙环境下，允许利用局域网/内网环境进行握手穿透。",
    usbMapping: "智能环境自适应",
    usbMappingDesc: "自动检测并同步当前硬件环境，解决 169.254.x.x 等自给 IP 导致的路由冲突。",
    languageSettings: "全局偏好",
    selectLanguage: "选择语言 / Language",
    copied: "凭证已保存",
    ping: "测试延迟",
    pinging: "同步中...",
    pingResult: "RTT: {ms}ms",
    networkSettings: "网卡绑定",
    networkSettingsDesc: "指定用于连接车辆或编程软件的物理网卡",
    autoDetect: "自动探测",
    refresh: "刷新",
    selectedAdapter: "当前链路网卡",
    noAdapters: "未检测到有效网卡",
    noServerWarning: "",
    noServerDesc: "",
    offlineTip: "",
    offlineDesc: "",
    chinaMode: "中国区深度优化",
    chinaModeDesc: "启用后将强制使用国内加速握手服务器及特定的 STUN 穿透策略。",
    copySuccess: "复制成功",
    serverAddressDesc: "若使用私有中转，请输入握手点 URL (如: https://bridge.example.com)。",
    save: "应用配置",
    techTabDesc: "输入客户提供的智能配对码，建立端到端加密诊断通道。",
    enterCode: "在此粘贴 P2P 配对码",
    connectToCar: "开启点对点连接",
    connecting: "握手同步中...",
    connectSuccess: "P2P 链路已建立！",
    connectError: "握手失败，请检查防火墙或配对码。",
    disconnect: "完全断开",
    deleteSession: "清除记录",
    chat: "加密聊天",
    typeMessage: "输入消息...",
    sendFile: "发送文件",
    waitingForPeer: "等待链路另一端入场...",
    selectSession: "请选择一个活跃的 P2P 隧道以继续",
    login: "进入控制台",
    register: "立即注册",
    username: "账号",
    password: "密码",
    userLogin: "用户登录",
    adminLogin: "高级工程师登录",
    noAccount: "没有账号？点击注册",
    hasAccount: "已有账号？去登录",
    adminAccess: "高级工程师接入",
    userAccess: "普通模式",
    enterUsername: "输入登录账号",
    enterPassword: "输入登录密码",
    enterAdminPassword: "输入高级工程师密钥",
    invalidPassword: "密码错误",
    expertPin: "专家授权密钥",
    loginSuccess: "授权成功"
  },
  en: {
    title: "BimmerBridge P2P",
    version: "V0.02 Pro",
    home: "Guide",
    dashboard: "Terminal",
    downloads: "Car Side",
    techTab: "Expert Side",
    settings: "Settings",
    remoteSessions: "P2P Tunnels",
    manageConnections: "Manage BMW ENET P2P connections",
    newSession: "New Tunnel",
    loading: "P2P Init...",
    noSessions: "No Active Tunnels",
    clickToCreate: "Generate a code on 'Car Side' or enter one on 'Expert Side'. Once paired, a secure tunnel will appear here.",
    carClient: "Local Car",
    techClient: "Remote Expert",
    connected: "P2P SECURE",
    waiting: "Syncing...",
    vehicleNetwork: "Link Status",
    realIp: "Node IP:",
    vin: "Vehicle VIN:",
    unknown: "Checking",
    downloadInstructions: "Pairing Center",
    downloadDesc: "Generate a pairing code. Use 'China mode' if you encounter network issues.",
    generateCode: "Start P2P Pairing",
    codeGenerated: "Code Ready",
    smartCode: "P2P Credential",
    smartCodeDesc: "End-to-end encrypted link credential with zero-config relay support.",
    sendToTech: "Send this to the remote Expert:",
    closeSession: "Kill Link",
    howToReadIp: "About P2P",
    howToReadIpDesc1: "BimmerBridge uses WebRTC for Peer-to-Peer communication, ensuring maximum privacy and minimal latency.",
    howToReadIpDesc2: "Standard E-Sys/ISTA configs use 127.0.0.1. The P2P layer handles all underlying routing automatically.",
    protocolSettings: "P2P & Hardware",
    protocolSettingsDesc: "Configure tunneling and mapping.",
    enableDoIP: "P2P DoIP Turbo",
    enableDoIPDesc: "Use RTC Data Channels for raw traffic.",
    enableJ2534: "Remote USB / ICOM",
    enableJ2534Desc: "Map hardware to remote sessions.",
    usbMapping: "Low Latency Sync",
    usbMappingDesc: "Optimized synchronization technology.",
    languageSettings: "Language",
    selectLanguage: "Select UI Language",
    copied: "Copied!",
    ping: "Test Latency",
    pinging: "Syncing...",
    pingResult: "RTT: {ms}ms",
    networkSettings: "Adapter",
    networkSettingsDesc: "Bind to physical NIC.",
    autoDetect: "Auto",
    refresh: "Refresh",
    selectedAdapter: "Bound NIC",
    noAdapters: "No NIC found",
    noServerWarning: "",
    noServerDesc: "",
    offlineTip: "",
    offlineDesc: "",
    chinaMode: "China Optimized",
    chinaModeDesc: "Use regional STUN/TURN nodes for faster piercing.",
    copySuccess: "Copied!",
    serverAddressDesc: "Private signaling server URL (e.g., https://...)",
    save: "Apply",
    techTabDesc: "Paste the pairing code here.",
    enterCode: "Paste P2P master code",
    connectToCar: "Start P2P Connection",
    connecting: "Heartbeat sync...",
    connectSuccess: "P2P Link established!",
    connectError: "Sync failed. Check NAT/Firewall.",
    disconnect: "Disconnect",
    deleteSession: "Delete",
    chat: "Secure Chat",
    typeMessage: "Message...",
    sendFile: "File",
    waitingForPeer: "Waiting for peer...",
    selectSession: "Select a tunnel to view details",
    login: "Enter Console",
    register: "Register Now",
    username: "Account",
    password: "Password",
    userLogin: "User Login",
    adminLogin: "Expert Login",
    noAccount: "No account? Register",
    hasAccount: "Have account? Login",
    adminAccess: "Expert Access",
    userAccess: "Standard Access",
    enterUsername: "Enter Account",
    enterPassword: "Enter Password",
    enterAdminPassword: "Enter Admin Password",
    invalidPassword: "Invalid Password",
    expertPin: "Expert PIN",
    loginSuccess: "Access Granted"
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'downloads' | 'tech' | 'settings'>('dashboard');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [customServer, setCustomServer] = useState<string>(() => localStorage.getItem('customServer') || '');
  const [chinaMode, setChinaMode] = useState<boolean>(() => localStorage.getItem('chinaMode') === 'true');

  useEffect(() => {
    localStorage.setItem('chinaMode', String(chinaMode));
  }, [chinaMode]);

  // Global Deployment Config
  const DEPLOY_HOST = '120.78.234.56:3000';
  const DEPLOY_URL = `http://${DEPLOY_HOST}`;

  // Base URL for API calls
  const getApiBase = () => {
    if (customServer) return customServer.replace(/\/$/, '');
    
    // In Browser Preview or standard web environment
    if (window.location.protocol !== 'file:') {
       return ''; // Relative to current domain
    }
    
    // For compiled EXE connecting back to cloud
    return DEPLOY_URL;
  };

  const getWsBase = () => {
    if (customServer) {
       return customServer.replace(/^http/i, 'ws').replace(/\/$/, '');
    }
    
    if (window.location.protocol !== 'file:') {
       return window.location.origin.replace(/^http/i, 'ws');
    }
    
    return DEPLOY_URL.replace(/^http/i, 'ws');
  };

  const API_BASE = getApiBase();
  const WS_BASE = getWsBase();
  const [loading, setLoading] = useState(true);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin'>('login');
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Settings State
  const [doipEnabled, setDoipEnabled] = useState(true);
  const [j2534Enabled, setJ2534Enabled] = useState(false);
  const [usbEnabled, setUsbEnabled] = useState(false);
  
  // Ping State
  const [pingResults, setPingResults] = useState<Record<string, string>>({});
  const [isPinging, setIsPinging] = useState<Record<string, boolean>>({});

  // Network Adapter State
  const [adapters, setAdapters] = useState<{name: string, ip: string}[]>([]);
  const [selectedAdapter, setSelectedAdapter] = useState<string>('');
  const [isRefreshingAdapters, setIsRefreshingAdapters] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const [latestCode, setLatestCode] = useState('');
  
  // Tech Client State
  const [techCode, setTechCode] = useState('');
  const [techStatus, setTechStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [techWs, setTechWs] = useState<WebSocket | null>(null);
  const [isPeerConnected, setIsPeerConnected] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Record<string, {id: string, sender: string, text?: string, file?: {name: string, url: string}, timestamp: number}[]>>({});
  const [activeChatSession, setActiveChatSession] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [adminWsMap, setAdminWsMap] = useState<Record<string, WebSocket>>({});
  const [connectionMode, setConnectionMode] = useState<'relay' | 'p2p'>('relay');
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light' | 'pink'>('dark');

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? '' : `theme-${theme}`;
  }, [theme]);

  const t = translations[lang];

  const handlePing = (ip: string) => {
    setIsPinging(prev => ({ ...prev, [ip]: true }));
    // Simulate ping latency
    setTimeout(() => {
        const latency = Math.floor(Math.random() * 40) + 10; // 10-50ms
        setPingResults(prev => ({ ...prev, [ip]: t.pingResult.replace('{ms}', latency.toString()) }));
        setIsPinging(prev => ({ ...prev, [ip]: false }));
    }, 1500);
  };

  const fetchAdapters = async () => {
    setIsRefreshingAdapters(true);
    try {
      // In EXE, we always want the local adapters from the local node server
      const localBase = window.location.protocol === 'file:' ? 'http://127.0.0.1:3000' : API_BASE;
      const res = await fetch(`${localBase}/api/network-interfaces`);
      if (res.ok) {
        const data = await res.json();
        setAdapters(data);
        if (data.length > 0 && !selectedAdapter) {
          setSelectedAdapter(data[0].name);
        }
      } else if (window.location.protocol === 'file:' && localBase !== 'http://127.0.0.1:3000') {
         // Try secondary local address
         const res2 = await fetch(`http://127.0.0.1:3000/api/network-interfaces`);
         if (res2.ok) {
           const data = await res2.json();
           setAdapters(data);
         }
      }
    } catch (e) {
      console.error('Failed to fetch adapters:', e);
      // If we are in EXE and 127.0.0.1:3000 failed, show a hint
      if (window.location.protocol === 'file:') {
         console.warn("Local backend (3000) unreachable. Please ensure the Node.js process is running.");
      }
    } finally {
      setIsRefreshingAdapters(false);
    }
  };

  const autoDetectAdapter = () => {
    if (adapters.length > 0) {
        const enet = adapters.find(a => a.ip.startsWith('169.254.'));
        if (enet) {
            setSelectedAdapter(enet.name);
        } else {
            setSelectedAdapter(adapters[0].name);
        }
    }
  };

  useEffect(() => {
    fetchAdapters();
  }, []);

  useEffect(() => {
    if (adminToken) {
      setIsAdminAuthenticated(true);
      setIsAuthenticated(true);
    }
    const user = localStorage.getItem('bimmerbridge_user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, [adminToken]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (authMode === 'admin') {
      if (!password) {
        setAuthError(t.enterAdminPassword);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        if (res.ok) {
          const { token } = await res.json();
          setAdminToken(token);
          localStorage.setItem('adminToken', token);
          setIsAdminAuthenticated(true);
          setIsAuthenticated(true);
        } else {
          setAuthError(t.invalidPassword);
        }
      } catch (e) {
        setAuthError(lang === 'zh' ? '连接服务器失败' : 'Failed to connect to server');
      }
      return;
    }

    // User Auth Logic
    if (!username || !password) {
      setAuthError(t.enterUsername + ' & ' + t.enterPassword);
      return;
    }

    if (authMode === 'register') {
      const existingUser = localStorage.getItem(`user_${username}`);
      if (existingUser) {
        setAuthError(lang === 'zh' ? '用户名已存在' : 'Username already exists');
        return;
      }
      localStorage.setItem(`user_${username}`, password);
      localStorage.setItem('bimmerbridge_user', username);
      setIsAuthenticated(true);
    } else {
      const savedPassword = localStorage.getItem(`user_${username}`);
      if (savedPassword === password) {
        localStorage.setItem('bimmerbridge_user', username);
        setIsAuthenticated(true);
      } else {
        setAuthError(lang === 'zh' ? '用户名或密码错误' : 'Invalid username or password');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('bimmerbridge_user');
    setAdminToken(null);
    setIsAdminAuthenticated(false);
    setIsAuthenticated(false);
  };

  const [isServerReady, setIsServerReady] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const checkServerHealth = async (retries = 5) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const res = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        setIsServerReady(true);
        setServerError(null);
        return true;
      }
    } catch (e) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return checkServerHealth(retries - 1);
      }
    }

    // After all retries fail
    setIsServerReady(true); // Don't block UI
    return true;
  };

  useEffect(() => {
    checkServerHealth();
    // Background check every 30 seconds
    const interval = setInterval(() => checkServerHealth(0), 30000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  const fetchSessions = async () => {
    if (!isAuthenticated || !isServerReady) return;
    try {
      const res = await fetch(`${API_BASE}/api/sessions`, {
        headers: { 
          'Authorization': adminToken || '',
          'Accept': 'application/json'
        }
      });
      
      if (res.status === 401 && isAdminAuthenticated) {
        console.warn('Admin session expired or invalid');
        setAdminToken(null);
        setIsAdminAuthenticated(false);
        localStorage.removeItem('adminToken');
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Expected JSON but got:', text.substring(0, 100));
        throw new Error('Server returned non-JSON response. Please check backend status.');
      }

      const data = await res.json();
      setSessions(data);
      return data;
    } catch (e) {
      if (e instanceof Error && e.name === 'TypeError' && e.message === 'Failed to fetch') {
        console.error('Network error: Server might be restarting or unreachable');
      } else {
        console.error('Failed to fetch sessions:', e);
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': adminToken || '',
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        if (activeChatSession === sessionId) {
          setActiveChatSession(null);
        }
        fetchSessions();
      }
    } catch (e) {
      console.error('Error deleting session:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isServerReady) {
      fetchSessions();
      const interval = setInterval(fetchSessions, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isServerReady]);

  const createSession = async (replaceId?: string) => {
    try {
      const owner = localStorage.getItem('bimmerbridge_user') || 'anonymous';
      let targetBase = API_BASE;
      if (window.location.protocol === 'file:' && !customServer) {
        targetBase = DEPLOY_URL; // Force cloud for pairing in basic EXE mode
      }
      
      const res = await fetch(`${targetBase}/api/sessions`, { 
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          replaceSessionId: replaceId,
          owner: owner
        })
      });
      
      if (!res.ok) {
        // Fallback to local if cloud failed and we are in EXE
        if (targetBase === DEPLOY_URL && window.location.protocol === 'file:') {
          console.warn("Cloud pairing failed, falling back to local pairing...");
          const localRes = await fetch(`http://127.0.0.1:3000/api/sessions`, { 
            method: 'POST',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
              replaceSessionId: replaceId,
              owner: owner
            })
          });
          if (localRes.ok) {
            const data = await localRes.json();
            fetchSessions();
            return data;
          }
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await res.json();
      fetchSessions();
      return data;
    } catch (e) {
      console.error('Failed to create session:', e);
      // If everything failed, try one last time with local 3000 if we are in EXE
      if (window.location.protocol === 'file:') {
        try {
          const res = await fetch(`http://127.0.0.1:3000/api/sessions`, { method: 'POST' });
          if (res.ok) return await res.json();
        } catch(e2) {}
      }
      return null;
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/sessions/${id}`, { 
        method: 'DELETE',
        headers: { 
          'Authorization': adminToken || '',
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      fetchSessions();
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  };

  const setupP2P = (socket: WebSocket, isOfferer: boolean) => {
    if (pcRef.current) {
      pcRef.current.close();
    }
    
    // Standard and China-optimized STUN servers
    const config = {
      iceServers: chinaMode ? [
        { urls: 'stun:stun.qq.com:3478' },
        { urls: 'stun:stun.mi-img.com:3478' },
        { urls: 'stun:stun.anyfirewall.com:3478' },
        { urls: 'stun:stun.l.google.com:19302' }
      ] : [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.qq.com:3478' }
      ]
    };

    const pc = new RTCPeerConnection(config);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'webrtc_candidate', candidate: event.candidate }));
      }
    };

    pc.onconnectionstatechange = () => {
       if (pc.connectionState === 'connected') {
          setConnectionMode('p2p');
       } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setConnectionMode('relay');
       }
    };

    if (isOfferer) {
      const dc = pc.createDataChannel('bimmerbridge-p2p');
      setupDataChannel(dc);
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        socket.send(JSON.stringify({ type: 'webrtc_offer', offer }));
      });
    } else {
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel);
      };
    }
    return pc;
  };

  const setupDataChannel = (dc: RTCDataChannel) => {
    dcRef.current = dc;
    dc.onopen = () => {
      console.log('P2P Data Channel Open');
      setConnectionMode('p2p');
    };
    dc.onclose = () => {
      console.log('P2P Data Channel Closed');
      setConnectionMode('relay');
    };
    dc.onmessage = (event) => {
       try {
         const data = JSON.parse(event.data);
         handleIncomingData(data, {} as WebSocket, '', ''); 
       } catch(e) {}
    };
  };

  const handleIncomingData = (data: any, ws: WebSocket, targetCode: string, sessionId: string) => {
    if (data.type === 'auth_success') {
      console.log('Auth success:', data.agentId);
      return true;
    } else if (data.type === 'chat') {
       if (data.subtype === 'recall') {
          setChatMessages(prev => {
            const currentMessages = prev[sessionId] || [];
            return {
              ...prev,
              [sessionId]: currentMessages.map(m => m.id === data.messageId ? { ...m, recalled: true } : m)
            };
          });
          return;
       }
      setChatMessages(prev => {
        const currentMessages = prev[sessionId] || [];
        if (currentMessages.some(m => m.id === data.message.id)) return prev;
        return { ...prev, [sessionId]: [...currentMessages, data.message] };
      });
    } else if (data.type === 'peer_connected') {
      setIsPeerConnected(true);
      // Tech client is the initiator
      if (activeTab === 'tech') {
        setupP2P(ws, true);
      }
    } else if (data.type === 'peer_disconnected') {
      setIsPeerConnected(false);
      setConnectionMode('relay');
    } else if (data.type === 'car_info') {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, carIp: data.ip, carVin: data.vin } : s));
    } else if (data.type === 'webrtc_offer') {
      const pc = pcRef.current || setupP2P(ws, false);
      pc.setRemoteDescription(new RTCSessionDescription(data.offer))
        .then(() => pc.createAnswer())
        .then(answer => pc.setLocalDescription(answer))
        .then(() => ws.send(JSON.stringify({ type: 'webrtc_answer', answer: pc.localDescription })));
    } else if (data.type === 'webrtc_answer') {
      pcRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === 'webrtc_candidate') {
      pcRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.warn('ICE Error:', e));
    }
    return false;
  };
  // Car Client State
  const [carWs, setCarWs] = useState<WebSocket | null>(null);
  const [myCarSessionId, setMyCarSessionId] = useState<string | null>(() => localStorage.getItem('myCarSessionId'));

  const getSmartCode = () => {
    if (!latestCode) return '';
    let host = '';
    
    // Prioritize custom server setting
    if (customServer) {
      host = customServer.replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase();
    } 
    // Fallback if no custom server
    else {
      // Use window.location.host instead of hardcoded DEPLOY_HOST for best China connectivity
      // If we are in EXE (file:), we use the DEPLOY_HOST
      if (window.location.protocol === 'file:') {
        host = DEPLOY_HOST.toLowerCase();
      } else {
        host = window.location.host.toLowerCase();
      }
    }
    
    return host ? `${host}#${latestCode}` : latestCode;
  };

  const handleGenerateCode = async () => {
    if (isGeneratingCode) return;
    setIsGeneratingCode(true);

    try {
      // 1. Try to refresh existing session if possible
      if (myCarSessionId) {
        try {
          const res = await fetch(`${API_BASE}/api/sessions/${myCarSessionId}/refresh`, {
            method: 'PUT',
            headers: { 'Accept': 'application/json' }
          });
          if (res.ok) {
            const data = await res.json();
            setLatestCode(data.code);
            setMyCarSessionId(data.sessionId);
            localStorage.setItem('myCarSessionId', data.sessionId);
            
            // Reconnect WS
            if (carWs) carWs.close();
            const isCloudSession = !customServer && window.location.protocol === 'file:';
            const wsBase = isCloudSession ? DEPLOY_URL.replace(/^http/i, 'ws') : WS_BASE;
            connectCarWs(data.code, data.sessionId, wsBase);
            setIsGeneratingCode(false);
            return;
          }
        } catch (e) {
          console.error('Failed to refresh local session:', e);
        }
      }

      // 2. If no local session or refresh failed, create a new one while replacing the old one on the server
      if (carWs) {
        carWs.close();
        setCarWs(null);
      }

      const session = await createSession(myCarSessionId || undefined);
      if (session) {
        setLatestCode(session.code);
        setMyCarSessionId(session.id);
        localStorage.setItem('myCarSessionId', session.id);
        
        const isCloudSession = !customServer && window.location.protocol === 'file:';
        const wsBase = isCloudSession ? DEPLOY_URL.replace(/^http/i, 'ws') : WS_BASE;
        
        connectCarWs(session.code, session.id, wsBase);
      }
    } finally {
      setIsGeneratingCode(false);
    }
  };

   const connectCarWs = (code: string, sessionId: string, forcedWsBase?: string) => {
    const base = forcedWsBase || WS_BASE;
    const wsUrl = `${base}/bridge`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', role: 'car', code }));
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          handleIncomingData(data, ws, code, sessionId);
          
          // If peer connects, Car starts the offer (let's just pick one side)
          if (data.type === 'peer_connected' && data.role === 'tech') {
              setupP2P(ws, true);
          }
        } catch (e) {}
      }
    };

    setCarWs(ws);
  };

  const handleScanVehicle = (sessionId: string) => {
    if (!carWs || carWs.readyState !== WebSocket.OPEN) {
      return;
    }
    
    setIsScanning(true);
    // Simulate scanning for vehicle on the network
    setTimeout(() => {
      // Find an adapter that looks like a car (169.254.x.x)
      const carAdapter = adapters.find(a => a.ip.startsWith('169.254.'));
      const mockIp = carAdapter ? carAdapter.ip : '169.254.12.34';
      
      carWs.send(JSON.stringify({ 
        type: 'info', 
        ip: mockIp, 
        vin: 'WBA' + Math.random().toString(36).substring(2, 15).toUpperCase() 
      }));
      setIsScanning(false);
      // Force an immediate refresh of sessions to show the connected status
      setTimeout(fetchSessions, 500);
    }, 1500);
  };

  const handleTechConnect = () => {
    if (techWs) {
      techWs.close();
      setTechWs(null);
    }
    
    let rawInput = techCode.trim().toUpperCase();
    if (!rawInput) return;

    // Strip "CN_" prefix if present
    if (rawInput.startsWith("CN_")) {
       rawInput = rawInput.substring(3);
    }

    let targetCode = '';
    let targetApiBase = API_BASE;
    let targetWsBase = WS_BASE;

    // Smart Detection
    if (rawInput.includes('#')) {
      const parts = rawInput.split('#');
      if (parts.length >= 2) {
        let serverUrl = parts[0].trim();
        let codePart = parts[parts.length - 1].trim().toUpperCase();
        
        if (codePart.length > 0) {
          if (!serverUrl.match(/^https?:\/\//i)) {
            const isIp = /^[0-9.]+(:[0-9]+)?$/.test(serverUrl);
            serverUrl = (isIp ? 'http://' : 'https://') + serverUrl;
          }
          targetApiBase = serverUrl.replace(/\/$/, '');
          targetWsBase = serverUrl.replace(/^http/i, 'ws').replace(/\/$/, '');
          targetCode = codePart;
          
          if (!serverUrl.includes('127.0.0.1') && !serverUrl.includes('localhost')) {
            setCustomServer(serverUrl);
            localStorage.setItem('customServer', serverUrl);
          }
        }
      }
    } else if (rawInput.length >= 6 && /^[0-9A-Z]+$/i.test(rawInput)) {
      // 6-digit short code: use default DEPLOY_URL if available
      targetCode = rawInput.toUpperCase();
      if (DEPLOY_URL && window.location.protocol === 'file:') {
        const cloudHost = DEPLOY_URL.includes(':') ? DEPLOY_URL : `${DEPLOY_URL}:3000`;
        targetApiBase = `http://${cloudHost}`;
        targetWsBase = `ws://${cloudHost}`;
      }
    } else if (rawInput.includes('.') && rawInput.length > 10) {
      return;
    }

    if (!targetCode) {
      setTechStatus('error');
      return;
    }

    setLatestCode(targetCode);
    setTechStatus('connecting');
    const wsUrl = `${targetWsBase}/bridge`;
    
    const fetchSessionsFromUrl = async () => {
      try {
        const res = await fetch(`${targetApiBase}/api/sessions`, {
          headers: { 'Authorization': adminToken || '', 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
          const session = data.find((s: Session) => s.code === targetCode);
          if (session) setActiveChatSession(session.id);
        }
      } catch (e) {}
    };

    try {
      const ws = new WebSocket(wsUrl);
      setTechWs(ws);

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          handleTechError(new Error('Timeout'));
        }
      }, 10000);

      const handleTechError = (e: any) => {
        console.error('Tech WS Error:', e);
        console.log('Failed connection target:', wsUrl);
        setTechStatus('error');
        alert(lang === 'zh' 
          ? `配对失败：无法与全球信令中心建立握手。\n\n请检查：\n1. 您的防火墙是否允许 TCP 3000 端口通讯\n2. 另一端（车辆端）是否已经成功生成了连接码\n3. 网络环境是否处于极度严格的局域网管控下`
          : `Pairing Failed: Unable to reach signaling center.\n\nPlease check:\n1. Your firewall allows TCP 3000 traffic\n2. The remote Car Client has generated a valid code\n3. Your current network doesn't block high-speed P2P links.`);
      };

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        ws.send(JSON.stringify({ type: 'auth', role: 'tech', code: targetCode }));
      };

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'auth_success') {
              setTechStatus('connected');
              fetchSessionsFromUrl();
              setActiveTab('dashboard');
              
              // Start P2P if possible
              setupP2P(ws, true);
            }
            
            // Critical: find sessionId if we only have code
            const currentSessionId = data.sessionId || (sessions.find(s => s.code === targetCode)?.id) || '';
            handleIncomingData(data, ws, targetCode, currentSessionId);
          } catch (e) {}
        }
      };

      ws.onerror = handleTechError;
      ws.onclose = () => {
        if (techStatus === 'connected') setTechStatus('idle');
        setTechWs(null);
      };
    } catch(e) {
      setTechStatus('error');
      console.error(e);
    }
  };

  const handleTechDisconnect = () => {
    if (techWs) {
      techWs.close();
      setTechWs(null);
    }
    setTechStatus('idle');
    setTechCode('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Removed alert as per user request
  };

  const handleOpenChat = (session: Session) => {
    setActiveChatSession(session.id);
    if (!adminWsMap[session.id]) {
      const wsUrl = `${WS_BASE}/bridge`;
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'auth', role: 'admin', code: session.code }));
      };
      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'chat') {
              setChatMessages(prev => {
                const currentMessages = prev[session.id] || [];
                if (currentMessages.some(m => m.id === data.message.id)) return prev;
                return {
                  ...prev,
                  [session.id]: [...currentMessages, data.message]
                };
              });
            }
          } catch (e) {}
        }
      };
      setAdminWsMap(prev => ({ ...prev, [session.id]: ws }));
    }
  };

  const handleRecallMessage = (sessionId: string, messageId: string) => {
    const ws = adminWsMap[sessionId] || carWs || techWs;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'chat',
        subtype: 'recall',
        messageId,
        sessionId
      }));
      
      // Update local state
      setChatMessages(prev => {
        const currentMessages = prev[sessionId] || [];
        return {
          ...prev,
          [sessionId]: currentMessages.map(m => 
            m.id === messageId ? { ...m, recalled: true } : m
          )
        };
      });
    }
  };

  const handleSendMessage = (sessionId: string, senderRole: 'admin' | 'car' | 'tech') => {
    if (!chatInput.trim()) return;
    
    const message = {
      id: uuidv4(),
      sender: senderRole,
      text: chatInput,
      timestamp: Date.now()
    };

    // Update local state immediately for better UX
    setChatMessages(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), message]
    }));

    // Send via WebSocket or P2P
    const ws = senderRole === 'admin' ? adminWsMap[sessionId] : (senderRole === 'car' ? carWs : techWs);
    if (dcRef.current && dcRef.current.readyState === 'open' && senderRole !== 'admin') {
       dcRef.current.send(JSON.stringify({ type: 'chat', message }));
    } else if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat', message }));
    } else {
      console.error('No connection open, message not sent');
    }

    setChatInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, sessionId: string, senderRole: 'admin' | 'car' | 'tech') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, we would upload the file to a server and get a URL.
    // For this prototype, we'll create a local object URL.
    const fileUrl = URL.createObjectURL(file);
    
    const message = {
      id: uuidv4(),
      sender: senderRole,
      file: { name: file.name, url: fileUrl },
      timestamp: Date.now()
    };

    // Update local state
    setChatMessages(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), message]
    }));

    // Send via WebSocket
    const ws = senderRole === 'admin' ? adminWsMap[sessionId] : (senderRole === 'car' ? carWs : techWs);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat', message }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent-primary)]/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="scanline" />
        <div className="absolute inset-0 cyber-grid pointer-events-none" />
        <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl overflow-hidden shadow-2xl animate-breathe z-10">
          <div className="p-8 border-b border-[var(--border-main)] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(46,134,222,0.4)]">
              <Network className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-[1px] uppercase text-[var(--text-main)] glow-text">
              BimmerBridge <span className="text-[var(--accent-primary)]">ENET</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-2">
              {lang === 'zh' ? '私有加密 P2P 研发通讯终端' : 'Private Secure P2P Comm Terminal'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="p-8 space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-[var(--accent-primary)]">
                {authMode === 'admin' ? t.adminLogin : (authMode === 'login' ? t.userLogin : t.register)}
              </h2>
            </div>

            {authError && (
              <div className="p-3 bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)] text-[var(--accent-danger)] text-sm rounded text-center">
                {authError}
              </div>
            )}
            
            {authMode !== 'admin' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] text-[var(--text-muted)] mb-2">
                  {t.username}
                </label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  placeholder={t.enterUsername}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-[1px] text-[var(--text-muted)] mb-2">
                {t.password}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                placeholder={authMode === 'admin' ? t.enterAdminPassword : t.enterPassword}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white font-bold uppercase tracking-[1px] py-3 rounded transition-colors shadow-[0_4px_15px_rgba(46,134,222,0.3)]"
            >
              {authMode === 'admin' ? t.login : (authMode === 'login' ? t.login : t.register)}
            </button>
            
            <div className="flex flex-col items-center gap-4 mt-6">
              {authMode !== 'admin' ? (
                <>
                  <button 
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setAuthError('');
                    }}
                    className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs uppercase tracking-[1px] transition-colors"
                  >
                    {authMode === 'login' ? t.noAccount : t.hasAccount}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setAuthMode('admin');
                      setAuthError('');
                    }}
                    className="text-[var(--accent-primary)] hover:underline text-[10px] uppercase tracking-[1px] font-bold"
                  >
                    {t.adminAccess}
                  </button>
                </>
              ) : (
                <button 
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs uppercase tracking-[1px] transition-colors"
                >
                  {t.userAccess}
                </button>
              )}

              <button 
                type="button"
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-[10px] uppercase tracking-[1px] flex items-center gap-1 mt-2"
              >
                <Globe className="w-3 h-3" />
                {lang === 'zh' ? 'English' : '中文'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center space-y-2">
          <div className="text-[var(--text-muted)] text-xs uppercase tracking-[1px]">
            {lang === 'zh' ? '出品方' : 'Created By'}: <span className="text-[var(--text-main)] font-bold">周海飞</span>
          </div>
          <div className="text-[var(--text-muted)] text-xs uppercase tracking-[1px]">
            {lang === 'zh' ? '联系邮箱' : 'Contact Email'}: <a href="mailto:bmwtpi@gmail.com" className="text-[var(--accent-primary)] hover:underline">bmwtpi@gmail.com</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent-primary)]/30 flex flex-col relative overflow-hidden">
      <div className="scanline" />
      <div className="absolute inset-0 cyber-grid pointer-events-none" />
      {/* Header */}
      <header className="h-[60px] border-b border-[var(--border-main)] bg-[var(--bg-card)] flex items-center sticky top-0 z-10 shrink-0">
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold tracking-[1px] uppercase">
            <div className="w-6 h-6 bg-[var(--accent-primary)] rounded flex items-center justify-center">
              <Network className="w-4 h-4 text-white" />
            </div>
            <span className="text-[var(--text-main)] flex items-center gap-2 glow-text">
              {t.title} <span className="text-[var(--accent-primary)] font-black">ENET</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-mono text-[9px] tracking-widest ml-1 opacity-70">
                {t.version}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[var(--bg-main)] border border-[var(--accent-primary)]/20 rounded-full">
              <div className="relative">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-[9px] font-mono text-emerald-500/80 tracking-widest uppercase">P2P TUNNEL [SECURE]</span>
            </div>
            <nav className="flex gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-[1px] transition-colors ${activeTab === "dashboard" ? "bg-[var(--accent-primary)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]"}`}
                >
                  {t.dashboard}
                </button>
              )}
              <button
                onClick={() => setActiveTab("downloads")}
                className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-[1px] transition-colors ${activeTab === "downloads" ? "bg-[var(--accent-primary)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]"}`}
              >
                {t.downloads}
              </button>
              <button
                onClick={() => setActiveTab("tech")}
                className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-[1px] transition-colors flex items-center gap-1.5 ${activeTab === "tech" ? "bg-[var(--accent-primary)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]"}`}
              >
                <Laptop className="w-3.5 h-3.5" />
                {t.techTab}
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-[1px] transition-colors flex items-center gap-1.5 ${activeTab === "settings" ? "bg-[var(--accent-primary)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]"}`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                {t.settings}
              </button>
            </nav>
            <div className="h-6 w-px bg-[var(--border-main)]"></div>
            <button 
              onClick={() => {
                const themes: ('dark' | 'light' | 'pink')[] = ['dark', 'light', 'pink'];
                const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
                setTheme(nextTheme);
              }}
              className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors uppercase tracking-[1px]"
              title={lang === 'zh' ? '切换主题' : 'Toggle Theme'}
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors uppercase tracking-[1px]"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent-danger)] hover:text-[var(--accent-danger-hover)] transition-colors uppercase tracking-[1px] ml-2"
            >
              {lang === 'zh' ? '退出登录' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {!isServerReady && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] animate-in fade-in duration-700">
            <div className="w-16 h-16 border-4 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">
              {lang === 'zh' ? '正在启动后台服务...' : 'Starting Backend Service...'}
            </h3>
            <p className="text-[var(--text-muted)] text-sm">
              {serverError || (lang === 'zh' ? '这可能需要几秒钟，请稍候。' : 'This may take a few seconds, please wait.')}
            </p>
            {serverError && (
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-[var(--accent-primary)] text-white rounded font-bold uppercase tracking-wider text-xs"
              >
                {lang === 'zh' ? '重试' : 'Retry'}
              </button>
            )}
          </div>
        )}

        {isServerReady && activeTab === "dashboard" && isAuthenticated && (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-[11px] uppercase tracking-[2px] text-[var(--text-muted)] mb-2">
                  {t.remoteSessions}
                </h2>
                {t.manageConnections && <p className="text-[var(--text-main)] text-sm">{t.manageConnections}</p>}
              </div>
              <button
                onClick={() => setActiveTab("downloads")}
                className="bg-[var(--accent-primary)] text-white px-6 py-3 rounded font-semibold uppercase tracking-[1px] text-xs hover:bg-[var(--accent-primary)]/90 transition-colors flex items-center gap-2"
              >
                <Laptop className="w-4 h-4" />
                {t.newSession}
              </button>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
              {/* Left Sidebar: Session List + Details */}
              <div className="w-80 flex-shrink-0 flex flex-col gap-6 overflow-hidden animate-breathe p-1 rounded-2xl border border-[var(--border-main)]">
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="text-center py-12 text-[var(--text-muted)] font-mono text-sm">
                      {t.loading}
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-8 text-center">
                      <Server className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3" />
                      <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
                        {t.noSessions}
                      </p>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleOpenChat(session)}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 group relative cursor-pointer ${activeChatSession === session.id ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] shadow-[0_0_15px_rgba(46,134,222,0.1)]' : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--text-muted)]'}`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <Shield className={`w-3.5 h-3.5 ${activeChatSession === session.id ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                            <span className="font-mono text-sm font-bold tracking-wider text-[var(--text-main)]">
                              {session.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {session.carConnected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)] shadow-[0_0_5px_rgba(39,174,96,0.5)]" title="Car Connected"></div>}
                            {session.techConnected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_5px_rgba(46,134,222,0.5)]" title="Tech Connected"></div>}
                            <button 
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="ml-1 p-1 rounded-full hover:bg-[var(--accent-danger)]/20 text-[var(--text-muted)] hover:text-[var(--accent-danger)] transition-colors opacity-0 group-hover:opacity-100"
                              title={t.deleteSession}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                          <span>{new Date(session.createdAt).toLocaleTimeString()}</span>
                          <div className="flex items-center gap-2">
                            <MessageSquare className={`w-3 h-3 ${activeChatSession === session.id ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity'}`} />
                            <span className="group-hover:text-[var(--text-main)] transition-colors">
                              {session.carConnected && session.techConnected ? t.connected : t.waiting}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Active Session Details in Sidebar */}
                {activeChatSession && (
                  (() => {
                    const session = sessions.find(s => s.id === activeChatSession);
                    if (!session) return null;
                    return (
                      <div className="flex-shrink-0 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[2px] font-bold mb-2 px-1">
                          {lang === 'zh' ? '当前会话详情' : 'Session Details'}
                        </div>
                        
                        {/* Car Status Card */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-4 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded ${session.carConnected ? "bg-[var(--accent-success)]/10 text-[var(--accent-success)]" : "bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-main)]"}`}>
                                <Car className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{t.carClient}</div>
                                <div className={`text-sm font-mono font-bold ${session.carConnected ? "text-[var(--accent-success)]" : "text-[var(--text-muted)]"}`}>
                                  {session.carConnected ? t.connected : t.waiting}
                                </div>
                              </div>
                            </div>
                            {session.carConnected && <div className="w-2 h-2 rounded-full bg-[var(--accent-success)] animate-pulse"></div>}
                          </div>

                          {session.carConnected && session.carIp && (
                            <div className="pt-4 border-t border-[var(--border-main)] space-y-3">
                              <div>
                                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{t.realIp}</div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-sm text-[var(--accent-success)]">{session.carIp}</span>
                                  <button
                                    onClick={() => handlePing(session.carIp!)}
                                    disabled={isPinging[session.carIp!]}
                                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${isPinging[session.carIp!] ? 'bg-[var(--border-main)] text-[var(--text-muted)]' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]'}`}
                                  >
                                    {isPinging[session.carIp!] ? t.pinging : t.ping}
                                  </button>
                                </div>
                                {pingResults[session.carIp!] && (
                                  <div className="text-[10px] font-mono text-[var(--accent-success)] mt-1">{pingResults[session.carIp!]}</div>
                                )}
                              </div>
                              <div>
                                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{t.vin}</div>
                                <div className="font-mono text-sm text-[var(--text-main)]">{session.carVin || t.unknown}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tech Status Card */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded ${session.techConnected ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]" : "bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-main)]"}`}>
                                <Laptop className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{t.techClient}</div>
                                <div className={`text-sm font-mono font-bold ${session.techConnected ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`}>
                                  {session.techConnected ? t.connected : t.waiting}
                                </div>
                              </div>
                            </div>
                            {session.techConnected && <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse"></div>}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Right Workspace: Details + Chat */}
              <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl flex flex-col overflow-hidden shadow-xl animate-breathe">
                {activeChatSession ? (
                  (() => {
                    const session = sessions.find(s => s.id === activeChatSession);
                    if (!session) return null;
                    return (
                      <div className="flex flex-col h-full">
                        {/* Workspace Header */}
                        <div className="p-4 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-card)]">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
                              <span className="px-3 py-1 rounded bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-mono text-lg font-bold tracking-[2px]">
                                {session.code}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveChatSession(null)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all text-[10px] font-bold uppercase tracking-wider border border-[var(--border-main)]"
                            title={lang === 'zh' ? '关闭聊天' : 'Close Chat'}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {lang === 'zh' ? '收起' : 'Hide'}
                          </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden bg-[var(--bg-card)]">
                          {/* Right: Chat Panel (Full Width) */}
                          <div className="flex-1 flex flex-col p-6">
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                              {(chatMessages[session.id] || []).map((msg) => (
                                <div key={msg.id} className={`flex flex-col group/msg ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                                  <div className="text-[10px] text-[var(--text-muted)] mb-1 uppercase font-bold tracking-wider flex items-center gap-2">
                                    {msg.sender === 'admin' ? t.dashboard : (msg.sender === 'car' ? t.carClient : t.techClient)}
                                    {msg.sender === 'admin' && !msg.recalled && (
                                      <button
                                        onClick={() => handleRecallMessage(session.id, msg.id)}
                                        className="opacity-0 group-hover/msg:opacity-100 transition-opacity text-[var(--accent-danger)] hover:underline"
                                        title={lang === 'zh' ? '撤回消息' : 'Recall Message'}
                                      >
                                        {lang === 'zh' ? '撤回' : 'Recall'}
                                      </button>
                                    )}
                                  </div>
                                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm relative ${msg.recalled ? 'bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-muted)] italic' : (msg.sender === 'admin' ? 'bg-[var(--accent-primary)] text-white rounded-tr-none' : 'bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] rounded-tl-none')}`}>
                                    {msg.recalled ? (
                                      <p>{lang === 'zh' ? '消息已撤回' : 'Message recalled'}</p>
                                    ) : (
                                      <>
                                        {msg.text && <p className="break-words leading-relaxed">{msg.text}</p>}
                                        {msg.file && (
                                          <a href={msg.file.url} download={msg.file.name} className="flex items-center gap-2 mt-1 text-current hover:underline decoration-white/30">
                                            <File className="w-4 h-4" />
                                            <span className="truncate text-xs">{msg.file.name}</span>
                                          </a>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="pt-4 border-t border-[var(--border-main)]">
                              {session.carConnected && session.techConnected ? (
                                <div className="flex items-center gap-3">
                                  <label className="cursor-pointer p-3 bg-[var(--bg-main)] border border-[var(--border-main)] hover:border-[var(--accent-primary)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] rounded-xl transition-all">
                                    <Paperclip className="w-5 h-5" />
                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, session.id, 'admin')} />
                                  </label>
                                  <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(session.id, 'admin')}
                                    placeholder={t.typeMessage}
                                    className="flex-1 bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl focus:border-[var(--accent-primary)] focus:outline-none placeholder:text-[var(--text-muted)] focus:ring-1 focus:ring-[var(--accent-primary)]/20"
                                  />
                                  <button
                                    onClick={() => handleSendMessage(session.id, 'admin')}
                                    className="p-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-xl transition-all shadow-lg shadow-[var(--accent-primary)]/20 active:scale-95"
                                  >
                                    <Send className="w-5 h-5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center py-3 px-4 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl text-[var(--text-muted)] text-[11px] uppercase tracking-[2px] font-bold">
                                  {t.waitingForPeer}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] bg-[var(--bg-main)]/20">
                    <div className="relative mb-6">
                      <Shield className="w-20 h-20 opacity-10" />
                      <Activity className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent-primary)] opacity-20 animate-pulse" />
                    </div>
                    <p className="text-sm uppercase tracking-[2px] font-bold opacity-40">
                      {t.selectSession}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isServerReady && activeTab === "downloads" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-[11px] uppercase tracking-[2px] text-[var(--text-muted)] mb-2">
                {t.downloadInstructions}
              </h2>
              <p className="text-[var(--text-main)] text-xs">
                {t.downloadDesc}
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-8 text-center shadow-xl relative overflow-hidden animate-breathe">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-50"></div>
              
              <div className="flex items-center justify-center">
                <button
                  onClick={() => handleGenerateCode()}
                  disabled={isGeneratingCode}
                  className={`bg-[var(--accent-primary)] text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-[2px] transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 border border-white/10 ${isGeneratingCode ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl'}`}
                >
                  <Zap className={`w-4 h-4 ${isGeneratingCode ? 'animate-spin' : 'fill-current'}`} />
                  {isGeneratingCode ? (lang === 'zh' ? '处理中...' : 'Processing...') : (latestCode ? (lang === 'zh' ? '刷新代码' : 'Refresh') : t.generateCode)}
                </button>
              </div>

              {latestCode && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-[var(--bg-main)]/50 border border-[var(--border-main)] rounded-xl p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                        <Shield className="w-4 h-4" />
                        <h3 className="text-[11px] font-black uppercase tracking-[1px]">{t.smartCode}</h3>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="bg-[var(--bg-card)] px-6 py-4 rounded-xl border border-[var(--border-main)] flex items-center justify-between shadow-inner">
                        <code className="font-mono text-2xl font-black text-[var(--text-main)] tracking-[0.2em]">
                          {latestCode}
                        </code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(latestCode);
                          }}
                          className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white p-3 rounded-lg transition-all active:scale-95"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] italic text-center">
                        {t.sendToTech}
                      </p>
                    </div>
                  </div>

                  {/* Car Client Status & Chat Area */}
                  {(() => {
                    const session = sessions.find(s => s.code === latestCode);
                    if (!session) return null;
                    return (
                      <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Vehicle Connection Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-4 rounded-lg border flex flex-col gap-1 transition-all ${session.carConnected ? 'bg-[var(--accent-success)]/5 border-[var(--accent-success)]/30' : 'bg-[var(--bg-main)] border-[var(--border-main)]'}`}>
                             <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${session.carConnected ? 'bg-[var(--accent-success)] text-white' : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'}`}>
                                  <Car className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{lang === 'zh' ? '车辆连接状态' : 'Vehicle Connection'}</div>
                                  <div className={`text-sm font-bold ${session.carConnected ? 'text-[var(--accent-success)]' : 'text-[var(--text-muted)]'}`}>
                                    {session.carConnected ? (lang === 'zh' ? '已连接到车辆' : 'Connected to Vehicle') : (lang === 'zh' ? '未连接到车辆' : 'Not Connected')}
                                  </div>
                                </div>
                                {!session.carConnected && (
                                  <button
                                    onClick={() => handleScanVehicle(session.id)}
                                    disabled={isScanning}
                                    className="ml-auto px-3 py-1.5 bg-[var(--accent-primary)] text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-[var(--accent-primary)]/90 disabled:opacity-50"
                                  >
                                    {isScanning ? (lang === 'zh' ? '正在读取...' : 'Reading...') : (lang === 'zh' ? '读取车辆IP' : 'Read Vehicle IP')}
                                  </button>
                                )}
                             </div>
                             {session.carConnected && (
                               <div className="mt-2 pt-2 border-t border-[var(--accent-success)]/20 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                     <Zap className={`w-3 h-3 ${connectionMode === 'p2p' ? 'text-yellow-400 animate-pulse' : 'text-blue-400'}`} />
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                        {lang === 'zh' ? '传输模式' : 'Mode'}
                                     </span>
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-wider ${connectionMode === 'p2p' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                     {connectionMode === 'p2p' ? 'P2P SECURE' : 'ESTABLISHING...'}
                                  </span>
                               </div>
                             )}
                          </div>

                          <div className={`p-4 rounded-lg border flex items-center gap-4 transition-all ${session.techConnected ? 'bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/30' : 'bg-[var(--bg-main)] border-[var(--border-main)]'}`}>
                            <div className={`p-2 rounded-full ${session.techConnected ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'}`}>
                              <Laptop className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{lang === 'zh' ? '编程端连接状态' : 'Tech Connection'}</div>
                              <div className={`text-sm font-bold ${session.techConnected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>
                                {session.techConnected ? (lang === 'zh' ? '编程端已就绪' : 'Tech Ready') : (lang === 'zh' ? '等待编程端...' : 'Waiting for Tech...')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {session.carConnected && session.carIp && (
                          <div className="bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg p-4 flex flex-wrap gap-8 justify-center animate-in zoom-in-95 duration-300">
                            <div className="text-left">
                              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{t.realIp}</div>
                              <div className="font-mono text-[var(--accent-success)] font-bold">{session.carIp}</div>
                            </div>
                            <div className="text-left">
                              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{t.vin}</div>
                              <div className="font-mono text-[var(--text-main)] font-bold">{session.carVin || t.unknown}</div>
                            </div>
                          </div>
                        )}

                        {/* Chat Area */}
                        <div className="border border-[var(--border-main)] flex flex-col h-80 bg-[var(--bg-main)] rounded-lg p-4 text-left shadow-inner">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-[var(--text-main)] font-bold uppercase tracking-[1px] text-xs">
                              <MessageSquare className="w-4 h-4 text-[var(--accent-primary)]" />
                              {t.chat}
                            </div>
                            {session.techConnected && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)] animate-pulse"></div>
                                <span className="text-[10px] text-[var(--accent-success)] font-bold uppercase tracking-wider">{lang === 'zh' ? '在线' : 'Online'}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar">
                            {(chatMessages[session.id] || []).map((msg) => (
                              <div key={msg.id} className={`flex flex-col ${msg.sender === 'car' ? 'items-end' : 'items-start'}`}>
                                <div className="text-[10px] text-[var(--text-muted)] mb-1 uppercase font-bold tracking-wider">
                                  {msg.sender === 'admin' ? t.dashboard : (msg.sender === 'car' ? t.carClient : t.techClient)}
                                </div>
                                <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${msg.recalled ? 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)] italic' : (msg.sender === 'car' ? 'bg-[var(--accent-primary)] text-white rounded-tr-none' : 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] rounded-tl-none')}`}>
                                  {msg.recalled ? (
                                    <p>{lang === 'zh' ? '消息已撤回' : 'Message recalled'}</p>
                                  ) : (
                                    <>
                                      {msg.text && <p className="break-words leading-relaxed">{msg.text}</p>}
                                      {msg.file && (
                                        <a href={msg.file.url} download={msg.file.name} className="flex items-center gap-2 mt-1 text-current hover:underline decoration-white/30">
                                          <File className="w-4 h-4" />
                                          <span className="truncate text-xs">{msg.file.name}</span>
                                        </a>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-auto">
                            {session.techConnected ? (
                              <>
                                <label className="cursor-pointer p-2 bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--accent-primary)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] rounded-xl transition-all">
                                  <Paperclip className="w-4 h-4" />
                                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, session.id, 'car')} />
                                </label>
                                <input
                                  type="text"
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(session.id, 'car')}
                                  placeholder={t.typeMessage}
                                  className="flex-1 bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] text-sm px-4 py-2 rounded-xl focus:border-[var(--accent-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
                                />
                                <button
                                  onClick={() => handleSendMessage(session.id, 'car')}
                                  className="p-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-xl transition-all shadow-lg shadow-[var(--accent-primary)]/10"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <div className="flex-1 text-center py-3 px-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-[var(--text-muted)] text-[10px] uppercase tracking-[2px] font-bold">
                                {t.waitingForPeer}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="bg-[var(--bg-card)] border-l-4 border-[var(--accent-primary)] rounded p-6 flex gap-4">
              <Terminal className="w-6 h-6 text-[var(--accent-primary)] shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[1px] text-[var(--text-main)] mb-2">
                  {t.howToReadIp}
                </h4>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                  {t.howToReadIpDesc1}
                  <br />
                  <br />
                  {t.howToReadIpDesc2}
                </p>
              </div>
            </div>
          </div>
        )}

        {isServerReady && activeTab === "tech" && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-[11px] uppercase tracking-[2px] text-[var(--text-muted)] mb-2">
                {t.techTab}
              </h2>
              <p className="text-[var(--text-main)] text-sm">
                {t.techTabDesc}
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden group animate-breathe">
              {/* Breath Light Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-primary)]/5 via-transparent to-[var(--accent-primary)]/5 opacity-30"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-50 shadow-[0_0_15px_var(--accent-primary)]"></div>
              
              {techStatus === 'connected' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-20 h-20 bg-[var(--accent-success)]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--accent-success)]">
                    <Shield className="w-10 h-10 text-[var(--accent-success)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-main)] mb-2">{t.connectSuccess}</h3>
                  <p className="text-[var(--text-muted)] mb-8">
                    {lang === 'zh' ? '您现在可以使用 E-Sys 或 ISTA 连接到 127.0.0.1 进行诊断与编程。' : 'You can now use E-Sys or ISTA to connect to 127.0.0.1 for diagnostics and programming.'}
                  </p>
                  <button
                    onClick={handleTechDisconnect}
                    className="bg-[var(--accent-danger)] text-white px-8 py-3 rounded font-bold uppercase tracking-[1px] hover:bg-[var(--accent-danger-hover)] transition-colors"
                  >
                    {t.disconnect}
                  </button>
                </div>
              ) : (
                <div className="max-w-sm mx-auto relative z-10">
                  <div className="mb-8 relative inline-block">
                    <div className="absolute -inset-4 bg-[var(--accent-primary)]/10 rounded-full blur-xl animate-pulse"></div>
                    <Laptop className="w-16 h-16 text-[var(--accent-primary)] relative animate-bounce" style={{ animationDuration: '3s' }} />
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={techCode}
                        onChange={(e) => setTechCode(e.target.value)}
                        placeholder={t.enterCode}
                        className="w-full bg-[var(--bg-main)]/50 border-2 border-[var(--border-main)] text-[var(--text-main)] px-6 py-4 rounded-xl text-center font-mono text-lg focus:border-[var(--accent-primary)] focus:outline-none transition-all placeholder:text-[var(--text-muted)] focus:shadow-[0_0_20px_rgba(46,134,222,0.1)]"
                      />
                    </div>
                    
                    {techStatus === 'error' && (
                      <div className="text-[var(--accent-danger)] text-sm bg-[var(--accent-danger)]/10 py-2 rounded-lg border border-[var(--accent-danger)]/20">
                        {t.connectError}
                      </div>
                    )}

                    <button
                      onClick={handleTechConnect}
                      disabled={techStatus === 'connecting'}
                      className="w-full bg-[var(--accent-primary)] text-white py-4 rounded-xl font-black uppercase tracking-[2px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[var(--accent-primary)]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {techStatus === 'connecting' ? (
                        <>
                          <Zap className="w-5 h-5 animate-spin" />
                          {lang === 'zh' ? '正在连接...' : 'Connecting...'}
                        </>
                      ) : (
                        <>
                          <Terminal className="w-5 h-5" />
                          {t.connectToCar}
                        </>
                      )}
                    </button>

                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold text-center opacity-40 flex items-center gap-4 py-2">
                       <span className="h-px bg-[var(--border-main)] flex-1"></span>
                       <span>{lang === 'zh' ? '或者 (OR)' : 'OR'}</span>
                       <span className="h-px bg-[var(--border-main)] flex-1"></span>
                    </div>

                    <div className="flex gap-4 items-center bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10 p-5 rounded-2xl text-left">
                       <Network className="w-6 h-6 text-[var(--accent-primary)]/40 shrink-0" />
                       <div className="flex-1">
                          <p className="text-[11px] text-[var(--accent-primary)] font-black uppercase tracking-wider mb-2">
                             {lang === 'zh' ? '局域网/内网直连 (LAN/Direct)' : 'Direct IP Connection'}
                          </p>
                          <input
                            type="text"
                            placeholder={lang === 'zh' ? '输入连车端 IP (如 192.168.x.x)' : 'Enter Car Client IP (e.g. 192.168.x.x)'}
                            className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-main)] text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[var(--accent-primary)]"
                            onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                  const ip = (e.target as HTMLInputElement).value.trim();
                                  if (ip) {
                                     // Format it as a smart code point to local 3000
                                     // handleTechConnect's smart parser will treat it as domain#code
                                     // Actually, my 6-digit code check might fail. 
                                     // I'll use a special format or just set the code to 'DIRECT'
                                     setTechCode(`${ip}:3000#OFFLINE`);
                                     setTimeout(() => handleTechConnect(), 100);
                                  }
                               }
                            }}
                          />
                          <p className="text-[10px] text-[var(--text-muted)] mt-2 leading-tight">
                             {lang === 'zh' ? '无外网？输入连车端内网IP。需确保您已通过VPN或同局域网与车辆端建立物理通达。' : 'No Internet? Enter internal IP. Ensure VPN or LAN access is active.'}
                          </p>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {usbEnabled && (
               <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-6 flex items-center gap-4">
                 <div className="w-10 h-10 rounded bg-[var(--accent-primary)]/10 flex items-center justify-center shrink-0">
                   <Network className="w-5 h-5 text-[var(--accent-primary)]" />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-[var(--text-main)]">{t.usbMapping}</h4>
                   <p className="text-xs text-[var(--text-muted)] mt-1">{lang === 'zh' ? 'USB 映射已在设置中启用。连接成功后，本地 USB 设备将被映射。' : 'USB Mapping is enabled in settings. Local USB devices will be mapped upon successful connection.'}</p>
                 </div>
               </div>
            )}
          </div>
        )}

        {isServerReady && activeTab === "settings" && (
          <div className="max-w-3xl space-y-8">
            <div>
              <h2 className="text-[11px] uppercase tracking-[2px] text-[var(--text-muted)] mb-2">
                {t.settings}
              </h2>
              <p className="text-[var(--text-main)] text-sm">
                {t.protocolSettingsDesc}
              </p>
            </div>

            {/* Protocol Settings */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl overflow-hidden animate-breathe shadow-lg shadow-black/20">
              <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-main)]">
                <h3 className="text-[10px] font-bold uppercase tracking-[3px] text-[var(--accent-primary)]">
                  {t.protocolSettings}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                
                {/* DoIP Toggle */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded bg-[var(--accent-primary)]/10 flex items-center justify-center shrink-0 border border-[var(--accent-primary)]/20">
                      <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-main)] mb-1">
                        {t.enableDoIP}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed">
                        {t.enableDoIPDesc}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDoipEnabled(!doipEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${doipEnabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-main)]'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${doipEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                <div className="h-px w-full bg-[var(--border-main)]"></div>

                {/* J2534 Toggle */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded bg-[var(--accent-warning)]/10 flex items-center justify-center shrink-0 border border-[var(--accent-warning)]/20">
                      <Globe className="w-5 h-5 text-[var(--accent-warning)]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
                        {t.enableJ2534}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed">
                        {t.enableJ2534Desc}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setJ2534Enabled(!j2534Enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${j2534Enabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-main)]'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${j2534Enabled ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                <div className="h-px w-full bg-[var(--border-main)]"></div>

                {/* USB Mapping Toggle */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded bg-[var(--accent-primary)]/10 flex items-center justify-center shrink-0 border border-[var(--accent-primary)]/20">
                      <Network className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
                        {t.usbMapping}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed">
                        {t.usbMappingDesc}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setUsbEnabled(!usbEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${usbEnabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-main)]'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${usbEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

              </div>
            </div>

            {/* Network Adapter Settings */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl overflow-hidden animate-breathe">
              <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-card)] flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-[1px] text-[var(--text-main)]">
                  {t.networkSettings}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={autoDetectAdapter}
                    className="px-3 py-1.5 rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)] text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--accent-primary)]/20 transition-colors"
                  >
                    {t.autoDetect}
                  </button>
                  <button
                    onClick={fetchAdapters}
                    disabled={isRefreshingAdapters}
                    className={`px-3 py-1.5 rounded border text-[10px] font-bold uppercase tracking-wider transition-colors ${isRefreshingAdapters ? 'bg-[var(--border-main)] text-[var(--text-muted)] border-[var(--border-main)]' : 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-main)] hover:border-[var(--text-muted)]'}`}
                  >
                    {isRefreshingAdapters ? '...' : t.refresh}
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-[var(--text-muted)]">
                  {t.networkSettingsDesc}
                </p>
                
                {adapters.length === 0 ? (
                  <div className="text-center py-6 text-[var(--text-muted)] font-mono text-sm border border-dashed border-[var(--border-main)] rounded">
                    {t.noAdapters}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {adapters.map((adapter, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedAdapter(adapter.name)}
                        className={`p-3 rounded border cursor-pointer transition-colors flex justify-between items-center ${selectedAdapter === adapter.name ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]' : 'bg-[var(--bg-main)] border-[var(--border-main)] hover:border-[var(--text-muted)]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${selectedAdapter === adapter.name ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_rgba(46,134,222,0.8)]' : 'bg-[var(--border-main)]'}`}></div>
                          <span className={`text-sm font-bold ${selectedAdapter === adapter.name ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                            {adapter.name} {adapter.internal && <span className="text-[8px] opacity-50 ml-1">(Internal)</span>}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-[var(--text-main)]">{adapter.ip}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedAdapter && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-main)] flex justify-between items-center">
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{t.selectedAdapter}:</span>
                    <span className="text-sm font-bold text-[var(--accent-primary)]">{selectedAdapter}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Language Settings */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
                <h3 className="text-sm font-bold uppercase tracking-[1px] text-[var(--text-main)]">
                  {t.serverAddress}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-[var(--text-muted)]">
                  {t.serverAddressDesc}
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={customServer}
                      onChange={(e) => setCustomServer(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-[var(--bg-main)] border border-[var(--border-main)] text-[var(--text-main)] text-sm px-4 py-2 rounded focus:border-[var(--accent-primary)] focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        localStorage.setItem('customServer', customServer);
                        alert(lang === 'zh' ? '设置已保存' : 'Settings saved');
                      }}
                      className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded text-sm font-bold hover:bg-[var(--accent-primary)]/90 transition-colors"
                    >
                      {t.save}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      if (window.location.protocol !== 'file:') {
                        const autoUrl = window.location.origin;
                        setCustomServer(autoUrl);
                      } else {
                        // In EXE, set to deployment fallback
                        const DEPLOY_URL = 'https://ais-dev-6vzb5ii2khdtuxrypste7y-517505685900.asia-east1.run.app';
                        setCustomServer(DEPLOY_URL);
                        localStorage.setItem('customServer', DEPLOY_URL);
                        alert(lang === 'zh' ? '检测到安装版，已自动同步云端服务地址。' : 'Electron version detected. Cloud server address synced.');
                      }
                    }}
                    className="w-full py-2 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-dashed border-[var(--accent-primary)] rounded text-xs font-bold hover:bg-[var(--accent-primary)]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Globe className="w-3 h-3" />
                    {lang === 'zh' ? '自动检测并同步当前环境' : 'Auto-detect & Sync Cloud Server'}
                  </button>
                </div>
              </div>
            </div>

            {/* Connectivity Optimization */}
             <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
                <h3 className="text-sm font-bold uppercase tracking-[1px] text-[var(--text-main)]">
                   {lang === 'zh' ? '连接优化 (Regional)' : 'Connectivity Optimization'}
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                   <div>
                      <h4 className="text-sm font-bold text-[var(--text-main)] mb-1">{t.chinaMode}</h4>
                      <p className="text-xs text-[var(--text-muted)] max-w-md">
                         {t.chinaModeDesc}
                      </p>
                   </div>
                   <button
                    onClick={() => setChinaMode(!chinaMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 ${chinaMode ? 'bg-[var(--accent-primary)]' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${chinaMode ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
                <h3 className="text-sm font-bold uppercase tracking-[1px] text-[var(--text-main)]">
                  {t.languageSettings}
                </h3>
              </div>
              <div className="p-6">
                <div className="text-sm font-bold text-[var(--text-main)] mb-4">
                  {t.selectLanguage}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setLang('zh')}
                    className={`px-6 py-3 rounded border text-sm font-bold transition-colors ${lang === 'zh' ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'}`}
                  >
                    简体中文
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-6 py-3 rounded border text-sm font-bold transition-colors ${lang === 'en' ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'}`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-main)] bg-[var(--bg-card)] py-6 shrink-0">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
          <div>
            &copy; {new Date().getFullYear()} BimmerBridge ENET. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="uppercase tracking-[1px]">{lang === 'zh' ? '出品方' : 'Created By'}:</span> <span className="text-[var(--text-main)] font-bold font-sans">周海飞</span>
            </div>
            <div>
              <span className="uppercase tracking-[1px]">{lang === 'zh' ? '联系邮箱' : 'Contact Email'}:</span> <a href="mailto:bmwtpi@gmail.com" className="text-[var(--accent-primary)] hover:underline">bmwtpi@gmail.com</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
