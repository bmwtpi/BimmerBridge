export const carAgentCode = `
const net = require('net');
const dgram = require('dgram');
const WebSocket = require('ws');
const os = require('os');

// Configuration
const SERVER_URL = process.argv[2] || 'ws://localhost:3000/bridge';
const SESSION_CODE = process.argv[3];

if (!SESSION_CODE) {
  console.error('Usage: node car.js <SERVER_URL> <SESSION_CODE>');
  process.exit(1);
}

console.log(\`Connecting to \${SERVER_URL} with code \${SESSION_CODE}...\`);

const ws = new WebSocket(SERVER_URL);

let vehicleIp = null;
let tcpClient = null;

// Find local IP
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('169.254.')) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback
}

ws.on('open', () => {
  console.log('Connected to Bridge Server.');
  ws.send(JSON.stringify({ type: 'auth', role: 'car', code: SESSION_CODE }));
});

ws.on('message', (data, isBinary) => {
  if (!isBinary) {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'auth_success') {
      console.log('Authenticated successfully. Waiting for tech...');
      // Broadcast ZGW discovery locally to find the car
      const udpClient = dgram.createSocket('udp4');
      udpClient.bind(() => {
        udpClient.setBroadcast(true);
        const zgwRequest = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x11]); // Simple ZGW request
        udpClient.send(zgwRequest, 0, zgwRequest.length, 6811, '255.255.255.255', (err) => {
          if (err) console.error('UDP Broadcast error:', err);
        });
      });

      udpClient.on('message', (msg, rinfo) => {
        console.log(\`Discovered vehicle at \${rinfo.address}\`);
        vehicleIp = rinfo.address;
        
        // Extract VIN from ZGW response (usually 17 chars long)
        let vin = 'Unknown';
        const msgStr = msg.toString('ascii');
        const vinMatch = msgStr.match(/[A-HJ-NPR-Z0-9]{17}/);
        if (vinMatch) {
            vin = vinMatch[0];
            console.log(\`Extracted VIN: \${vin}\`);
        }
        
        ws.send(JSON.stringify({ type: 'info', ip: vehicleIp, vin: vin }));
        udpClient.close();
      });
      
      // Fallback if UDP fails
      setTimeout(() => {
        if (!vehicleIp) {
          vehicleIp = getLocalIp();
          console.log('Could not discover via UDP, using local interface IP:', vehicleIp);
          ws.send(JSON.stringify({ type: 'info', ip: vehicleIp, vin: 'Unknown' }));
        }
      }, 3000);

    } else if (msg.type === 'peer_connected') {
      console.log('Tech connected!');
    } else if (msg.type === 'peer_disconnected') {
      console.log('Tech disconnected.');
      if (tcpClient) {
        tcpClient.destroy();
        tcpClient = null;
      }
    } else if (msg.type === 'tcp_connect') {
      console.log('Tech requested TCP connection to car...');
      if (tcpClient) tcpClient.destroy();
      
      tcpClient = new net.Socket();
      tcpClient.connect(6801, vehicleIp, () => {
        console.log('Connected to Car TCP 6801');
        ws.send(JSON.stringify({ type: 'tcp_connected' }));
      });
      
      tcpClient.on('data', (data) => {
        // Prepend 0x00 for TCP data
        const payload = Buffer.concat([Buffer.from([0x00]), data]);
        ws.send(payload, { binary: true });
      });
      
      tcpClient.on('close', () => {
        console.log('Car TCP connection closed');
        ws.send(JSON.stringify({ type: 'tcp_closed' }));
      });
      
      tcpClient.on('error', (err) => {
        console.error('Car TCP error:', err);
      });
    } else if (msg.type === 'tcp_disconnect') {
      if (tcpClient) {
        tcpClient.destroy();
        tcpClient = null;
      }
    }
  } else {
    // Binary data
    const type = data[0];
    const payload = data.slice(1);
    
    if (type === 0x00) {
      // TCP Data
      if (tcpClient && !tcpClient.destroyed) {
        tcpClient.write(payload);
      }
    } else if (type === 0x01) {
      // UDP Data (ZGW)
      const udpClient = dgram.createSocket('udp4');
      udpClient.bind(() => {
        udpClient.setBroadcast(true);
        udpClient.send(payload, 0, payload.length, 6811, '255.255.255.255');
      });
      
      udpClient.on('message', (msg, rinfo) => {
        // Send UDP response back
        const respPayload = Buffer.concat([Buffer.from([0x01]), msg]);
        ws.send(respPayload, { binary: true });
        udpClient.close();
      });
      
      setTimeout(() => udpClient.close(), 2000);
    }
  }
});

ws.on('close', () => {
  console.log('Disconnected from server');
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});

// Keepalive
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 15000);
`;

