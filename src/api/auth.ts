import { Eventful } from "../event/events";
import { Log } from "../log/log";
import { Profile } from "../model/Profile";
import { profileobj, setProfile } from "../renderer";
import IPC from "../renderer/ReactIPC";
import { Stateful } from "../renderer/util/state";
import { APIMethods } from "./api";


export type LoginState = { null: boolean, offline: boolean } & OfflineLoginState & OnlineLoginState;

type OfflineLoginState = {
  username: string;
}

type OnlineLoginState = {
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
  export const loginState: Stateful<LoginState> = {
    state: authEvents.LoginState,
    setState: (state) => {
      if (typeof state === 'function') {
        authEvents.LoginState = state(authEvents.LoginState);
      } else {
        authEvents.LoginState = state;
      }
    }
  }

  //expose the login state

  //this is supposed to act as a mock for the actual authentication, this namespace will contain the actual implementation for the authentication but also will handle all
  export async function login(login: string, password: string): Promise<boolean> {
    bLoggedIn = true;
    return true;
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
    emit('logout', undefined);
  }

  export async function refresh(): Promise<boolean> {
    return bLoggedIn || bOfflineMode;
  }

  export function getLoggedIn() {
    return bLoggedIn || bOfflineMode;
  }

  export function getOfflineMode() {
    return bOfflineMode;
  }

}
