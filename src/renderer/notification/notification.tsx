import React, { useCallback, useEffect, useRef, useState } from "react";
import './styles/notification.scss';

export interface INotifcation {
  notify: (message: string) => void;
  notification: string | null;
  Element: (props: { notification: string | null }) => JSX.Element;
}


function NotificationBanner(): INotifcation {

  const [notification, setNotification] = React.useState<string | null>(null);
  const ref = useRef<INotifcation>();
  const [init, setInit] = useState(true);
  const timeout_ref = useRef<any>();

  useEffect(() => {
    if (notification) {
      if (timeout_ref.current) {
        clearTimeout(timeout_ref.current);
      }
      timeout_ref.current = setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
    return () => {
      if (timeout_ref.current) {
        clearTimeout(timeout_ref.current);
      }
    }
  }, [notification])

  const onNotify = useCallback((message: string) => {
    setNotification(message);
  }, [setNotification]);

  function cancelTimer() {
    if (timeout_ref.current) {
      clearTimeout(timeout_ref.current);
    }
    setNotification(null);
  }


  function NotificationElement({ notification = "?" }: { notification: string | null }) {


    useEffect(() => {
      if (notification) {
        setInit(false);
      }
    }, [notification])


    return (
      <div id="notification" className={notification ? "show" : init === true ? "" : "hide"} onClick={cancelTimer}>
        <div className="notification__top" onClick={() => { }}>
          <span>ALERT</span>
        </div>
        <div className="notification__content">
          <p>{notification}</p>
        </div>
      </div>
    )
  }

  ref.current = { notify: onNotify, notification, Element: () => <NotificationElement notification={notification} /> };

  return ref.current;

}

export default NotificationBanner;
