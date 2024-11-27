import { Eventful } from "../event/events";
import { Log } from "../log/log";
import { Profile } from "../model/Profile";
import { profileobj, setProfile } from "../renderer";
import IPC from "../renderer/ReactIPC";
import { ReactlessState, Stateful } from "../renderer/util/state";
import { API, APIMethods } from "./api";


export type LoginState = { null: boolean, offline: boolean } & OfflineLoginState & OnlineLoginState;

type OfflineLoginState = {
  username: string;
}

type OnlineLoginState = {
  userid?: number;
  username: string;
  accessToken?: string;
  refreshToken?: string;
}

export namespace Authentication {
  let bLoggedIn = false;
  let bOfflineMode = false;

  type EventMap = {
    'logout': undefined;
    'loginStateChange': LoginState;
  }

  class AuthEventHooks extends Eventful<EventMap> {

    private loginState: LoginState = { null: true, offline: false, username: '' };

    public constructor() {
      super();
      this.on('loginStateChange', (state) => {
        Log.log('auth:loginStateChange', 0, 'login state changed to ', state);
        //check if its null; if so ignore it
        if (state.null) {
          return;
        } else if (state.offline) {
          offlineMode(() => { }, false);
        } else if (state.accessToken) {
          bLoggedIn = true;
          onlineMode(() => { }, false);
        }
        IPC.sendMessage('storage-save', { key: 'login', value: state });
      })
      this.on('logout', () => {
        IPC.sendMessage('storage-save', { key: 'login', value: { null: true, offline: false, username: '' } });
      });
    }

    public emit<K extends keyof EventMap>(event: K, args: EventMap[K]) {
      //@ts-ignore
      super.emit(event, args);
    }

    public set LoginState(state: LoginState) {
      this.loginState = state;
      super.emit('loginStateChange', state);
    }

    public set LoginStateEventless(state: LoginState) {
      this.loginState = state;
      console.log(state);
    }

    public get LoginState() {
      return this.loginState;
    }
  }


  const authEvents = new AuthEventHooks();

  const emit = authEvents.emit.bind(authEvents);
  //expose the on and off functions for event listening
  export const on = authEvents.on.bind(authEvents);
  export const off = authEvents.off.bind(authEvents);
  export const loginState: ReactlessState<LoginState> = {
    state: () => authEvents.LoginState,
    setState: (state) => {
      if (typeof state === 'function') {
        authEvents.LoginState = state(authEvents.LoginState);
      } else {
        authEvents.LoginState = state;
      }
    }
  }


  //expose the auth cookies
  export const authCookies = () => {
    document.cookie = `access_token=${loginState.state().accessToken}`;
    document.cookie = `refresh_token=${loginState.state().refreshToken}`;
    document.cookie = `user_id=${loginState.state().userid}`;
    return ''
  }

  //expose the login state

  //this is supposed to act as a mock for the actual authentication, this namespace will contain the actual implementation for the authentication but also will handle all
  export async function login(login: string, password: string): Promise<true | string> {
    const api_resp = await API.queueAndWait(async () => await API.login(login, password), 'auth::login');
    if ('error' in api_resp) {
      return api_resp.error;
    } else if (api_resp.accessToken === "" || api_resp.accessToken === "no-user-id" || api_resp.accessToken === "invalid-refresh-token") {
      return '';
    }
    else {
      bLoggedIn = true;
      loginState.setState({ null: false, offline: false, userid: api_resp.userid, username: login, accessToken: api_resp.accessToken, refreshToken: api_resp.refreshToken });

      return true;
    }
  }

  export async function onlineMode(callback: () => void, eventful: boolean = true) {
    const resp = await refresh(false, 'onlineMode::125');
    if (!resp) {
      logout();
      return;
    }
    bOfflineMode = false;
    await API.queueAndWait(async () =>
      await APIMethods.getSkills({
        profileobj: {
          state: profileobj,
          setState: (p) => {
            if (p instanceof Profile)
              setProfile(p)
          }
        },
        flags: profileobj.Flags,
      }).finally(() => {
        if (profileobj.Name === 'User') return;
        if (eventful)
          loginState.setState({ ...loginState.state(), offline: false });
        else
          authEvents.LoginStateEventless = ({ ...loginState.state(), offline: false });
        callback();
      }), 'getskills::128');
  }

  export function offlineMode(callback: () => void, eventful: boolean = true) {
    bOfflineMode = true;
    //call this function to simulate offline mode
    APIMethods.getSkillsOffline({
      profileobj: {
        state: profileobj,
        setState: (p) => {
          if (p instanceof Profile)
            setProfile(p)
        }
      },
      flags: profileobj.Flags,
    }).finally(() => {
      if (eventful)
        loginState.setState({ null: false, offline: true, username: profileobj.Name });
      else
        authEvents.LoginStateEventless = ({ null: false, offline: true, username: profileobj.Name });
      callback();
    });
  }

  export function logout() {
    bLoggedIn = false;
    bOfflineMode = false;
    setProfile(new Profile());
    loginState.setState({ null: true, offline: false, username: '' });
    emit('logout', undefined);
  }

  export async function refresh(eventful: boolean = true, src: string): Promise<boolean> {
    console.log('refreshing from ', src);
    if (bOfflineMode) {
      return true;
    }
    if (loginState.state().accessToken === undefined || loginState.state().refreshToken === undefined || !bLoggedIn) {
      return false;
    }
    const tokens = await API.queueAndWait(async () => await APIMethods.refresh(), 'auth::refresh::184');
    if (!tokens) return false;
    if ('error' in tokens) {
      return false;
    }
    if (eventful)
      loginState.setState({ ...loginState.state(), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    else
      authEvents.LoginStateEventless = { ...loginState.state(), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };

    return bLoggedIn;
  }

  export function getLoggedIn() {
    return bLoggedIn || bOfflineMode;
  }

  export function getOfflineMode() {
    return bOfflineMode;
  }

}
