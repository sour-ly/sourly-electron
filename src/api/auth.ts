import { Eventful } from '../event/events';
import { Log } from '../log/log';
import { Profile } from '../model/Profile';
import { profileobj, setProfile } from '../renderer';
import IPC from '../renderer/ReactIPC';
import { ReactlessState, Stateful } from '../renderer/util/state';
import { API, APIMethods, APITypes } from './api';

export type LoginState = {
  null: boolean;
  offline: boolean;
} & OfflineLoginState &
  OnlineLoginState;

type OfflineLoginState = {
  username: string;
};

type OnlineLoginState = {
  userid?: number;
  username: string;
  accessToken?: string;
  refreshToken?: string;
};

export namespace Authentication {
  let bLoggedIn = false;
  let bOfflineMode = false;

  export type StateChangeProps = {
    loginState: LoginState;
  };

  type StateChangeCallback = (state: StateChangeProps) => void;

  type EventMap = {
    logout: undefined;
    loginStateChange: { state: LoginState; callback: StateChangeCallback };
  };

  class AuthEventHooks extends Eventful<EventMap> {
    private loginState: LoginState = {
      null: true,
      offline: false,
      username: '',
    };

    public constructor() {
      super();
      this.on('loginStateChange', (gstate) => {
        const { state, callback } = gstate;
        Log.log('auth:loginStateChange', 0, 'login state changed to ', state);
        // check if its null; if so ignore it
        if (state.null) {
          callback({ loginState: state });
          return;
        }
        if (state.offline) {
          offlineMode(() => {
            callback({ loginState: state });
          }, false);
        } else if (state.accessToken) {
          bLoggedIn = true;
          onlineMode(() => {
            callback({ loginState: state });
          }, false);
        }
        IPC.sendMessage('storage-save', { key: 'login', value: state });
      });
      this.on('logout', () => {
        IPC.sendMessage('storage-save', {
          key: 'login',
          value: { null: true, offline: false, username: '' },
        });
      });
    }

    //@ts-ignore
    public emit<K extends keyof EventMap>(event: K, args: EventMap[K], callback?: () => void) {
      // @ts-ignore
      super.emit(event, args, callback);
    }

    public set LoginState(state: LoginState) {
      this.loginState = state;
      super.emit('loginStateChange', { state, callback: () => { } });
    }

