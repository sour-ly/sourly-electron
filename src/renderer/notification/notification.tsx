import React, { useCallback, useEffect, useRef, useState } from "react";
import './styles/notification.scss';
import PopUp from "../popup/Popup";
import { Stateful } from "../util/state";
import { useWindow } from "../App";
import useSettings from "../util/usesettings";

export interface INotifcation {
  notify: (message: string) => void;
  notification: string | null;
  Element: (props: { notification: string | null }) => JSX.Element;
  clear: () => void;
}


function NotificationElement({ notification = "?", amount = 0, ...props }: { notification: string | null, amount?: number, cancelTimer: () => void, init: boolean, setInit: (value: boolean) => void }) {

  const ctx = useWindow();

  useEffect(() => {
    if (notification) {
      props.setInit(false);
    }
  }, [notification])

  return (
    <div id="notification" className={notification ? 'show' : props.init ? '' : 'hide'} onClick={props.cancelTimer}>
      <div className="notification__top" onClick={() => { }}>
        <span>ALERT {amount >= 1 ? `(${amount} MORE)` : ''}</span>
      </div>
      <div className="notification__content">
        <p>{notification}</p>
      </div>

      {amount >= 2 &&
        <div className="notification__bottom" onClick={ctx.notification.clear}>
          Clear all alerts
        </div>
      }

    </div>
  )
}

type NotificationBannerProps = {
  notification: Stateful<string | null>;
  neverTimeout?: boolean;
  amount?: number;
}

function NotificationBanner({ notification, neverTimeout, amount }: NotificationBannerProps) {

  const [init, setInit] = useState(true);
  const timeout_ref = useRef<any>();
  const [settings, _] = useSettings();

  if (!settings.notification.enabled) {
    return null;
  }

  useEffect(() => {
    if (notification.state) {
      if (neverTimeout) return;
      if (timeout_ref.current) {
        clearTimeout(timeout_ref.current);
      }
      timeout_ref.current = setTimeout(() => {
        notification.setState(null);
      }, settings.notification.duration); // change here to change the duration of the notification
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
    <NotificationElement notification={notification.state} amount={amount} cancelTimer={cancelTimer} init={init} setInit={setInit} />
  )

}

export default NotificationBanner;
