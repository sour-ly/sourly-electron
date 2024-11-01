// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

export type ChannelsMap = {
  [key in Channels]: any[];
}

export const IPC_map = {
  'ipc-example': ['']
}

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: (typeof IPC_map)[Channels][]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: (typeof IPC_map)[Channels]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args as (typeof IPC_map)[Channels]);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: (typeof IPC_map)[Channels]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args as (typeof IPC_map)[Channels]));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
