import { Channels, IPC_map } from "../main/preload";

type arg = typeof IPC_map[Channels];

interface IPCHandler {
  on(channel: Channels, listener: (...args: arg) => void): void;
  once(channel: Channels, listener: (...args: arg) => void): void;
  sendMessage(channel: Channels, ...args: arg): void;
}

var IPC: IPCHandler = {
  on: (channel, listener) => {
    window.electron.ipcRenderer.on(channel, listener);
  },
  once: (channel, listener) => {
    window.electron.ipcRenderer.once(channel, listener);
  },
  sendMessage: (channel, ...args) => {
    window.electron.ipcRenderer.sendMessage(channel, args);
  },
};

export default IPC;
