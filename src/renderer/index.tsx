import { createRoot } from 'react-dom/client';
import App from './App';
import IPC from './ReactIPC';
import { Log } from '../log/log';
import { createWaitFunction } from './util/promise';
import { EnvironmentVariables } from '../main/version';
import { Profile } from '../model/Profile';

export var environment: EnvironmentVariables;
export var profileobj: Profile;


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

    //load profile
    await new Promise((resolve) => {
      IPC.once('storage-request', (...arg) => {
        //handle profile stuff
        const [data] = arg;
        if (!data || Object.keys(data).length === 0) {
          Log.log('storage:request', 1, 'got a bad packet', data);
        } else {
          try {
            const json = JSON.parse(data as unknown as string);
            profileobj = new Profile((json).level, (json).currentExperience);
            Log.log('storage:request', 0, 'loaded profile from storage', data);
          } catch (e) {
            Log.log('storage:request', 1, 'failed to load profile from storage', data);
          }
        }
        resolve(undefined);
      });
      IPC.sendMessage('storage-request', { key: 'profile', value: '' });
    });

    //load skills
    IPC.once('storage-request', (...arg) => {
      const [data] = arg;
      let new_profile_flag = false;

      if (!profileobj) {
        Log.log('storage:request', 1, 'no profile object to load into, for now we will just create a new one but later we will need to handle this better');
        profileobj = new Profile();
        new_profile_flag = true;
      }

      if (!data || Object.keys(data).length === 0) {
        Log.log('storage:request', 1, 'got a bad packet', data);
        resolve(undefined);
      } else if (Array.isArray(data)) {
        try {
          for (const skill of data) {
            profileobj.addSkillFromJSON(skill);
          }
          Log.log('storage:request', 0, 'loaded skills from storage', data);
        } catch (e) {
          Log.log('storage:request', 1, 'failed to load skills from storage', data);
        }
      }
      if (new_profile_flag) {
        profileobj.adjustProfileToSkills();
      }
      resolve(undefined);
    });
    IPC.sendMessage('storage-request', { key: 'skill', value: '' });
  }), async () => {
    const container = document.getElementById('root') as HTMLElement;
    const root = createRoot(container);
    root.render(<App />)
  })
