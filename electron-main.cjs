const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let serverProcess = null;

// Start the Express server in production
if (app.isPackaged || process.env.NODE_ENV !== 'development') {
  const appPath = app.getAppPath();
  const distPath = path.join(appPath, 'dist');
  process.env.DIST_PATH = distPath;
  process.env.NODE_ENV = 'production';

  try {
    const serverPath = path.join(appPath, 'dist', 'server.cjs');
    // Use fork to run server in a separate process
    // Ensure we use the absolute path and handle ASAR correctly
    const execPath = process.execPath;
    serverProcess = fork(serverPath, [], {
      env: { 
        ...process.env, 
        DIST_PATH: distPath,
        NODE_ENV: 'production',
        ELECTRON_RUN_AS_NODE: '1'
      },
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });
    
    serverProcess.on('error', (err) => {
      console.error('Server process error:', err);
    });
  } catch (err) {
    console.error('Failed to fork server:', err);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    title: "BimmerBridge ENET",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      webSecurity: false // Allow file:// to access http://localhost:3000
    },
    backgroundColor: '#0a0a0a',
  });

  // In production, load the file directly
  if (app.isPackaged || process.env.NODE_ENV !== 'development') {
    const indexPath = path.join(app.getAppPath(), 'dist/index.html');
    win.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
    });
  } else {
    // In development, load from the dev server
    win.loadURL('http://127.0.0.1:3000');
  }
  
  // Remove menu bar
  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
