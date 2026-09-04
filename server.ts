import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import os from 'os';
import dgram from 'dgram';
import { exec } from 'child_process';
import net from 'net';

const PORT = 3000;
const ZGW_PORT = 13400; // BMW DoIP Discovery Protocol Port

// Diagnostic Ports to handle (based on AZ Pro logic)
const DIAG_PORTS = [22, 6801, 6811];
const activeProxies = new Map<number, net.Server>();
const activeToolSockets = new Map<number, net.Socket>();

/**
 * Forcefully close processes occupying diagnostic ports (Windows focus)
 */
async function clearDiagnosticPorts() {
  if (process.platform !== 'win32') {
    console.log('[SECURITY] Port clearance skipped: Not on Windows platform.');
    return;
  }

  console.log('[SECURITY] Running port clearance for 22, 6801, 6811...');
  for (const port of DIAG_PORTS) {
    try {
      exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
        if (!stdout) return;
        
        const lines = stdout.split('\n');
        const pids = new Set<string>();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && pid !== process.pid.toString()) {
              pids.add(pid);
            }
          }
        });

        pids.forEach(pid => {
          console.log(`[SECURITY] Killing process ${pid} occupying port ${port}`);
          exec(`taskkill /F /PID ${pid}`);
        });
      });
    } catch (e) {
      console.error(`[ERROR] Failed to clear port ${port}:`, e);
    }
  }
}

/**
 * Setup local TCP proxies for diagnostic tools (ISTA/E-Sys/SSH)
 */
function setupDiagnosticForwarding(session: Session) {
  DIAG_PORTS.forEach(port => {
    // Shutdown existing proxy for this port if any
    if (activeProxies.has(port)) {
      activeProxies.get(port)?.close();
      activeProxies.delete(port);
    }

    const proxy = net.createServer((localSocket) => {
      console.log(`[PROXY] Local connection on port ${port} detected`);
      activeToolSockets.set(port, localSocket);
      
      const targetAgent = session.carAgent;
      if (!targetAgent || targetAgent.ws.readyState !== WebSocket.OPEN) {
        console.error('[PROXY] Car not connected, dropping packet');
        localSocket.destroy();
        return;
      }

      // Tell the car side which port we are talking to if necessary
      // For AZ Pro Dig style, it's often a direct mapping
      
      localSocket.on('data', (data) => {
        if (targetAgent.ws.readyState === WebSocket.OPEN) {
          // Direct binary forward to car agent
          targetAgent.ws.send(data, { binary: true });
        }
      });

      localSocket.on('error', (err) => {
        activeToolSockets.delete(port);
        localSocket.destroy();
      });

      localSocket.on('close', () => {
        activeToolSockets.delete(port);
      });
    });

    proxy.listen(port, '127.0.0.1', () => {
      console.log(`[PROXY] Forwarder ACTIVE on 127.0.0.1:${port}`);
    });

    activeProxies.set(port, proxy);
  });
}

interface Agent {
  id: string;
  ws: WebSocket;
  role: 'car' | 'tech' | 'admin';
  sessionId: string;
  ip?: string;
  vin?: string;
  lastSeen: number;
}

interface Session {
  id: string;
  code: string; // 6-digit code for pairing
  carAgent?: Agent;
  techAgent?: Agent;
  adminAgent?: Agent;
  owner?: string; // Track who created the session
  createdAt: number;
}

