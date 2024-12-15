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



const x = new Promise(async (resolve) => {

  let flag = 0;
  await new Promise((resolve) => {
    IPC.once('storage-request', async (...arg) => {
      //this will be our settings object
      const [data] = arg;
      const f = data as unknown as number;
      if (!f || isNaN(f)) {
        Log.log('storage:request [flags]', 1, 'got a bad packet (or no entry exists)', f);
      } else {
        try {
          Log.log('storage:request [flags]', 0, 'loaded flags from storage', f);
          flag = f;
          console.log('flag', flag);
          resolve(undefined);
        } catch (e) {
          Log.log('storage:request [flags]', 1, 'failed to load flags from storage with error %s', e, f);
        }
      }
      resolve(undefined);
    })
    IPC.sendMessage('storage-request', { key: 'flags', value: '' });
  });



  function getFlags() {
    return flag;
  }
  function setFlags(flags: number) {
    flag = flags;

    //IPC.sendMessage('storage-save', { key: 'flags', value: flags });

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
              const x = IPC.on('storage-request', (...arg) => {
                const [_key, data] = arg;
                const k = _key as unknown as string;
                if (key !== k) return;
                if (!data || Object.keys(data).length === 0) {
                  Log.log('storage:request [storage]', 1, 'got a bad packet (or no entry exists)', data);
                  resolve(null);
                  x();
                } else {
                  try {
                    Log.log('storage:request [storage]', 0, 'loaded %s from storage', key, data);
                    resolve(data as any);
                    x();
                  } catch (e) {
                    Log.log('storage:request [storage]', 1, 'failed to load %s from storage with error %s', key, e, data);
                    resolve(null);
                    x();
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
      resolve(undefined);
    });
});

Promise.all([x]).then(() => {
});
