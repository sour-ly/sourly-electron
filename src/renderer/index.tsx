import { createRoot } from 'react-dom/client';
import App from './App';
import IPC from './ReactIPC';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);



//TODO: dispose of this and create a better ipcRenderer System

// calling IPC exposed from preload script
IPC.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
IPC.sendMessage('ipc-example', 'ping');
