import { createRoot } from 'react-dom/client';
import App from './App';
import IPC from './ReactIPC';
import { Log } from '../log/log';
import { createWaitFunction } from './util/promise';
import { EnvironmentVariables } from '../main/version';
import { Profile } from '../model/Profile';

export var environment: EnvironmentVariables;
export var profile: Profile;


createWaitFunction(
  new Promise(async (resolve) => {
    await new Promise((resolve) => {
      IPC.once('environment-response', (...arg) => {
        const [data] = arg;
        if (!data || Object.keys(data).length === 0) {
          Log.log('environment:request', 1, 'got a bad packet', data);
          resolve(undefined);
        } else {
          environment = data;
          Log.log('environment:request', 0, 'got environment', data);
        }
        resolve(undefined);
      });
      IPC.sendMessage('environment-request', '');
    });

    if (!environment) {
      Log.log('environment:request', 1, 'failed to get environment... assuming production');
      environment = {
        version: '-0.0.0',
        mode: 'production',
        debug: false,
        platform: process.platform,
      };
    }

    IPC.once('storage-request', (...arg) => {
      const [data] = arg;
      if (!data || Object.keys(data).length === 0) {
        Log.log('storage:request', 1, 'got a bad packet', data);
        resolve(undefined);
      } else if (Array.isArray(data)) {
        if (!profile) profile = new Profile();
        for (const skill of data) {
          profile.addSkillFromJSON(skill);
        }
        Log.log('storage:request', 0, 'loaded skills from storage', data);
      }
      resolve(undefined);
    });
    IPC.sendMessage('storage-request', { key: 'skill', value: '' });
  }), async () => {
    const container = document.getElementById('root') as HTMLElement;
    const root = createRoot(container);
    root.render(<App />)
  })
