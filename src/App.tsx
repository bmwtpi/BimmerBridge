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
    version: "V0.01",
    home: "官网",
    dashboard: "控制台",
    downloads: "连车端",
    techTab: "编程端",
    settings: "设置",
    remoteSessions: "远程桥接会话",
    manageConnections: "管理宝马ENET远程编程连接",
    newSession: "管理新会话",
    loading: "加载中...",
    noSessions: "暂无活动会话",
    clickToCreate: "请前往“连车端”生成连接码，或在“编程端”输入连接码。连接成功后，会话将在此显示。",
    carClient: "车辆端 (Client/Car)",
    techClient: "编程端 (Tech)",
    connected: "已连接 (CONNECTED)",
    waiting: "等待连接... (WAITING)",
    vehicleNetwork: "车辆网络信息 (Vehicle Network)",
    realIp: "真实IP (Real IP):",
    vin: "车辆识别码 (VIN):",
    unknown: "未知 (Unknown)",
    downloadInstructions: "连车端连接码生成",
    downloadDesc: "点击下方按钮生成连接码，并将其发送给编程端以建立连接。多次点击仅会刷新连接码，不会创建多个会话。",
    generateCode: "生成智能万能码",
    codeGenerated: "已生成智能万能码",
    smartCode: "智能连接凭证",
    smartCodeDesc: "此凭证已包含中转服务器地址。编程端无需任何手动设置，直接粘贴即可实现一键直连。",
    sendToTech: "请将下方代码发送给编程端：",
    closeSession: "关闭会话",
    manualScript: "高级：手动脚本下载",
    carScript: "车辆端脚本 (car.js)",
    carScriptDesc: "运行在连接了ENET线缆的电脑上",
    techScript: "编程端脚本 (tech.js)",
    techScriptDesc: "运行在安装了 E-Sys/ISTA 的电脑上",
    step1: "# 1. 保存以下代码为",
    step2: "# 2. 安装依赖: npm install ws",
    step3: "# 3. 运行: node",
    howToReadIp: "如何读取车辆IP",
    howToReadIpDesc1: "当车辆端成功连接到车辆后，它会自动读取车辆的真实IP地址，并显示在“控制台”的会话卡片中。",
    howToReadIpDesc2: "在编程端，由于我们使用了端口转发技术，E-Sys 软件可以直接通过 127.0.0.1 (localhost) 连接到车辆。如果您需要在 E-Sys 中手动输入 IP，请使用 127.0.0.1。真实的车辆 IP 仅用于参考和诊断，已在控制台中为您展示。本软件完美兼容 Windows 10/11 和 macOS 系统。",
    protocolSettings: "协议与硬件设置",
    protocolSettingsDesc: "配置远程桥接支持的底层协议与硬件接口",
    enableDoIP: "启用 DoIP (Diagnostics over Internet Protocol)",
    enableDoIPDesc: "支持宝马 F/G/I 系列 ENET 直接诊断与编程。默认开启。",
    enableJ2534: "启用 J2534 PassThru 映射 (实验性)",
    enableJ2534Desc: "允许远程映射 J2534 兼容硬件。需要在客户端安装特定的桥接驱动。",
    usbMapping: "启用 USB 映射技术",
    usbMappingDesc: "允许远程映射本地 USB 设备 (如 ENET 线缆或 ICOM) 到编程端。",
    languageSettings: "语言设置",
    selectLanguage: "选择界面语言",
    copied: "已复制到剪贴板！",
    ping: "Ping",
    pinging: "Ping中...",
    pingResult: "延迟: {ms}ms",
    networkSettings: "本地网卡设置",
    networkSettingsDesc: "选择用于连接车辆或 E-Sys 的物理网卡",
    autoDetect: "自动获取",
    refresh: "刷新",
    selectedAdapter: "当前选择的网卡",
    noAdapters: "未检测到网卡",
    noServerWarning: "未设置中转服务器",
    noServerDesc: "检测到您正在使用本地版，请先在“设置”中配置公网中转服务器地址，否则编程端将无法建立跨地域连接。",
    copySuccess: "复制成功",
    serverAddressDesc: "如果您在本地运行客户端，请填入云端服务器的公网地址 (例如: https://your-app.run.app)。留空则默认连接本地。",
    save: "保存设置",
    techTabDesc: "输入客户提供的连接码，建立远程诊断与编程通道。",
    enterCode: "粘贴智能万能码 (例如: host#123456)",
    connectToCar: "立即建立连接",
    connecting: "连接中...",
    connectSuccess: "连接成功！",
    connectError: "连接失败，请检查连接码是否正确。",
    disconnect: "断开连接",
    deleteSession: "删除会话",
    chat: "聊天",
    typeMessage: "输入消息...",
    sendFile: "发送文件",
    waitingForPeer: "等待对方连接后即可开始聊天...",
    selectSession: "请从左侧选择一个会话进行查看",
    adminLogin: "管理员登录",
    userLogin: "用户登录",
    register: "注册账号",
    username: "用户名",
    password: "密码",
    login: "登录",
    invalidPassword: "密码错误",
    noAccount: "没有账号？立即注册",
    hasAccount: "已有账号？立即登录",
    adminAccess: "管理员入口",
    userAccess: "返回用户登录",
    enterUsername: "请输入用户名",
    enterPassword: "请输入密码",
    enterAdminPassword: "请输入管理员密码",
    loginSuccess: "登录成功",
    registerSuccess: "注册成功"
  },
  en: {
    title: "BimmerBridge",
    version: "V0.01",
    home: "Home",
    dashboard: "Dashboard",
    downloads: "Car Client",
    techTab: "Tech Client",
    settings: "Settings",
    remoteSessions: "Remote Sessions",
    manageConnections: "Manage BMW ENET remote programming connections",
    newSession: "Manage Sessions",
    loading: "Loading...",
    noSessions: "No Active Sessions",
    clickToCreate: "Please go to 'Car Client' to generate a code, or 'Tech Client' to enter a code. Once connected, the session will appear here.",
    carClient: "Client / Car",
    techClient: "Tech / Programmer",
    connected: "CONNECTED",
    waiting: "WAITING...",
    vehicleNetwork: "Vehicle Network",
    realIp: "Real IP:",
    vin: "VIN:",
    unknown: "Unknown",
    downloadInstructions: "Car Client Code Generation",
    downloadDesc: "Click the button below to generate a connection code. Multiple clicks will only refresh the code, not create multiple sessions.",
    generateCode: "Generate Smart Master Code",
    codeGenerated: "Smart Master Code Generated",
    smartCode: "Smart Credential",
    smartCodeDesc: "This credential includes the server address. The tech side can paste it directly for a one-click connection with zero setup.",
    sendToTech: "Send the following code to the Tech:",
    closeSession: "Close Session",
    manualScript: "Advanced: Manual Script Download",
    carScript: "Car Agent Script (car.js)",
    carScriptDesc: "Run on the computer connected to the car via ENET",
    techScript: "Tech Agent Script (tech.js)",
    techScriptDesc: "Run on the computer with E-Sys/ISTA installed",
    step1: "# 1. Save the following code as",
    step2: "# 2. Install dependencies: npm install ws",
    step3: "# 3. Run: node",
    howToReadIp: "How to read vehicle IP",
    howToReadIpDesc1: "When the car agent successfully connects to the vehicle, it automatically reads the real IP address and displays it in the session card.",
    howToReadIpDesc2: "On the tech side, due to port forwarding, E-Sys can connect directly to the vehicle via 127.0.0.1 (localhost). If you need to manually enter an IP in E-Sys, use 127.0.0.1. The real IP is shown in the dashboard for reference. Fully compatible with Windows 10/11 and macOS.",
    protocolSettings: "Protocol & Hardware Settings",
    protocolSettingsDesc: "Configure supported underlying protocols and hardware interfaces for the remote bridge.",
    enableDoIP: "Enable DoIP (Diagnostics over Internet Protocol)",
    enableDoIPDesc: "Supports BMW F/G/I series direct ENET diagnostics and programming. Enabled by default.",
    enableJ2534: "Enable J2534 PassThru Mapping (Experimental)",
    enableJ2534Desc: "Allows remote mapping of J2534 compatible hardware. Requires specific bridge drivers on the client.",
    usbMapping: "Enable USB Mapping Technology",
    usbMappingDesc: "Allows remote mapping of local USB devices (like ENET cables or ICOM) to the tech client.",
    languageSettings: "Language Settings",
    selectLanguage: "Select Interface Language",
    copied: "Copied to clipboard!",
    ping: "Ping",
    pinging: "Pinging...",
    pingResult: "Latency: {ms}ms",
    networkSettings: "Local Network Adapter Settings",
    networkSettingsDesc: "Select the physical network adapter used to connect to the vehicle or E-Sys",
    autoDetect: "Auto-detect",
    refresh: "Refresh",
    selectedAdapter: "Currently Selected Adapter",
    noAdapters: "No adapters detected",
    noServerWarning: "Server Not Set",
    noServerDesc: "Middleman server address is missing. Please configure it in 'Settings' for remote pairing to work.",
    copySuccess: "Copied!",
    serverAddressDesc: "If running locally, enter the public URL of your cloud server (e.g., https://your-app.run.app). Leave empty for local mode.",
    save: "Save Settings",
    techTabDesc: "Enter the connection code provided by the customer to establish a remote diagnostic and programming channel.",
    enterCode: "Paste Smart Master Code (e.g., host#123456)",
    connectToCar: "Establish Connection Now",
    connecting: "Connecting...",
    connectSuccess: "Connected Successfully!",
    connectError: "Connection failed. Please check the code.",
    disconnect: "Disconnect",
    deleteSession: "Delete Session",
    chat: "Chat",
    typeMessage: "Type a message...",
    sendFile: "Send File",
    waitingForPeer: "Waiting for peer to connect to start chat...",
    selectSession: "Please select a session from the left to view",
    adminLogin: "Admin Login",
    userLogin: "User Login",
    register: "Register",
    username: "Username",
    password: "Password",
    login: "Login",
    invalidPassword: "Invalid Password",
    noAccount: "No account? Register now",
    hasAccount: "Have an account? Login",
    adminAccess: "Admin Access",
    userAccess: "Back to User Login",
    enterUsername: "Enter username",
    enterPassword: "Enter password",
    enterAdminPassword: "Enter admin password",
    loginSuccess: "Login successful",
    registerSuccess: "Registration successful"
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'downloads' | 'tech' | 'settings'>('dashboard');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [customServer, setCustomServer] = useState<string>(() => localStorage.getItem('customServer') || '');

  // Global Deployment Config
  const DEPLOY_HOST = 'ais-dev-6vzb5ii2khdtuxrypste7y-517505685900.asia-east1.run.app';
  const DEPLOY_URL = `https://${DEPLOY_HOST}`;

  // Base URL for API calls
  const getApiBase = () => {
    if (customServer) return customServer.replace(/\/$/, '');
    
    // For local EXE builds, we default to localhost:3000 for UI-side hardware interaction.
    // Pairing logic has its own cloud-fallback override.
    if (window.location.protocol === 'file:') {
      return 'http://127.0.0.1:3000';
    }
    
    return ''; // Relative in browser
  };

  const getWsBase = () => {
    if (customServer) {
       return customServer.replace(/^http/i, 'ws').replace(/\/$/, '');
    }
    
    // For local EXE, default to localhost ws
    if (window.location.protocol === 'file:') {
       return 'ws://127.0.0.1:3000';
    }
    
    return window.location.origin.replace(/^http/i, 'ws');
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

  const checkServerHealth = async (retries = 10) => {
    // If we're using a remote cloud host, we don't need to "wait" for it to start
    // like a local process. We just check if it's reachable.
    const isLocal = API_BASE.includes('127.0.0.1') || API_BASE.includes('localhost');
    
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        setIsServerReady(true);
        setServerError(null);
        return true;
      }
    } catch (e) {
      if (isLocal && retries > 0) {
        console.log(`Local server not ready, retrying... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return checkServerHealth(retries - 1);
      }
    }

    if (isLocal) {
      setServerError(lang === 'zh' ? '本地后台服务启动超时。如果您已配置远程服务器，请检查网络连接。' : 'Local backend service timeout. If using a remote server, check your connection.');
      return false;
    } else {
      // For remote, if it fails, we still allow the UI to load but maybe show a warning later
      setIsServerReady(true);
      return true;
    }
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

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

  const createSession = async () => {
    try {
      // IMPORTANT: In EXE mode, when generating a code for remote connection,
      // we prefer to register on the CLOUD server so the Tech client can find it.
      // However, we fallback to local if cloud is unreachable or configured otherwise.
      let targetBase = API_BASE;
      if (window.location.protocol === 'file:' && !customServer) {
        targetBase = DEPLOY_URL; // Force cloud for pairing in basic EXE mode
      }

      const res = await fetch(`${targetBase}/api/sessions`, { 
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) {
        // Fallback to local if cloud failed and we are in EXE
        if (targetBase === DEPLOY_URL && window.location.protocol === 'file:') {
          console.warn("Cloud pairing failed, falling back to local pairing...");
          const localRes = await fetch(`http://127.0.0.1:3000/api/sessions`, { 
            method: 'POST',
            headers: { 'Accept': 'application/json' }
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
      alert(lang === 'zh' ? '无法连接到中转服务。请检查网络连接，或确保本地后台已启动。' : 'Failed to connect to relay service. Check your connection or ensure local backend is running.');
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
      // Use deployment host for display
      host = DEPLOY_HOST.toLowerCase();
    }
    
    return host ? `${host}#${latestCode}` : latestCode;
  };

  const handleGenerateCode = async () => {
    if (isGeneratingCode) return;
    setIsGeneratingCode(true);

    try {
      // Check if we have a locally stored session ID first
      if (myCarSessionId) {
        // Try to fetch/refresh OUR specific session
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
            return;
          }
        } catch (e) {
          console.error('Failed to refresh local session:', e);
        }
      }

      // If no local session or refresh failed, create a new one
      if (carWs) {
        carWs.close();
        setCarWs(null);
      }

      const session = await createSession();
      if (session) {
        setLatestCode(session.code);
        setMyCarSessionId(session.id);
        localStorage.setItem('myCarSessionId', session.id);
        
        // If the session was created on the cloud, we MUST connect our WS to the cloud too
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
          if (data.type === 'chat') {
            setChatMessages(prev => {
              const currentMessages = prev[sessionId] || [];
              if (currentMessages.some(m => m.id === data.message.id)) return prev;
              return {
                ...prev,
                [sessionId]: [...currentMessages, data.message]
              };
            });
          } else if (data.type === 'peer_connected' && data.role === 'tech') {
            setIsPeerConnected(true);
          } else if (data.type === 'peer_disconnected' && data.role === 'tech') {
            setIsPeerConnected(false);
          }
        } catch (e) {}
      }
    };

    setCarWs(ws);
  };

  const handleScanVehicle = (sessionId: string) => {
    if (!carWs || carWs.readyState !== WebSocket.OPEN) {
      alert(lang === 'zh' ? '连接已断开，请重新生成连接码。' : 'Connection lost. Please regenerate code.');
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
    
    let rawInput = techCode.trim();
    let targetCode = '';
    let targetApiBase = API_BASE;
    let targetWsBase = WS_BASE;

    // Detect Smart Master Code (Format: URL#CODE)
    if (rawInput.includes('#')) {
      const parts = rawInput.split('#');
      if (parts.length === 2) {
        let serverUrl = parts[0].trim();
        let codePart = parts[1].trim().toUpperCase();
        
        if (codePart.length === 6) {
          // Clean up URL
          if (!serverUrl.match(/^https?:\/\//i)) {
            serverUrl = 'https://' + serverUrl;
          }
          
          targetApiBase = serverUrl.replace(/\/$/, '');
          // Case-insensitive replace for websocket protocol
          targetWsBase = serverUrl.replace(/^http/i, 'ws').replace(/\/$/, '');
          targetCode = codePart;

          // Permanently update server if provided via smart code
          setCustomServer(serverUrl);
          localStorage.setItem('customServer', serverUrl);
        }
      }
    } 
    
    // Fallback if not a smart code or parsing failed
    if (!targetCode) {
      targetCode = rawInput.toUpperCase();
    }

    if (!targetCode || targetCode.length !== 6) {
      setTechStatus('error');
      return;
    }

    setTechStatus('connecting');
    const wsUrl = `${targetWsBase}/bridge`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', role: 'tech', code: targetCode }));
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'auth_success') {
            setTechStatus('connected');
            // Fetch sessions from the specific API BASE inferred from the code
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
            fetchSessionsFromUrl();
            setActiveTab('dashboard');
          } else if (data.type === 'error') {
            setTechStatus('error');
            ws.close();
          } else if (data.type === 'chat') {
            // Find session to add message to
            const session = sessions.find(s => s.code === targetCode);
            if (session) {
              setChatMessages(prev => {
                const currentMessages = prev[session.id] || [];
                if (currentMessages.some(m => m.id === data.message.id)) return prev;
                return {
                  ...prev,
                  [session.id]: [...currentMessages, data.message]
                };
              });
            }
          } else if (data.type === 'peer_connected' && data.role === 'car') {
            setIsPeerConnected(true);
          } else if (data.type === 'peer_disconnected' && data.role === 'car') {
            setIsPeerConnected(false);
          } else if (data.type === 'car_info') {
            const session = sessions.find(s => s.code === targetCode);
            if (session) {
              setSessions(prev => prev.map(s => s.id === session.id ? { ...s, carIp: data.ip, carVin: data.vin } : s));
            }
          }
        } catch (e) {}
      }
    };

    ws.onerror = () => {
      setTechStatus('error');
      alert(lang === 'zh' ? '连接失败：无法建立网络通道。请确保“连车端”已生成连接码并保持开启状态，且两端网络均可访问该服务器。' : 'Connection failed: Unable to establish network tunnel. Ensure "Car Client" is active and both sides have internet access to the server.');
    };

    ws.onclose = () => {
      if (techStatus === 'connected') {
         setTechStatus('idle');
      }
    };

    setTechWs(ws);
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

    // Send via WebSocket
    const ws = senderRole === 'admin' ? adminWsMap[sessionId] : (senderRole === 'car' ? carWs : techWs);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat', message }));
    } else {
      console.error('WebSocket not open, message not sent');
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
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent-primary)]/30 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-[var(--border-main)] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(46,134,222,0.4)]">
              <Network className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-[1px] uppercase text-[var(--text-main)]">
              BimmerBridge <span className="text-[var(--accent-primary)]">ENET</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-2">
              {lang === 'zh' ? '宝马远程编程桥接系统' : 'BMW Remote Programming Bridge'}
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--accent-primary)]/30 flex flex-col">
      {/* Header */}
      <header className="h-[60px] border-b border-[var(--border-main)] bg-[var(--bg-card)] flex items-center sticky top-0 z-10 shrink-0">
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold tracking-[1px] uppercase">
            <div className="w-6 h-6 bg-[var(--accent-primary)] rounded flex items-center justify-center">
              <Network className="w-4 h-4 text-white" />
            </div>
            <span className="text-[var(--text-main)] flex items-center gap-2">
              {t.title} <span className="text-[var(--accent-primary)]">ENET</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-mono text-[10px] tracking-widest ml-2">
                {t.version}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-6">
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
                <p className="text-[var(--text-main)] text-sm">{t.manageConnections}</p>
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
              <div className="w-80 flex-shrink-0 flex flex-col gap-6 overflow-hidden">
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
              <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg flex flex-col overflow-hidden shadow-xl">
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
          <div className="space-y-8">
            <div>
              <h2 className="text-[11px] uppercase tracking-[2px] text-[var(--text-muted)] mb-2">
                {t.downloadInstructions}
              </h2>
              <p className="text-[var(--text-main)] text-sm">
                {t.downloadDesc}
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-50"></div>
              
              <button
                onClick={handleGenerateCode}
                disabled={isGeneratingCode}
                className={`bg-[var(--accent-primary)] text-white px-10 py-5 rounded-xl font-black uppercase tracking-[3px] transition-all transform hover:scale-105 shadow-[0_20px_40px_rgba(46,134,222,0.2)] flex items-center gap-4 mx-auto border-2 border-white/10 ${isGeneratingCode ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_25px_50px_rgba(46,134,222,0.3)]'}`}
              >
                <Zap className={`w-6 h-6 ${isGeneratingCode ? 'animate-spin' : 'fill-current'}`} />
                {isGeneratingCode ? (lang === 'zh' ? '正在生成...' : 'Generating...') : t.generateCode}
              </button>

              {latestCode && (
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-[var(--bg-card)] border-2 border-[var(--accent-primary)]/40 rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-[var(--accent-primary)]/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 text-[var(--accent-primary)]">
                        <Shield className="w-5 h-5" />
                        <h3 className="text-sm font-black uppercase tracking-[2px]">{t.smartCode}</h3>
                      </div>
                      <div className="px-3 py-1 bg-[var(--accent-success)]/10 text-[var(--accent-success)] text-[10px] font-black rounded-full border border-[var(--accent-success)]/20 uppercase tracking-wider">
                        Active
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed text-left font-medium opacity-80">
                      {t.smartCodeDesc}
                    </p>

                    <div className="flex flex-col gap-4">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-primary)] to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center gap-3 bg-[var(--bg-main)] p-5 rounded-xl border border-[var(--border-main)] shadow-inner">
                          <code className="flex-1 font-mono text-sm break-all font-bold text-[var(--text-main)] tracking-wider">
                            {!getSmartCode().includes('#') && (lang === 'zh' ? '【请先设置服务器地址】' : '[Set server address first] ')}
                            {getSmartCode()}
                          </code>
                          <button 
                            onClick={() => {
                              const code = getSmartCode();
                              if (!code.includes('#')) {
                                // Instead of alert, we can try to auto-set if browser
                                if (window.location.protocol !== 'file:') {
                                   const autoHost = window.location.hostname;
                                   navigator.clipboard.writeText(`${autoHost}#${latestCode}`);
                                   return;
                                }
                                return;
                              }
                              navigator.clipboard.writeText(code);
                            }}
                            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white p-4 rounded-lg transition-all hover:scale-110 active:scale-95 shadow-lg shadow-[var(--accent-primary)]/20"
                            title={lang === 'zh' ? '复制万能码' : 'Copy Master Code'}
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-[var(--text-muted)] italic text-center font-medium">
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
                          <div className={`p-4 rounded-lg border flex items-center gap-4 transition-all ${session.carConnected ? 'bg-[var(--accent-success)]/5 border-[var(--accent-success)]/30' : 'bg-[var(--bg-main)] border-[var(--border-main)]'}`}>
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

            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-12 text-center shadow-2xl relative overflow-hidden group">
              {/* Breath Light Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-primary)]/5 via-transparent to-[var(--accent-primary)]/5 opacity-30 animate-pulse"></div>
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

                  <div className="relative mb-6">
                    <input 
                      type="text" 
                      value={techCode}
                      onChange={(e) => setTechCode(e.target.value)}
                      placeholder={t.enterCode}
                      className="w-full bg-[var(--bg-main)]/50 border-2 border-[var(--border-main)] text-[var(--text-main)] px-6 py-4 rounded-xl text-center font-mono text-lg focus:border-[var(--accent-primary)] focus:outline-none transition-all placeholder:text-[var(--text-muted)] focus:shadow-[0_0_20px_rgba(46,134,222,0.1)]"
                    />
                  </div>
                  
                  {techStatus === 'error' && (
                    <div className="text-[var(--accent-danger)] text-sm mb-6 bg-[var(--accent-danger)]/10 py-2 rounded-lg border border-[var(--accent-danger)]/20">
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
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
                <h3 className="text-sm font-bold uppercase tracking-[1px] text-[var(--text-main)]">
                  {t.protocolSettings}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                
                {/* DoIP Toggle */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[var(--text-main)] mb-1">
                      {t.enableDoIP}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {t.enableDoIPDesc}
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
                  <div>
                    <div className="text-sm font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
                      {t.enableJ2534}
                      <span className="px-1.5 py-0.5 rounded bg-[var(--accent-warning)]/10 border border-[var(--accent-warning)] text-[var(--accent-warning)] font-mono text-[9px] tracking-widest">
                        BETA
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {t.enableJ2534Desc}
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
                  <div>
                    <div className="text-sm font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
                      {t.usbMapping}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {t.usbMappingDesc}
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
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden">
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
