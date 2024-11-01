import React, { useEffect, useState } from 'react';
import './styles/popup.scss';
import { useWindow } from '../App';

type PopUpProps<T extends _popup_types = 'dialog'> = {
  open: boolean;
  context: PopUpWindow<T> | null
}

export type _popup_types = 'dialog' | 'confirm' | 'input';

export type PopUpWindow<T extends _popup_types = 'confirm'> = {
  type: _popup_types;
  content: JSX.Element;
  options?: T extends 'confirm' ? Confirm : T extends 'input' ? Input : Dialog;
}

type Generic = {
  onOkay: () => void;
  onCancel: () => void;
}

type Dialog = {
} & Generic

type Confirm = {
  onOkay: () => void;
  onCancel: () => void;
} | Generic

type Input = {

} & Generic


export default function PopUp<T extends _popup_types = 'dialog'>({ open, ...props }: PopUpProps<T>) {

  //wow never use this again
  const [content, setContent] = useState<JSX.Element>((<></>));
  const [closing, setClosing] = useState<boolean>(false);
  const [last_state, setState] = useState<boolean>(open);
  const ctx = useWindow();

  useEffect(() => {
    if (props.context) {
      setContent(props.context.content);
    }
  }, [props.context])

  useEffect(() => {
    if (!open && last_state) {
      setClosing(true);
    }
    setState(open);

    //@TODO Check this later
    return () => {
      setClosing(false);
    }
  }, [open, last_state]);



  //only should be called from Window.tsx
  return (
    <div id="popup" className={`popup ${(open && !closing) ? 'popup__open' : closing ? 'popup__closing' : 'popup__closed'} `} onAnimationEnd={() => { setClosing(false) }}>
      <div className="popup__window__wrapper">
        <div className="popup__window">
          <div className="popup__window__controls">
          </div>
          <div className="popup__window__content">
            {content && React.isValidElement(content) && React.cloneElement(content, { key: 'popup' })}
            <div className="popup__window__content__options">
              {(props.context?.type === 'confirm' || props.context?.type === 'input') && (
                <>
                  <AccentButton text={"Okay"} onClick={props.context.options?.onOkay} />
                  <Button text={"Cancel"} onClick={props.context.options?.onCancel} />
                </>
              )}
            </div>
          </div>

        </div>

      </div>
      <div className="popup__backdrop"></div>
    </div>
  )
}

function AccentButton({ text, onClick }: { text: string, onClick?: () => void }) {
  return (
    <div className="popup__button popup__button__major" onClick={onClick}><p>{text}</p></div>
  )
}

function Button({ text, onClick }: { text: string, onClick?: () => void }) {
  return (
    <div className="popup__button" onClick={onClick}><p>{text}</p></div>
  )
}