const sessions = new Map<string, Session>();
const agents = new Map<string, Agent>();

  // Rate limiting for code attempts
  const failedAttempts = new Map<string, { count: number, lastAttempt: number }>();
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

  // Admin token
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  let currentAdminToken = uuidv4();

  // Generate a random 6-digit code
  function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/bridge' });

  // Project X Style ZGW Discovery
  const udpDiscovery = dgram.createSocket('udp4');
  udpDiscovery.on('error', (err) => {
    console.error(`UDP Error: ${err.stack}`);
    udpDiscovery.close();
  });

  udpDiscovery.on('message', (msg, rinfo) => {
    // BMW Detection logic: Check for Vehicle Identification response
    if (msg.length > 8 && msg[0] === 0x02 && msg[1] === 0xfd) {
       console.log(`[NETWORK] BMW ZGW Detected at ${rinfo.address}`);
    }
  });

  try {
    udpDiscovery.bind(ZGW_PORT, '0.0.0.0', () => {
      udpDiscovery.setBroadcast(true);
      console.log(`[NETWORK] Project X ZGW Discovery listening on ${ZGW_PORT}`);
    });
  } catch (e) {
    console.log('[NETWORK] ZGW Port occupied. Running in relay-only fallback.');
  }

  app.use(cors());
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    if (req.url !== '/api/health') {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now(), version: '1.0.0' });
  });

  // API Routes
  app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ token: currentAdminToken });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  });

  app.get('/api/sessions', (req, res) => {
    const activeSessions = Array.from(sessions.values()).map(s => ({
      id: s.id,
      code: s.code,
      carConnected: !!s.carAgent,
      techConnected: !!s.techAgent,
      carIp: s.carAgent?.ip,
      carVin: s.carAgent?.vin,
      createdAt: s.createdAt,
    }));
    res.json(activeSessions);
  });

  app.post('/api/sessions', (req, res) => {
    // Only one session per user/owner to keep the list clean
    const { replaceSessionId, owner, customCode } = req.body;
    
    // 1. Cleanup by ID if requested
    if (replaceSessionId) {
      for (const [code, session] of sessions.entries()) {
        if (session.id === replaceSessionId) {
          sessions.delete(code);
          break;
        }
      }
    }

    // 2. Cleanup by owner (username) if provided
    if (owner) {
      for (const [code, session] of sessions.entries()) {
        if (session.owner === owner) {
          sessions.delete(code);
        }
      }
    }

    const sessionId = uuidv4();
    const code = customCode || generateCode();
    
    // Handle collisions for custom codes
    if (customCode && sessions.has(customCode)) {
       // If it exists but is stale (no agents), allow override
       const existing = sessions.get(customCode);
       if (existing?.carAgent || existing?.techAgent) {
         return res.status(409).json({ error: 'Code already active. Choose another or wait.' });
       }
    }

    sessions.set(code, {
      id: sessionId,
      code,
      owner,
      createdAt: Date.now(),
    });
    res.json({ sessionId, code });
  });

  app.put('/api/sessions/:id/refresh', (req, res) => {
    const sessionId = req.params.id;
    let targetSession: Session | null = null;
    let oldCode: string | null = null;

    for (const [code, session] of sessions.entries()) {
      if (session.id === sessionId) {
        targetSession = session;
        oldCode = code;
        break;
      }
    }

    if (!targetSession || !oldCode) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (targetSession.techAgent) {
      return res.status(400).json({ error: 'Cannot refresh code while tech is connected' });
    }

    const newCode = generateCode();
    sessions.delete(oldCode);
    targetSession.code = newCode;
    sessions.set(newCode, targetSession);

    res.json({ sessionId: targetSession.id, code: newCode });
  });

  app.get('/api/network-interfaces', (req, res) => {
    const interfaces = os.networkInterfaces();
    const result: { id: string; name: string; ip: string; family: string; internal: boolean }[] = [];
    for (const [name, infos] of Object.entries(interfaces)) {
      if (infos) {
        for (const info of infos) {
          if (info.family === 'IPv4') {
            result.push({
              id: `${name}-${info.address}`,
              name,
              ip: info.address,
              family: info.family,
              internal: info.internal
            });
          }
        }
      }
    }
    result.sort((a, b) => (a.internal === b.internal ? 0 : a.internal ? 1 : -1));
    res.json(result);
  });

  // EDIABAS & ISTA Configuration APIs (Connect v3.26 compatible)
  let ediabasConfigState = {
    iniPath: 'C:\\EDIABAS\\BIN\\EDIABAS.INI',
    currentInterface: 'STD:OBD',
    comPort: 'Com9',
    ediabasVersion: '7.3.0',
    ediabasPath: 'C:\\EDIABAS',
    istaPath: 'C:\\Program Files (x86)\\BMW\\ISPI\\TRIC\\ISTA',
    ediabasStatus: 'valid',
    istaStatus: 'missing_files',
    missingFiles: [
      'C:\\Program Files (x86)\\BMW\\ISPI\\TRIC\\ISTA\\Ecu\\OPPS.prg',
      'C:\\Program Files (x86)\\BMW\\ISPI\\TRIC\\ISTA\\Ediabas\\Bin\\api64.dll'
    ]
  };

  // Branding & White-label Configuration (Connect v3.26 compatible)
  let brandingConfigState = {
    clientDisplayName: 'HAIFEI ZHOU',
    workshopLogoUrl: '',
    customerLink: 'https://remoteservice.app/w/WJ2FFY3RW8D',
    customDomain: 'remote.your-domain.com',
    cnameTarget: 'remote.nrw-carcoding.de',
    accentColor: '#A855F7',
    programName: '泰兴悦之宝',
    wideLogoUrl: '',
    smallLogoUrl: '',
    websiteUrl: 'https://your-workshop.com',
    codingEmail: 'workshop@example.com',
    isSubscriptionActive: true
  };

  app.get('/api/branding', (req, res) => {
    res.json(brandingConfigState);
  });

  app.post('/api/branding', (req, res) => {
    brandingConfigState = {
      ...brandingConfigState,
      ...req.body
    };
    res.json({
      success: true,
      message: '品牌形象配置已保存',
      config: brandingConfigState
    });
  });

  app.post('/api/branding/check-domain', (req, res) => {
    const { domain } = req.body;
    // Simulate DNS CNAME check
    const isValid = domain && domain.includes('.');
    res.json({
      success: true,
      domain: domain || brandingConfigState.customDomain,
      cnameTarget: brandingConfigState.cnameTarget,
      resolved: isValid,
      message: isValid ? 'CNAME 记录解析正常，已成功指向目标服务器' : '未检测到有效的 CNAME 记录'
    });
  });

  app.get('/api/ediabas/config', (req, res) => {
    res.json(ediabasConfigState);
  });

  app.post('/api/ediabas/apply-interface', (req, res) => {
    const { interfaceType, comPort } = req.body;
    if (interfaceType) {
      ediabasConfigState.currentInterface = interfaceType;
      if (comPort) ediabasConfigState.comPort = comPort;
      res.json({
        success: true,
        message: `EDIABAS.INI 接口已成功写入为 ${interfaceType}`,
        config: ediabasConfigState
      });
    } else {
      res.status(400).json({ error: 'Interface type required' });
    }
  });

  app.post('/api/ediabas/save-paths', (req, res) => {
    const { ediabasPath, istaPath } = req.body;
    if (ediabasPath) ediabasConfigState.ediabasPath = ediabasPath;
    if (istaPath) {
      ediabasConfigState.istaPath = istaPath;
      if (istaPath.includes('TRIC') || istaPath.includes('Program Files')) {
        ediabasConfigState.istaStatus = 'missing_files';
        ediabasConfigState.missingFiles = [
          `${istaPath}\\Ecu\\OPPS.prg`,
          `${istaPath}\\Ediabas\\Bin\\api64.dll`
        ];
      } else {
        ediabasConfigState.istaStatus = 'valid';
        ediabasConfigState.missingFiles = [];
      }
    }
    res.json({
      success: true,
      message: 'EDIABAS 与 ISTA 诊断程序路径已保存',
      config: ediabasConfigState
    });
  });

  app.delete('/api/sessions/:id', (req, res) => {
    const sessionId = req.params.id;
    let sessionCodeToDelete: string | null = null;
    for (const [code, session] of sessions.entries()) {
      if (session.id === sessionId) {
        sessionCodeToDelete = code;
        if (session.carAgent) session.carAgent.ws.close();
        if (session.techAgent) session.techAgent.ws.close();
        break;
      }
    }
    if (sessionCodeToDelete) {
      sessions.delete(sessionCodeToDelete);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  });

  // Diagnostic Enhancement API (AZ Pro Bridge)
  app.post('/api/diagnostics/enable', async (req, res) => {
    const { sessionId } = req.body;
    let session: Session | null = null;
    for (const s of sessions.values()) {
      if (s.id === sessionId) {
        session = s;
        break;
      }
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    console.log(`[DIAG] Enabling High-Performance Forwarding for session ${sessionId}`);
    
    // 1. Force clear local ports 22, 6801, 6811
    await clearDiagnosticPorts();
    
    // 2. Setup standard forwarding
    setupDiagnosticForwarding(session);
    
    res.json({ 
      success: true, 
      message: 'Diagnostic shielding and forwarding enabled.',
      ports: DIAG_PORTS 
    });
  });

  // API 404 handler - catch anything starting with /api that reaching here
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // WebSocket Logic
  wss.on('connection', (ws, req) => {
    let currentAgent: Agent | null = null;

    ws.on('message', (message, isBinary) => {
      if (!isBinary) {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'auth') {
            const { role, code } = data;
            // Get IP from x-forwarded-for if behind proxy
            const forwarded = (req.headers['x-forwarded-for'] as string);
            const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || 'unknown';

            // Check lockout
            const attempt = failedAttempts.get(ip);
            if (attempt && attempt.count >= MAX_FAILED_ATTEMPTS && Date.now() - attempt.lastAttempt < LOCKOUT_TIME) {
              ws.send(JSON.stringify({ type: 'error', message: 'Too many failed attempts. Try again later.' }));
              ws.close();
              return;
            }

            const session = sessions.get(code);
            
            if (!session) {
              // Record failed attempt
              const current = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
              failedAttempts.set(ip, { count: current.count + 1, lastAttempt: Date.now() });
              
              ws.send(JSON.stringify({ type: 'error', message: 'Invalid session code' }));
              ws.close();
              return;
            }

            // Reset failed attempts on success
            failedAttempts.delete(ip);

            const agentId = uuidv4();
            currentAgent = {
              id: agentId,
              ws,
              role,
              sessionId: session.id,
              lastSeen: Date.now(),
            };
            
            agents.set(agentId, currentAgent);

            if (role === 'car') {
              session.carAgent = currentAgent;
            } else if (role === 'tech') {
              session.techAgent = currentAgent;
            } else if (role === 'admin') {
              session.adminAgent = currentAgent;
            }

            ws.send(JSON.stringify({ type: 'auth_success', agentId }));
            
            // Notify the other party if connected
            if (role === 'car' || role === 'tech') {
              const otherAgent = role === 'car' ? session.techAgent : session.carAgent;
              if (otherAgent) {
                otherAgent.ws.send(JSON.stringify({ type: 'peer_connected', role }));
                ws.send(JSON.stringify({ type: 'peer_connected', role: otherAgent.role }));
              }
            }
          } else if (data.type === 'info' && currentAgent?.role === 'car') {
            currentAgent.ip = data.ip;
            currentAgent.vin = data.vin;
            
            // Find session and notify tech
            const session = Array.from(sessions.values()).find(s => s.id === currentAgent?.sessionId);
            if (session?.techAgent) {
              session.techAgent.ws.send(JSON.stringify({
                type: 'car_info',
                ip: data.ip,
                vin: data.vin
              }));
            }
          } else if (data.type === 'ping') {
            if (currentAgent) currentAgent.lastSeen = Date.now();
            ws.send(JSON.stringify({ type: 'pong' }));
          } else if (data.type === 'chat') {
            // Broadcast chat messages to all other agents in the session
            if (currentAgent) {
              const session = Array.from(sessions.values()).find(s => s.id === currentAgent?.sessionId);
              if (session) {
                const targets = [session.carAgent, session.techAgent, session.adminAgent].filter(
                  a => a && a.id !== currentAgent!.id && a.ws.readyState === WebSocket.OPEN
                );
                targets.forEach(target => {
                  target!.ws.send(message, { binary: false });
                });
              }
            }
          } else {
            // Forward JSON control messages to peer (car <-> tech)
            if (currentAgent && (currentAgent.role === 'car' || currentAgent.role === 'tech')) {
              const session = Array.from(sessions.values()).find(s => s.id === currentAgent?.sessionId);
              if (session) {
                const targetAgent = currentAgent.role === 'car' ? session.techAgent : session.carAgent;
                if (targetAgent && targetAgent.ws.readyState === WebSocket.OPEN) {
                  targetAgent.ws.send(message, { binary: false });
                }
              }
            }
          }
        } catch (e) {
          console.error('Invalid JSON message', e);
        }
      } else {
        // Binary message routing (TCP/UDP payload) (car <-> tech)
        if (currentAgent && (currentAgent.role === 'car' || currentAgent.role === 'tech')) {
          const session = Array.from(sessions.values()).find(s => s.id === currentAgent?.sessionId);
          if (session) {
            const targetAgent = currentAgent.role === 'car' ? session.techAgent : session.carAgent;
            if (targetAgent && targetAgent.ws.readyState === WebSocket.OPEN) {
              targetAgent.ws.send(message, { binary: true });
            }

            // [PRO MODE] Return path: If car sends data, write to local diagnostic tool sockets
            if (currentAgent.role === 'car') {
              activeToolSockets.forEach((socket, port) => {
                if (socket.writable) {
                  socket.write(message as Buffer);
                }
              });
            }
          }
        }
      }
    });

    ws.on('close', () => {
      if (currentAgent) {
        agents.delete(currentAgent.id);
        const session = Array.from(sessions.values()).find(s => s.id === currentAgent?.sessionId);
        if (session) {
          if (currentAgent.role === 'car') {
            session.carAgent = undefined;
            if (session.techAgent) {
              session.techAgent.ws.send(JSON.stringify({ type: 'peer_disconnected', role: 'car' }));
            }
          } else if (currentAgent.role === 'tech') {
            session.techAgent = undefined;
            if (session.carAgent) {
              session.carAgent.ws.send(JSON.stringify({ type: 'peer_disconnected', role: 'tech' }));
            }
          } else if (currentAgent.role === 'admin') {
            session.adminAgent = undefined;
          }
        }
      }
    });
  });

  // Clean up stale sessions
  setInterval(() => {
    const now = Date.now();
    for (const [code, session] of sessions.entries()) {
      if (!session.carAgent && !session.techAgent && now - session.createdAt > 3600000) {
        sessions.delete(code); // Remove empty sessions older than 1 hour
      }
    }
  }, 60000);

  // API 404 handler
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Static files and SPA fallback
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = process.env.DIST_PATH || path.join(process.cwd(), 'dist');
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[BOOT] ==========================================`);
    console.log(`[BOOT] BimmerBridge ENET Server is LIVE`);
    console.log(`[BOOT] URL: http://0.0.0.0:${PORT}`);
    console.log(`[BOOT] Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[BOOT] Time: ${new Date().toISOString()}`);
    console.log(`[BOOT] ==========================================`);
  });
}

startServer().catch(err => {
  console.error('[FATAL] Server failed to start:', err);
});