    public LoginStateCallback(
      state: LoginState,
      callback: StateChangeCallback,
    ) {
      this.loginState = state;
      super.emit('loginStateChange', { state, callback });
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
  // expose the on and off functions for event listening
  export const on = authEvents.on.bind(authEvents);
  export const off = authEvents.off.bind(authEvents);
  export const loginState: ReactlessState<
    LoginState,
    { state: LoginState; callback: StateChangeCallback } | LoginState
  > = {
    state: () => authEvents.LoginState,
    setState: async (state: any) => {
      if ('callback' in state) {
        authEvents.LoginStateCallback(state.state, state.callback);
      } else if (typeof state === 'function') {
        const r = state(authEvents.LoginState);
        if ('callback' in r) {
          authEvents.LoginStateCallback(r.state, r.callback);
        } else {
          authEvents.LoginState = r;
        }
      } else {
        authEvents.LoginState = state;
      }
    },
  };

  function setCookie(key: string, value: string, expires: number) {
    const date = new Date();
    date.setTime(date.getTime() + expires);
    document.cookie = `${key}=${value};expires=${date.toUTCString()};path=/`;
  }

  // expose the auth cookies
  export const authCookies = () => {
    console.log(loginState.state());
    document.cookie = '';
    if (loginState.state().accessToken) {
      setCookie('access_token', loginState.state()?.accessToken ?? '', 3600);
    }
    if (loginState.state().refreshToken) {
      console.log(
        'setting refresh token:',
        loginState.state()?.refreshToken ?? '',
      );
      setCookie('refresh_token', loginState.state()?.refreshToken ?? '', 3600);
    }
    if (loginState.state().userid) {
      setCookie('user_id', (loginState.state()?.userid ?? -1).toString(), 3600);
    }

    return '';
  };

  // expose the login state

  // this is supposed to act as a mock for the actual authentication, this namespace will contain the actual implementation for the authentication but also will handle all
  export async function login(
    login: string,
    password: string,
  ): Promise<true | string> {
    const api_resp = await API.queueAndWait(
      async () => await API.login(login, password),
      'auth::login',
    );
    if ('error' in api_resp) {
      return api_resp.error;
    }
    if (
      api_resp.accessToken === '' ||
      api_resp.accessToken === 'no-user-id' ||
      api_resp.accessToken === 'invalid-refresh-token'
    ) {
      return '';
    }

    bLoggedIn = true;
    loginState.setState({
      null: false,
      offline: false,
      userid: api_resp.userid,
      username: login,
      accessToken: api_resp.accessToken,
      refreshToken: api_resp.refreshToken,
    });

    return true;
  }

  export async function onlineMode(
    callback: () => void,
    eventful: boolean = true,
  ) {
    const resp = await refresh(false, 'onlineMode::125');
    if (!resp) {
      // if the refresh token is invalid, logout
      logout();
      callback();
      return;
    }
    bOfflineMode = false;
    await API.queueAndWait(
      async () =>
        await APIMethods.getSkills({
          profileobj: {
            state: profileobj,
            setState: (p) => {
              if (p instanceof Profile) setProfile(p);
            },
          },
          flags: profileobj.Flags,
        }).finally(() => {
          if (profileobj.Name === 'User') return;
          if (eventful)
            loginState.setState({ ...loginState.state(), offline: false });
          else
            authEvents.LoginStateEventless = {
              ...loginState.state(),
              offline: false,
            };
          callback();
        }),
      'getskills::128',
    );
  }

  export function offlineMode(callback: () => void, eventful: boolean = true) {
    bOfflineMode = true;
    // call this function to simulate offline mode
    APIMethods.getSkillsOffline({
      profileobj: {
        state: profileobj,
        setState: (p) => {
          if (p instanceof Profile) setProfile(p);
        },
      },
      flags: profileobj.Flags,
    }).finally(() => {
      if (eventful)
        loginState.setState({
          null: false,
          offline: true,
          username: profileobj.Name,
        });
      else
        authEvents.LoginStateEventless = {
          null: false,
          offline: true,
          username: profileobj.Name,
        };
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

  export async function refresh(
    eventful: boolean = true,
    src?: string,
  ): Promise<boolean> {
    if (bOfflineMode) {
      return true;
    }
    if (
      loginState.state().accessToken === undefined ||
      loginState.state().refreshToken === undefined ||
      !bLoggedIn
    ) {
      return false;
    }
    const tokens = await API.queueAndWait(
      async () => await APIMethods.refresh(),
      'auth::refresh::184',
    );
    if (!tokens) return false;
    if ('error' in tokens) {
      return false;
    }
    if (eventful)
      loginState.setState({
        ...loginState.state(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    else
      authEvents.LoginStateEventless = {
        ...loginState.state(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };

    return bLoggedIn;
  }

  /* SIGN UP */
  export async function signup(
    { username, password, email, name }: { username: string, password: string, email: string, name: string }
  ) {
    const resp = await API.queueAndWait(
      async () => await APIMethods.signup(username, password, email, name),
      'auth::signup::202',
    );
    return resp;
  }

  /* ABSORB deeplinks */
  export async function absorbTokens(
    token: string,
    refresh_token: string,
    user_id: string,
  ) {
    //we need to clear ALL cookies
    document.cookie = '';
    setCookie('access_token', token, 3600);
    setCookie('refresh_token', refresh_token, 3600);
    setCookie('user_id', user_id, 3600);

    const r = await API.queueAndWait(() => API.post<APITypes.RefreshResponse>("auth/login/google/electron", {
      access_token: token,
      refresh_token: refresh_token,
      user_id: user_id
    }))
    if ("error" in r) {
      return r;
    }

    //r is basically a refresh request
    loginState.setState({
      null: false,
      offline: false,
      userid: parseInt(user_id),
      username: '',
      accessToken: r.accessToken,
      refreshToken: r.refreshToken,
    });

    //let the app know we've logged in
    bLoggedIn = true;

    return r

  }

  export function getLoggedIn() {
    return bLoggedIn || bOfflineMode;
  }

  export function getOfflineMode() {
    return bOfflineMode;
  }
}
