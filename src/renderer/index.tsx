import { createRoot } from 'react-dom/client';
import App from './App';
import IPC from './ReactIPC';
import { Log } from '../log/log';
import { SkillManager } from '../model/Skill';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

Promise.resolve(new Promise((resolve) => {
  IPC.once('storage-request', (...arg) => {
    const [data] = arg;
    if (!data || Object.keys(data).length === 0) {
      Log.log('storage:request', 1, 'got a bad packet', data);
      resolve(undefined);
    } else if (Array.isArray(data)) {
      for (const skill of data) {
        SkillManager.getInstance().addSkillFromJSON(skill);
      }
      Log.log('storage:request', 0, 'loaded skills from storage', data);
    }
    resolve(undefined);
  });
  IPC.sendMessage('storage-request', { key: 'skill', value: '' });
})).then(() => {
  root.render(<App />);
});

