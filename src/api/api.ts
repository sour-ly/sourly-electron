import { Log } from "../log/log";
import { endpoint } from "../main/version";
import { Profile } from "../model/Profile";
import Skill, { SkillManager } from "../model/Skill";
import { SourlyFlags } from "../renderer";
import IPC from "../renderer/ReactIPC";
import { Stateful } from "../renderer/util/state";
import { Authentication, LoginState } from "./auth";


namespace APITypes {

  export type APIError = {
    error: string;
    message: string;
  }

  export type LoginResponse = {
    user_id: number;
    accessToken: string;
    refreshToken: string;
  };

  export type RefreshResponse = {
    accessToken: string;
    refreshToken: string;
  }

  export type User = {
    id: number;
    username: string;
    name: string;
    level: number;
    currentExp: number;
    createdAt: string;
  }

  /*
   *type Skill struct {
  ID         int            `json:"id"`
  Name       string         `json:"name"`
  Level      int            `json:"level"`
  CurrentExp int            `json:"currentExp"`
  CreatedAt  time.Time      `json:"created_at"`
  Goals      []dbtypes.Goal `json:"goals"`
 } */

  export type Skill = {
    id: number;
    name: string;
    level: number;
    currentExp: number;
    created_at: string;
    goals: any[];
  }
}

export namespace API {
  const BASE_URL = endpoint;

  const headers = {
    "Content-Type": "application/json"
  }

  export async function get<T>(url: string, header: HeadersInit): Promise<T | APITypes.APIError> {
    return fetch(BASE_URL + url, {
      method: "GET",
      headers: { ...headers, ...header },
      credentials: 'include',
    }).then((res) => res.json()) as Promise<T>;
  }

  export async function post<T>(url: string, body: any, header: HeadersInit = {}): Promise<T | APITypes.APIError> {
    return fetch(BASE_URL + url, {
      method: "POST",
      headers: {
        ...headers,
        ...header
      },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then((res) => res.json()) as Promise<T | APITypes.APIError>;
  }

  export async function login(username: string, password: string): Promise<LoginState> {
    const r = await post<APITypes.LoginResponse>('auth/login', { username, password });
    if ('error' in r) {
      return { null: true, userid: -1, offline: false, username: r.error, accessToken: r.message, refreshToken: '' };
    }
    return { null: false, userid: r.user_id, offline: false, username, accessToken: r.accessToken, refreshToken: r.refreshToken };
  }

  export async function refresh(headers: HeadersInit): Promise<APITypes.RefreshResponse> {
    const r = await get<APITypes.LoginResponse>('auth/refresh', headers);
    if ('error' in r) {
      return { accessToken: r.error, refreshToken: '' };
    }
    return { accessToken: r.accessToken, refreshToken: r.refreshToken };
  }

}



namespace Offline {

  type GetSkillProps = {
    profileobj: Stateful<Profile | undefined>;
    flags: SourlyFlags
  }

  export async function getLoginState(): Promise<LoginState> {
    return new Promise((resolve) => {
      IPC.once('storage-request', (...arg) => {
        const [data] = arg;
        if (!data || Object.keys(data).length === 0) {
          Log.log('storage:request', 1, 'got a bad packet', data);
        } else {
          try {
            const json = data as any;
            resolve(json as LoginState);
          } catch (e) {
            Log.log('storage:request', 1, 'failed to load login state from storage with error %s', e, data);
          }
        }
        resolve({ null: true, username: '', offline: true });
      });
      IPC.sendMessage('storage-request', { key: 'login', value: '' });
    })
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


type GetSkillProps = {
  profileobj: Stateful<Profile | undefined>;
  flags: SourlyFlags
}
namespace Online {


  //protected, need to have a token to access this
  function token() {
    return { accessToken: Authentication.loginState.state().accessToken, refreshToken: Authentication.loginState.state().refreshToken };
  }

  function header() {
    Authentication.authCookies();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token().accessToken}`,
    }
  }


  export async function getProfile(): Promise<APITypes.User> {
    const r = await API.get<APITypes.User>(`protected/user/profile?user_name=${Authentication.loginState.state().username}`, header());
    if ('error' in r) {
      throw new Error(r.message);
    }
    return r;
  }

  export function setProfile({ profileobj, flags }: GetSkillProps, user_obj: APITypes.User) {
    const npfp = new Profile(user_obj.name, user_obj.level, user_obj.currentExp, [], '0.1.0', SourlyFlags.SEEN_WELCOME);
    profileobj.setState(npfp);
  }

  export function refreshToken() {
    return API.refresh(header());
  }

  export async function refreshFirst<T>(callback: () => T): Promise<T | undefined> {
    const r = await Authentication.refresh();
    if (!r) {

      return undefined;
    }
    //handle the refresh token
    return await callback();
  }

  export async function addSkills(name: string) {
    return await API.post(`protected/skill/add`, {
      name
    }, header());
  }

  export async function getSkills() {
    return await API.get<APITypes.Skill[]>(`protected/skill/`, header());
  }

}


export namespace APIMethods {

  export async function getLoginState(): Promise<LoginState> {

    return await Offline.getLoginState();
  }

  export async function getSkillsOffline({ profileobj, flags }: GetSkillProps): Promise<void> {
    const profile = await Offline.getProfile({ profileobj, flags });
    console.log('getSkillsOffline', profile);
    await Offline.getSkills({ profileobj: { state: profile, setState: profileobj.setState }, flags });
  }

  async function saveSkillsOffline(skills: object): Promise<void> {
    IPC.sendMessage('storage-save', { key: 'skill', value: skills });
  }

  async function saveProfileOffline(profile: object): Promise<void> {
    IPC.sendMessage('storage-save', { key: 'profile', value: profile });
  }

  //online stuff
  //

  export async function getSkills({ profileobj, flags }: GetSkillProps): Promise<void> {
    //see if the user is online
    if (Authentication.getOfflineMode()) {
      await getSkillsOffline({ profileobj, flags });
      return;
    } else {
      //get the profile
      //refresh before we do anything
      await Authentication.refresh(false);
      const user = await Online.getProfile();
      Online.setProfile({ profileobj, flags }, user);
      if (!profileobj.state) {
        throw new Error('profile object is still undefined');
      }
      const skills = await Online.getSkills();
      if ('error' in skills) {
        return;
      }
      skills.map(skill => {
        return {
          name: skill.name,
          level: skill.level,
          currentExperience: skill.currentExp,
          goals: []
        }
      }).forEach((o) => {
        if (!profileobj.state) {
          throw new Error('profile object is still undefined');
        }
        profileobj.state.addSkillFromJSON(o);
      });
      //get skills from the server
    }
  }

  export async function saveSkills(skills: any, onlineFlags: 'create' | 'update' = 'create'): Promise<boolean> {
    if (Authentication.getOfflineMode()) {
      await saveSkillsOffline(skills);
      return true;
    } else {
      if (onlineFlags === 'create') {
        //create the skill
        await Online.addSkills(skills.name);
        return true;
      }
    }
    return false;
  }


  export async function saveProfile(profile: object): Promise<void> {
    if (Authentication.getOfflineMode()) {
      await saveProfileOffline(profile);
      return;
    } else {
      const user = await Online.getProfile();
      return;
    }
  }

  export async function refresh() {
    if (Authentication.getOfflineMode()) {
      return;
    }
    return Online.refreshToken();
  }
}


