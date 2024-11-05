import React, { useCallback, useEffect, useRef, useState } from "react";
import './styles/notification.scss';
import PopUp from "../popup/Popup";
import { Stateful } from "../util/state";

export interface INotifcation {
  notify: (message: string) => void;
  notification: string | null;
  Element: (props: { notification: string | null }) => JSX.Element;
}


function NotificationElement({ notification = "?", ...props }: { notification: string | null, cancelTimer: () => void, init: boolean, setInit: (value: boolean) => void }) {
  useEffect(() => {
    if (notification) {
      props.setInit(false);
    }
  }, [notification])
  return (
    <div id="notification" className={notification ? 'show' : props.init ? '' : 'hide'} onClick={props.cancelTimer}>
      <div className="notification__top" onClick={() => { }}>
        <span>ALERT</span>
      </div>
      <div className="notification__content">
        <p>{notification}</p>
      </div>
    </div>
  )
}

type NotificationBannerProps = {
  notification: Stateful<string | null>;
}

function NotificationBanner({ notification }: NotificationBannerProps) {

  const [init, setInit] = useState(true);
  const timeout_ref = useRef<any>();

  useEffect(() => {
    if (notification.state) {
      if (timeout_ref.current) {
        clearTimeout(timeout_ref.current);
      }
      timeout_ref.current = setTimeout(() => {
        notification.setState(null);
      }, 5000);
    }
    return () => {
      if (timeout_ref.current) {
        clearTimeout(timeout_ref.current);
      }
    }
  }, [notification.state])

  function cancelTimer() {
    if (timeout_ref.current) {
      clearTimeout(timeout_ref.current);
    }
    notification.setState(null);
  }

  return (
    <NotificationElement notification={notification.state} cancelTimer={cancelTimer} init={init} setInit={setInit} />
  )

}

export default NotificationBanner;
