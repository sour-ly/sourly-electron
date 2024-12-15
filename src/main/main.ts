/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 *
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, ipcRenderer, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { openInBrowser, resolveHtmlPath } from './util';
import { SourlyStorage } from '../storage/storage';
import { Log } from '../log/log';
import { version } from './version';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
const PROTOCOL_ID = 'sourly';

// remove so we can register each time as we run the app.
app.removeAsDefaultProtocolClient(PROTOCOL_ID);

// If we are running a non-packaged version of the app && on windows
if (process.argv.length >= 2) {
  app.setAsDefaultProtocolClient(PROTOCOL_ID, process.execPath, [
    '-r',
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'ts-node/register/transpile-only'
    ),
    path.join(__dirname, '..', '..'),
  ]);
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_ID);
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {

  const deeplinkHandler = (deeplink: `sourly://${string}`) => {
    try {
      if (!mainWindow) {
        return;
      }
      if (!deeplink.startsWith('sourly://')) {
        return;
      }
      const stripped = deeplink.replace('sourly://', '');
      if (!stripped) {
        return;
      }
      //sourly://function?param=1&param=2
      const split = stripped.split('?');
      const func = split[0];
      type Params = { [key: string]: string };
      let params: Params = {};
      if (split.length > 1) {
        params = split[1].split('&').reduce((acc: Params, curr) => {
          const [key, value] = curr.split('=');
          acc[key] = value.replace(/%20/g, ' ');;
          return acc;
        }, {});
      }
      mainWindow.webContents.send('deeplink', { func, ...params });
    }
    catch (e) {
      console.error("Error:", e);
    }
  }

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    const uri = commandLine.find((arg) => arg.startsWith('sourly://')) as `sourly://${string}`;
    if (uri) {
      deeplinkHandler(uri);
    }

  })

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    if (process.argv.length > 1) {
      const uri = process.argv.find((arg) => arg.startsWith('sourly://')) as `sourly://${string}`;
      if (uri) {
        deeplinkHandler(uri);
      }
    }
  })

  app.on('open-url', (event, url) => {
    event.preventDefault();
    if (url.startsWith('sourly://'))
      if (url) {
        deeplinkHandler(url as `sourly://${string}`);
      }
  })
}


const storage = SourlyStorage.getInstance();

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', 'pong');
});

/* STORAGE IPC CALLS */
ipcMain.on('storage-request', async (event, arg) => {
  const [data] = arg;
  Log.log('ipcMain:lambda:request', 0, 'Received storage request', data);
  event.reply('storage-request', data.key, storage.getItem(data.key) ?? {});
});

ipcMain.on('storage-save', async (event, arg) => {
  const [data] = arg;
  Log.log('ipcMain:lambda:save', 0, 'Received storage save', data);
  if (data.key === undefined || data.value === undefined) {
    Log.log('ipcMain:lambda:save', 1, 'Invalid storage save request', data);
    event.reply('storage-save', false);
    return;
  }
  storage.setItem(data.key, data.value);
  storage.save();
  event.reply('storage-save', { key: arg.key, value: arg.value });
});

/* ENVIRONMENT IPC CALLS */

ipcMain.on('environment-request', async (event, arg) => {
  Log.log(
    'ipcMain:lambda:environment-request',
    0,
    'Received environment request',
    arg,
  );
  event.reply('environment-response', {
    version,
    mode: process.env.NODE_ENV,
    debug: process.env.DEBUG_PROD === 'true',
    platform: process.platform,
  });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};


const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.webContents.openDevTools()


  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.on('open-link', (event, arg) => {
  openInBrowser(arg[0]);
});
