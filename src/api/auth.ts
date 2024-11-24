import { Eventful } from "../event/events";
import { Profile } from "../model/Profile";
import { profileobj, setProfile } from "../renderer";
import { APIMethods } from "./api";

export namespace Authentication {


  let bLoggedIn = false;
  let bOfflineMode = false;

  type EventMap = {
    'logout': (args: [undefined]) => void;
  }

  class AuthEventHooks extends Eventful<EventMap> {

    public constructor() {
      super();
    }

    public emitExternal<K extends keyof EventMap>(event: K, ...args: Parameters<EventMap[K]>) {
      //@ts-ignore
      super.emit(event, ...args);
    }
  }

  const authEvents = new AuthEventHooks();

  const emit = authEvents.emitExternal.bind(authEvents);
  export const on = authEvents.on.bind(authEvents);
  export const off = authEvents.off.bind(authEvents);

  //this is supposed to act as a mock for the actual authentication, this namespace will contain the actual implementation for the authentication but also will handle all
  export async function login(login: string, password: string): Promise<boolean> {
    bLoggedIn = true;
    return true;
  }

  export function offlineMode(callback: () => void) {
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
    }).finally(callback);
  }

  export function logout() {
    bLoggedIn = false;
    bOfflineMode = false;
    emit('logout', [undefined]);
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
