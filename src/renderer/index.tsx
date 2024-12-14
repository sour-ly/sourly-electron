import AppInit from 'sourly-webcore/src'
import { SourlyStorage } from '../storage/storage';
import { ProfileProps } from '../model/Profile';
import { createRoot } from 'react-dom/client';
import SettingsObject, { Settings } from 'sourly-webcore/src/settings/settings';
import IPC from './ReactIPC';
import { Log } from '../log/log';
import { Asset } from 'sourly-webcore/src/interface/iasset';
import Assets from './asset';
import IFlags from 'sourly-webcore/src/interface/iflag';

function getFlags() {
  return SourlyStorage.getInstance().getItem('flags') as number ?? 0;
}
function setFlags(flags: number) {
  SourlyStorage.getInstance().setItem('flags', flags);
  return getFlags();
}

const flags: IFlags = {
  getFlags,
  setFlags,
  //ops
  xor(flag: number) {
    setFlags(getFlags() ^ flag);
    return this;
  },
  or(flag: number) {
    setFlags(getFlags() | flag);
    return this;
  },
  and(flag: number) {
    setFlags(getFlags() & flag);
    return this;
  },
  not() {
    setFlags(~getFlags());
    return this;
  },
}


AppInit(
  {
    getSettings: async () => {
      return await new Promise((resolve) => {
        IPC.once('storage-request', (...arg) => {
          //this will be our settings object
          const [data] = arg;
          if (!data || Object.keys(data).length === 0) {
            Log.log('storage:request [settings]', 1, 'got a bad packet (or no entry exists)', data);
            resolve({} as Settings);
          } else {
            try {
              Log.log('storage:request [settings]', 0, 'loaded settings from storage', data);
              resolve(data as unknown as Settings);
            } catch (e) {
              Log.log('storage:request [settings]', 1, 'failed to load settings from storage with error %s', e, data);
              resolve({} as Settings);
            }
          }
        })
        IPC.sendMessage('storage-request', { key: 'settings', value: '' });
      });
    },
    getProfile: async () => {
      return {} as ProfileProps;
    },
    systems: {
      flags: flags,
      storage: {
        get: async (key: string) => {
          return await new Promise((resolve) => {
            IPC.once('storage-request', (...arg) => {
              const [data] = arg;
              if (!data || Object.keys(data).length === 0) {
                Log.log('storage:request [settings]', 1, 'got a bad packet (or no entry exists)', data);
                resolve(null);
              } else {
                try {
                  Log.log('storage:request [settings]', 0, 'loaded settings from storage', data);
                  resolve(data as any);
                } catch (e) {
                  Log.log('storage:request [settings]', 1, 'failed to load settings from storage with error %s', e, data);
                  resolve(null);
                }
              }
            })
            IPC.sendMessage('storage-request', { key: key, value: '' });
          });
        },
        save: async (key, val) => {
          return await new Promise((resolve) => {
            IPC.once('storage-save', (...arg) => {
              resolve();
            })
            IPC.sendMessage('storage-save', { key: key, value: val });
          });
        },
      },
      asset: {
        getAsset: (asset: Asset) => {
          return Assets[asset];
        }
      },
      api: {
        //check env for dev or prod
        'endpoint': process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://api.sourly.com',
      }
    },
  }).then((App) => {
    const container = document.getElementById('root') as HTMLElement;
    const root = createRoot(container);
    root.render(<App />);
  });

