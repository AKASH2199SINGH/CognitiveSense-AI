import { app, BrowserWindow, screen } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
let pipWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const url = isDev
    ? 'http://localhost:8081'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(url);
}

function createPipWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  pipWindow = new BrowserWindow({
    width: 320,
    height: 180,
    x: width - 360,
    y: height - 220,

    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  pipWindow.setAlwaysOnTop(true, 'screen-saver');
  pipWindow.setVisibleOnAllWorkspaces(true);

  const pipUrl = isDev
    ? 'http://localhost:8081/?pip=true'
    : `file://${path.join(__dirname, '../dist/index.html')}?pip=true`;

  pipWindow.loadURL(pipUrl);
}

app.whenReady().then(() => {
  createMainWindow();
  createPipWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
