export namespace Authentication {


  let bLoggedIn = false;
  let bOfflineMode = false;

  //this is supposed to act as a mock for the actual authentication, this namespace will contain the actual implementation for the authentication but also will handle all
  export async function login(login: string, password: string): Promise<boolean> {
    bLoggedIn = true;
    return true;
  }

  export function offlineMode() {
    bOfflineMode = true;
    //call this function to simulate offline mode
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
