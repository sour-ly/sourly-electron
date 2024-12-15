import { Channels, IPC_map } from '../main/preload';

type arg<T extends Channels> = (typeof IPC_map)[T];

interface IPCHandler {
  on<T extends Channels>(channel: T, listener: (...args: arg<T>) => void): Function;
  once<T extends Channels>(
    channel: T,
    listener: (...args: arg<T>) => void,
  ): void;
  sendMessage<T extends Channels>(channel: T, ...args: arg<T>): void;
}

const IPC: IPCHandler = {
  on: (channel, listener) => {
    if (!window.electron) {
      console.error('electron is not defined');
      return () => { };
    }
    return window.electron.ipcRenderer.on(channel, listener as any);
  },
  once: (channel, listener) => {
    if (!window.electron) {
      console.error('electron is not defined');
      return;
    }
    window.electron.ipcRenderer.once(channel, listener as any);
  },
  sendMessage: (channel, ...args) => {
    if (!window.electron) {
      console.error('electron is not defined');
      return;
    }
    window.electron.ipcRenderer.sendMessage(channel, args);
  },
};

export default IPC;
