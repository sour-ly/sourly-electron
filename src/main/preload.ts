// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

export type ChannelsMap = {
  [key in Channels]: unknown[];
}

const map: ChannelsMap = {
  'ipc-example': []
}

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: (typeof map)[Channels]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: (typeof map)[Channels]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: (typeof map)[Channels]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
