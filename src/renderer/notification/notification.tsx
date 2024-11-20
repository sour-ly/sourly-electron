import React, { useCallback, useEffect, useRef, useState } from "react";
import './styles/notification.scss';
import PopUp from "../popup/Popup";
import { Stateful } from "../util/state";
import { useWindow } from "../App";
import useSettings from "../util/usesettings";
import JSConfetti from "js-confetti";

export type NotificationObject = {
  message: string,
  event: 'none' | 'confetti' | 'confetti-noise'
}

export interface INotifcation {
  notify: (message: string | NotificationObject) => void;
  notification: NotificationObject | null;
  Element: (props: { notification: string | null }) => JSX.Element;
  clear: () => void;
}


function NotificationElement({ notification, amount = 0, ...props }: { notification?: NotificationObject | null, amount?: number, cancelTimer: () => void, init: boolean, setInit: (value: boolean) => void }) {

  const ctx = useWindow();
  const c_ref = useRef<HTMLCanvasElement>(null);
  const confetti = useRef<JSConfetti>();

  useEffect(() => {
    if (c_ref.current) {
      confetti.current = new JSConfetti({ canvas: c_ref.current });
    }
  }, [c_ref])

  useEffect(() => {
    if (notification) {
      props.setInit(false);
      if (notification.event === 'confetti') {
        confetti.current?.addConfetti({
          confettiRadius: 3,
          confettiNumber: 100,
        });
      } else if (notification.event === 'confetti-noise') {
        confetti.current?.addConfetti();
      }
    }
  }, [notification])

  //<span>ALERT {amount >= 1 ? `(${amount} MORE)` : ''}</span>

  return (
    <div id="notification" className={notification ? 'show' : props.init ? '' : 'hide'} onClick={props.cancelTimer}>
      <div className="notification__content">
        <p>{notification?.message}</p>
      </div>
      {amount >= 1 &&
        <div className="notification__alert" onClick={() => ctx.notification.clear()}>
          <span>{amount}</span>
        </div>
      }
      <canvas ref={c_ref} className="notification__effect">
      </canvas>


    </div>
  )
}

type NotificationBannerProps = {
  notification: Stateful<NotificationObject | null>;
  neverTimeout?: boolean;
  amount?: number;
}

function NotificationBanner({ notification, neverTimeout, amount }: NotificationBannerProps) {

  const [init, setInit] = useState(true);
  const timeout_ref = useRef<any>();
  const [settings, _] = useSettings();

  useEffect(() => {
    console.log('settings [notification]', settings.notification);
  }, [settings])

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

  if (!settings.notification.enabled) {
    return null;
  }


  function cancelTimer() {
    if (timeout_ref.current) {
      clearTimeout(timeout_ref.current);
    }
    notification.setState(null);
  }

  return (
    <NotificationElement notification={notification.state ?? null} amount={amount} cancelTimer={cancelTimer} init={init} setInit={setInit} />
  )

}

export default NotificationBanner;
