import { createRoot } from 'react-dom/client';
import App from './App';
import IPC from './ReactIPC';
import { Log } from '../log/log';
import { createWaitFunction } from './util/promise';
import { EnvironmentVariables } from '../main/version';
import { Profile } from '../model/Profile';
import SettingsObject, { sDefault, Settings } from './settings/settings';
import { APIMethods } from '../api/api';

export var environment: EnvironmentVariables;
export var profileobj: Profile;
export var sourlysettings: Settings;

export function setProfile(p: Profile) {
  profileobj = p;
}

export enum SourlyFlags {
  NULL = 0x00,
  NEW_PROFILE = 0x01,
  NO_SKILLS = 0x02,
  SEEN_WELCOME = 0x04,
  IGNORE = 0x08,
}

let flags = 0;
createWaitFunction(
  new Promise(async (resolve) => {
    /* get environment */
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
    /* end get environment */

    /* get settings */
    await new Promise((resolve) => {
      IPC.once('storage-request', (...arg) => {
        //this will be our settings object
        const [data] = arg;
        if (!data || Object.keys(data).length === 0) {
          Log.log('storage:request [settings]', 1, 'got a bad packet (or no entry exists)', data);
          sourlysettings = new SettingsObject();
        } else {
          try {
            sourlysettings = new SettingsObject(data as unknown as Settings);
            Log.log('storage:request [settings]', 0, 'loaded settings from storage', data);
          } catch (e) {
            Log.log('storage:request [settings]', 1, 'failed to load settings from storage with error %s', e, data);
            sourlysettings = new SettingsObject();;
          }
        }
        resolve(undefined);
      })
      IPC.sendMessage('storage-request', { key: 'settings', value: '' });
    });
    /* end get settings */

    /*
    await new Promise((resolve) => {
      IPC.once('storage-request', (...arg) => {
        //handle profile stuff
        const [data] = arg;
        if (!data || Object.keys(data).length === 0) {
          Log.log('storage:request', 1, 'got a bad packet', data);
        } else {
          try {
            const json = data as any;
            profileobj = new Profile(json.name, (json).level, (json).currentExperience, [], json.version ?? '0.0.0', json.flags ?? SourlyFlags.NULL);
            console.log(profileobj);
            Log.log('storage:request', 0, 'loaded profile from storage', data);
          } catch (e) {
            Log.log('storage:request', 1, 'failed to load profile from storage with error %s', e, data);

          }
        }
        resolve(undefined);
      });
      IPC.sendMessage('storage-request', { key: 'profile', value: '' });
    });

    //load skills
    await APIMethods.getSkillsOffline({
      profileobj: {
        state: profileobj,
        setState: (n) => {
          if (n instanceof Profile) {
            profileobj = n;
          } else {
            Log.log('getSkillsOffline', 1, 'got a bad packet', n);
          }
          return n;
        }
      },
      flags: flags
    });

    */

    //create a dummy profile just until the user logs in
    profileobj = new Profile('Guest', 1, 0, [], environment.version, SourlyFlags.IGNORE);
    resolve(undefined);

  }), async () => {
    const container = document.getElementById('root') as HTMLElement;
    const root = createRoot(container);
    root.render(<App flags={flags} />)
  })