export const techAgentCode = `
const net = require('net');
const dgram = require('dgram');
const WebSocket = require('ws');

// Configuration
const SERVER_URL = process.argv[2] || 'ws://localhost:3000/bridge';
const SESSION_CODE = process.argv[3];

if (!SESSION_CODE) {
  console.error('Usage: node tech.js <SERVER_URL> <SESSION_CODE>');
  process.exit(1);
}

console.log(\`Connecting to \${SERVER_URL} with code \${SESSION_CODE}...\`);

const ws = new WebSocket(SERVER_URL);

let tcpServer = null;
let activeTcpSocket = null;
let udpServer = null;

ws.on('open', () => {
  console.log('Connected to Bridge Server.');
  ws.send(JSON.stringify({ type: 'auth', role: 'tech', code: SESSION_CODE }));
});

ws.on('message', (data, isBinary) => {
  if (!isBinary) {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'auth_success') {
      console.log('Authenticated successfully. Waiting for car...');
      startLocalServers();
    } else if (msg.type === 'peer_connected') {
      console.log('Car connected!');
    } else if (msg.type === 'peer_disconnected') {
      console.log('Car disconnected.');
      if (activeTcpSocket) activeTcpSocket.destroy();
    } else if (msg.type === 'car_info') {
      console.log(\`\\n>>> CAR DETECTED <<<\`);
      console.log(\`>>> Real Vehicle IP: \${msg.ip}\`);
      console.log(\`>>> E-Sys will connect to localhost (127.0.0.1) and we will forward it.\\n\`);
    } else if (msg.type === 'tcp_closed') {
      if (activeTcpSocket) activeTcpSocket.destroy();
    }
  } else {
    // Binary data
    const type = data[0];
    const payload = data.slice(1);
    
    if (type === 0x00) {
      // TCP Data from Car
      if (activeTcpSocket && !activeTcpSocket.destroyed) {
        activeTcpSocket.write(payload);
      }
    } else if (type === 0x01) {
      // UDP Data from Car (ZGW Response)
      if (udpServer) {
        // Magic Trick: Rewrite the IP in the ZGW response to 127.0.0.1 so E-Sys connects to localhost
        // ZGW response format varies, but usually we can just forward it and E-Sys might still try to connect to the IP in the payload.
        // For a true proxy without TAP adapter, the user might need to use "Connection via localhost" in E-Sys if supported,
        // or we just forward the UDP and let E-Sys connect to localhost if it's configured to do so.
        // We will forward it to localhost:6811 so E-Sys sees it.
        udpServer.send(payload, 0, payload.length, 6811, '127.0.0.1');
      }
    }
  }
});

function startLocalServers() {
  // Start TCP Server on 6801
  tcpServer = net.createServer((socket) => {
    console.log('E-Sys connected locally on TCP 6801');
    activeTcpSocket = socket;
    
    ws.send(JSON.stringify({ type: 'tcp_connect' }));
    
    socket.on('data', (data) => {
      const payload = Buffer.concat([Buffer.from([0x00]), data]);
      ws.send(payload, { binary: true });
    });
    
    socket.on('close', () => {
      console.log('E-Sys disconnected');
      activeTcpSocket = null;
      ws.send(JSON.stringify({ type: 'tcp_disconnect' }));
    });
    
    socket.on('error', (err) => {
      console.error('Local TCP error:', err);
    });
  });
  
  tcpServer.listen(6801, '127.0.0.1', () => {
    console.log('Listening for E-Sys TCP on 127.0.0.1:6801');
  });

  // Start UDP Server on 6811
  udpServer = dgram.createSocket('udp4');
  udpServer.on('message', (msg, rinfo) => {
    // Forward ZGW request to Car
    const payload = Buffer.concat([Buffer.from([0x01]), msg]);
    ws.send(payload, { binary: true });
  });
  
  udpServer.bind(6811, () => {
    console.log('Listening for E-Sys UDP Broadcasts on port 6811');
  });
}

ws.on('close', () => {
  console.log('Disconnected from server');
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});

// Keepalive
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 15000);
`;
