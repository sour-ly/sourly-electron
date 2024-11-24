import { Profile } from "../model/Profile";
import { profileobj, setProfile } from "../renderer";
import { APIMethods } from "./api";

export namespace Authentication {


  let bLoggedIn = false;
  let bOfflineMode = false;

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
