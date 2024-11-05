import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import React, { useEffect, useRef, useState } from 'react';
import PopUp, { _popup_types, PopUpWindow } from './popup/Popup';
import { version } from '../main/version';
import NotificationBanner, { INotifcation } from './notification/notification';
import { Anchor } from './components/anchor';
import { environment } from '.';
import Home from './views/Home';
import Queue from './util/queue';

export type WindowContextType = {
  popUp: WindowPopUp;
  notification: Omit<Omit<INotifcation, 'Element'>, 'notification'>;
}

export type WindowPopUp = {
  open: (ctx: PopUpWindow<_popup_types>, func_ptr?: any) => boolean; //return true, if successful, return false if failure (like the window is already open)
  close: () => boolean; //force a close, i can't really see why I would need to do this but this could prove to be useful
  state: boolean;
  update: () => void; //sync the current popup with the new context
}

type PopUpStates = {
  open: boolean,
  context: PopUpWindow | null
}

const WindowContext = React.createContext<WindowContextType | undefined>(undefined);

//simple hook to use the window context
export const useWindow = () => {
  const ctx = React.useContext(WindowContext);
  if (!ctx) throw new Error('useWindow must be used within a WindowProvider');
  return React.useContext(WindowContext) as WindowContextType
};




//@BLOCK
//@TITLE App Entry
//@DESC This is the main entry point for the application. This is where the main routing is done and the main context is set up. This is basically the heart of the application
export default function App() {

  /* for the Context Object */
  const [ctx_open, setCtxOpen] = useState(false);
  const [ctx_content, setCtxContent] = useState<PopUpWindow | null>(null);
  /* useless, will remove later */
  const [update, setUpdate] = useState<boolean>(false);
  /* for the Notification Object {gets rerendered too often}*/
  const [notification, setNotification] = useState<string | null>(null);
  /* notification queue */
  const notification_queue = useRef<Queue<string>>(new Queue<string>()).current;

  useEffect(() => {
    //change the title of the document
    window.document.title = `Sourly v${version}`;

  }, []);

  useEffect(() => {
    if (notification === null) {
      //try to pop the notification
      const n = notification_queue.pop();
      if (!n) return;
      const t = setTimeout(() => {
        notify(n);
      }, 250);
      return () => {
        clearTimeout(t);
      }
    }

  }, [notification]);


  //set the context of the popup
  function setPopUpContext(ctx: PopUpStates) {
    setCtxOpen(ctx.open);
    setCtxContent(ctx.context);
  }

  //open a popup
  function openPopUp(ctx: PopUpWindow) {
    setPopUpContext({ open: true, context: { ...ctx, content: ctx.content } });
  }

  function notify(s: string) {
    //@ts-ignore
    setNotification(o => {
      // if the notification is not null, and the new notification is also not null, then queue the notification
      if (s !== null && o !== null) {
        notification_queue.queue(s);
        return o;
      } else if (s === null && o !== null) { // if the new notification is null, and the old notification is not null, then check if the queue is empty, if it is, then set the notification to null
        if (notification_queue.length === 0) {
          return null;
        }
        return notification_queue.pop();
      }
      // if the new notification is not null, then set the notification to the new notification
      else {
        return s;
      }
    })
  }


  return (
    <WindowContext.Provider value={{ notification: { notify: (s: string) => { notify(s); } }, popUp: { open: (ctx) => { openPopUp(ctx); return true; }, close: () => { setPopUpContext({ open: false, context: null }); return true; }, state: ctx_open, update: () => setUpdate(!update) } }}>
      <div>
        <PopUp open={ctx_open} context={ctx_content} />
        <NotificationBanner notification={{ state: notification, setState: setNotification }} />
        <div className="version">{environment.mode === 'development' && 'd.'}v{environment.version}</div>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
        <div className="feedback" style={{ borderTop: '1px solid black', paddingTop: '10px', marginTop: '25px' }}>
          Please leave feedback on <Anchor href="https://forms.gle/TQHj89A2EwuxytaMA" text={"Google Forms"} />
        </div>
      </div>
    </WindowContext.Provider>
  );
}
//@END
