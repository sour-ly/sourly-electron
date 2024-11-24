import { Log } from "../log/log";
import { endpoint } from "../main/version";
import { Profile } from "../model/Profile";
import { SourlyFlags } from "../renderer";
import IPC from "../renderer/ReactIPC";
import { Stateful } from "../renderer/util/state";

export namespace API {
  const BASE_URL = endpoint;

  const headers = {
    "Content-Type": "application/json"
  }

  export async function get<T>(url: string): Promise<T> {
    return fetch(BASE_URL + url, {
      method: "GET",
      headers: headers,
    }).then((res) => res.json()) as Promise<T>;
  }

  export async function post<T>(url: string, body: any): Promise<T> {
    return fetch(BASE_URL + url, {
      method: "POST",
      headers: {
        ...headers,
      },
      body: JSON.stringify(body),
    }).then((res) => res.json()) as Promise<T>;
  }

}



namespace Offline {

  type GetSkillProps = {
    profileobj: Stateful<Profile | undefined>;
    flags: SourlyFlags
  }

  export async function getProfile({ profileobj, flags }: GetSkillProps, callback: () => void = () => { }): Promise<Profile> {
    return new Promise((resolve) => {
      IPC.once('storage-request', (...arg) => {
        //handle profile stuff
        const [data] = arg;
        if (!data || Object.keys(data).length === 0) {
          Log.log('storage:request', 1, 'got a bad packet', data);
        } else {
          try {
            const json = data as any;
            const npfp = new Profile(json.name, (json).level, (json).currentExperience, [], json.version ?? '0.0.0', json.flags ?? SourlyFlags.NULL);
            profileobj.setState(npfp);
            Log.log('storage:request', 0, 'loaded profile from storage', data);
            resolve(npfp as Profile);
          } catch (e) {
            Log.log('storage:request', 1, 'failed to load profile from storage with error %s', e, data);
          }
        }
        resolve(profileobj.state as Profile);
      });
      IPC.sendMessage('storage-request', { key: 'profile', value: '' });
    });


  }

  export async function getSkills({ profileobj, flags }: GetSkillProps): Promise<void> {
    return new Promise(async (resolve) => {
      IPC.once('storage-request', (...arg) => {
        const [data] = arg;
        let new_profile_flag = false;

        if (!profileobj.state || !(profileobj.state instanceof Profile)) {
          Log.log('storage:request', 1, 'no profile object to load into, for now we will just create a new one but later we will need to handle this better');
          profileobj.setState(new Profile());
          new_profile_flag = true;
          flags |= SourlyFlags.NEW_PROFILE;
        } else {
          flags |= profileobj.state.Flags;
        }

        if (!profileobj.state || profileobj.state.Flags & SourlyFlags.IGNORE) {
          throw new Error('profile object is still undefined');
        }

        if (!data || Object.keys(data).length === 0) {
          Log.log('storage:request', 1, 'got a bad packet or no skills', data);
          flags |= SourlyFlags.NO_SKILLS;
          resolve(undefined);
        } else if (Array.isArray(data)) {
          try {
            for (const skill of data) {
              profileobj.state.addSkillFromJSON(skill);
            }
            Log.log('storage:request', 0, 'loaded skills from storage', data);
          } catch (e) {
            Log.log('storage:request', 1, 'failed to load skills from storage', data, e);
          }
        }
        if (new_profile_flag) {
          Log.log('storage:request', 0, 'new profile object created, adjusting to skills');
          profileobj.state.adjustProfileToSkills();
        }
        resolve(undefined);
      });
      IPC.sendMessage('storage-request', { key: 'skill', value: '' });
    });
  }
}


export namespace APIMethods {


  type GetSkillProps = {
    profileobj: Stateful<Profile | undefined>;
    flags: SourlyFlags
  }

  export async function getSkillsOffline({ profileobj, flags }: GetSkillProps): Promise<void> {
    const profile = await Offline.getProfile({ profileobj, flags });
    console.log('getSkillsOffline', profile);
    await Offline.getSkills({ profileobj: { state: profile, setState: profileobj.setState }, flags });
  }

}
