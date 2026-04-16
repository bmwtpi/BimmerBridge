import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

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
  createdAt: number;
}

const sessions = new Map<string, Session>();
const agents = new Map<string, Agent>();

// Rate limiting for code attempts
const failedAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Admin token (in production this should be more robust)
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
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Auth Middleware
  const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers['authorization'];
    if (token === currentAdminToken) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // Login Route
  app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ token: currentAdminToken });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  });

  // API Routes
  app.post('/api/sessions', (req, res) => {
    const sessionId = uuidv4();
    const code = generateCode();
    sessions.set(code, {
      id: sessionId,
      code,
      createdAt: Date.now(),
    });
    res.json({ sessionId, code });
  });

  // GET sessions is now open to all authenticated users (or anyone if user wants)
  // But we'll keep it simple: allow if they have ANY token or are just logged in
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
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

  // WebSocket Logic
  wss.on('connection', (ws) => {
    let currentAgent: Agent | null = null;

    ws.on('message', (message, isBinary) => {
      if (!isBinary) {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'auth') {
            const { role, code } = data;
            const ip = (ws as any)._socket.remoteAddress;

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
