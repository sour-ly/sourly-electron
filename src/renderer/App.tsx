import { MemoryRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.scss';
import React, { useEffect, useRef, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { refresh } from 'electron-debug';
import PopUp, { _popup_types, PopUpWindow } from './popup/Popup';
import { version } from '../main/version';
import NotificationBanner, {
  INotifcation,
  NotificationObject,
} from './notification/notification';
import { Anchor } from './components/anchor';
import { environment, profileobj, SourlyFlags } from '.';
import Home from './views/Home';
import Queue from './util/queue';
import Navigator from './navigation/Navigation';
import Settings from './views/Settings';
import ProfilePage from './views/Profile';
import {
  MessageScreen,
  MSCompatiableScreen,
  MSContext,
} from './messagescreen/MessageScreen';
import { VersionPageContext } from './messagescreen/pages/VersionPage';
import {
  WelcomePageSlideOneContext,
  WelcomePageSlideTwoContext,
} from './messagescreen/pages/WelcomePage';
import { adjustTheme } from './util/darkmode';
import { ProtectedRoute } from './protected/ProtectedRoute';
import { Login } from './views/Login';
import { Authentication } from '../api/auth';
import { APIMethods } from '../api/api';
import { Signup } from './views/Signup';
import UserSearch from './views/UserSearch';
import { ipcRenderer } from 'electron';
import IPC from './ReactIPC';

export type WindowContextType = {
  popUp: WindowPopUp;
  notification: Omit<Omit<INotifcation, 'Element'>, 'notification'>;
  msgScreen: MessageScreenPopUp;
};

export type MessageScreenPopUp = {
  open: (...ctx: MSCompatiableScreen[]) => boolean;
  close: () => boolean;
  state: boolean;
};

export type WindowPopUp = {
  open: (ctx: PopUpWindow<_popup_types>, func_ptr?: any) => boolean; // return true, if successful, return false if failure (like the window is already open)
  close: () => boolean; // force a close, i can't really see why I would need to do this but this could prove to be useful
  state: boolean;
  update: () => void; // sync the current popup with the new context
};

type PopUpStates = {
  open: boolean;
  context: PopUpWindow | null;
};

const WindowContext = React.createContext<WindowContextType | undefined>(
  undefined,
);

// simple hook to use the window context
export const useWindow = () => {
  const ctx = React.useContext(WindowContext);
  if (!ctx) throw new Error('useWindow must be used within a WindowProvider');
  return React.useContext(WindowContext) as WindowContextType;
};

// @BLOCK
// @TITLE App Entry
// @DESC This is the main entry point for the application. This is where the main routing is done and the main context is set up. This is basically the heart of the application
export default function App({ flags }: { flags: number }) {

  /* placeholder for now but -- loading logic */
  const [loading, setLoading] = useState(true);

  /* for the Context Object */
  const [ctx_open, setCtxOpen] = useState(false);
  const [ctx_content, setCtxContent] = useState<PopUpWindow | null>(null);
  /* useless, will remove later */
  const [update, setUpdate] = useState<boolean>(false);
  /* for the Notification Object {gets rerendered too often} */
  const [notification, setNotification] = useState<NotificationObject | null>(
    null,
  );
  /* notification queue */
  const notification_queue = useRef<Queue<NotificationObject>>(
    new Queue<NotificationObject>(),
  ).current;
  /* notification queue amount */
  const [notification_amount, setNotificationAmount] = useState(0);
  /* MessageScreen */
  const [msg_context, setMsgContext] = useState<MSContext | null>(null);
  /* Message Queue */
  const msg_queue = useRef<Queue<MSContext>>(new Queue<MSContext>()).current;

  /* main init function for the application */
  useEffect(() => {

    /* Deeplink listener */
    IPC.on('deeplink', (e) => {
      if (e.func === 'login') {
        if (e.token && e.refresh_token && e.user_id) {
          Authentication.absorbTokens(e.token, e.refresh_token, e.user_id).then(r => {
            if ("error" in r) {
              console.log(r.error);
            } else {
              //just do nothing, let some component listen to us
            }
          });
          //refresh
        } else if (e.error && e.code && e.message) {
          //error
          notify(e.message);
        }
      }
    });

    /* grab the user's login data */
    APIMethods.getLoginState().then(async (login) => {
      if (login.null) {
        // Authentication.logout();
        setLoading(false);
      } else {
        Authentication.loginState.setState({
          state: login,
          callback: (state) => {
            if (state.loginState.null) {
              Authentication.logout();
            }
            setLoading(false);
          },
        });
      }
    });

    /* simply call the adjustTheme function */
    adjustTheme();

    /* notification queue listeners */
    const x = notification_queue.on('update', (q) => {
      setNotificationAmount(q.length);
    });

    // change the title of the document
    window.document.title = `Sourly v${version}`;
    const z = profileobj.on('profilelevelUp', (arg) => {
      notify(`You have leveled up to level ${arg.level}`);
    });
    /* flag checks */
    if ((flags & SourlyFlags.NEW_PROFILE) ^ (flags & SourlyFlags.NO_SKILLS)) {
      const message =
        "Welcome to Sourly! We have detected that you don't have a profile, so we have created one for you! (Don't worry we have adjusted your profile to match your skills!)";
      notify(message);
    } else if (flags & SourlyFlags.NO_SKILLS) {
    } else {
      const message = 'Welcome back to Sourly!';
      notify(message);
    }
    /* check if the user's version in the `storage.json` file is out of date, if so - present the user with the new patch notes and update their value */
    // if flags & SEEN_WELCOME is 0, then show the welcome screen 0bx0xx & 0b0100 = 0b0000
    if ((profileobj.Flags & SourlyFlags.SEEN_WELCOME) === 0) {
      msg_queue.queue({
        flags,
        pages: [WelcomePageSlideOneContext, WelcomePageSlideTwoContext],
        onClose: () => {
          setMsgContext(msg_queue.pop() ?? null);
          profileobj.Flags ^= SourlyFlags.SEEN_WELCOME;
        },
      });
    }
    if (profileobj.Version !== version) {
      msg_queue.queue({
        flags,
        pages: [VersionPageContext],
        onClose: () => {
          setMsgContext(msg_queue.pop() ?? null);
          profileobj.Version = version;
        },
      });
    }
    /* these are enqueued messages */

    /* start the message queue */
    setMsgContext(msg_queue.pop() ?? null);

    return () => {
      if (z) {
        profileobj.off('onUpdates', z);
      }
      if (x) {
        notification_queue.off('update', x);
      }
    };
  }, []);

  /* check if msg_context is null */
  useEffect(() => {
    if (msg_context === null) {
      document.body.style.overflow = 'auto';
      return;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [msg_context]);

  /* check if popUp is open or not for anti-scroll */
  useEffect(() => {
    if (ctx_open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [ctx_open]);

  /* notification queue listener */
  useEffect(() => {
    if (notification === null) {
      // try to pop the notification
      const n = notification_queue.pop();
      if (!n) return;
      const t = setTimeout(() => {
        notify(n);
      }, 250);
      return () => {
        clearTimeout(t);
      };
    }
  }, [notification]);

  // set the context of the popup
  function setPopUpContext(ctx: PopUpStates) {
    setCtxOpen(ctx.open);
    setCtxContent(ctx.context);
  }

  // open a popup
  function openPopUp(ctx: PopUpWindow) {
    setPopUpContext({ open: true, context: { ...ctx, content: ctx.content } });
  }

  /* strictly for notifications */
  function notify(s: string | NotificationObject) {
    // @ts-ignore
    setNotification((o) => {
      // if the notification is not null, and the new notification is also not null, then queue the notification
      if (s !== null && o !== null) {
        if (typeof s === 'string') {
          notification_queue.queue({ message: s, event: 'none' });
        } else {
          notification_queue.queue(s);
        }
        return o;
      }
      if (s === null && o !== null) {
        // if the new notification is null, and the old notification is not null, then check if the queue is empty, if it is, then set the notification to null
        if (notification_queue.length === 0) {
          return null;
        }
        return notification_queue.pop();
      }
      // if the new notification is not null, then set the notification to the new notification

      if (typeof s === 'string') {
        return { message: s, event: 'none' };
      }
      return s;
    });
  }

  function clearNotification() {
    setNotification(null);
    while (notification_queue.pop()) { }
  }

  function openMessageScreen(ctx: MSContext) {
    if (ctx === null) {
      return;
    }
    msg_queue.queue(ctx);
    if (msg_context === null) {
      setMsgContext(msg_queue.pop() ?? null);
    }
  }

  return (
    <GoogleOAuthProvider
      clientId="164867438656-ckgm464nnn23m939ek1h6n8uo0kclqnk.apps.googleusercontent.com"
    >
      <WindowContext.Provider
        value={{
          msgScreen: {
            open: (...ctx: MSCompatiableScreen[]) => {
              openMessageScreen({
                flags,
                pages: [...ctx],
                onClose: () => {
                  setMsgContext(null);
                },
              });
              return true;
            },
            close: () => {
              setMsgContext(null);
              return true;
            },
            state: msg_context !== null,
          },
          notification: {
            notify: (s: string | NotificationObject) => {
              notify(s);
            },
            clear: () => {
              clearNotification();
            },
          },
          popUp: {
            open: (ctx) => {
              openPopUp(ctx);
              return true;
            },
            close: () => {
              setPopUpContext({ open: false, context: null });
              return true;
            },
            state: ctx_open,
            update: () => setUpdate(!update),
          },
        }}
      >
        <div>
          <Router>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                {msg_context && <MessageScreen {...msg_context} />}
                <PopUp open={ctx_open} context={ctx_content} />
                <NotificationBanner
                  notification={{
                    state: notification,
                    setState: setNotification,
                  }}
                  amount={notification_amount}
                />
                <div className="version">
                  {environment.mode === 'development' && 'd.'}v
                  {environment.version}
                </div>
                <Navigator />
                <Routes>
                  <Route path="/search" element={<UserSearch />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <div
                  className="feedback"
                  style={{
                    borderTop: '1px solid var(--divider-color)',
                    paddingTop: '10px',
                    marginTop: '25px',
                  }}
                >
                  Please leave feedback on{' '}
                  <Anchor
                    href="https://forms.gle/TQHj89A2EwuxytaMA"
                    text="Google Forms"
                  />
                </div>
              </>
            )}
          </Router>
        </div>
      </WindowContext.Provider>
    </GoogleOAuthProvider>
  );
}
// @END
