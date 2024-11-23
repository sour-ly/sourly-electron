import React, { DetailedHTMLProps, ReactNode, useEffect, useState } from 'react';
import './styles/popup.scss';
import { useWindow } from '../App';


//CHANGE EVERYTHING @TODO

type PopUpProps<T extends _popup_types = 'dialog'> = {
  open: boolean;
  context: PopUpWindow<T> | null
}

export type _popup_types = 'dialog' | 'confirm' | 'input' | 'save';

export type PopUpWindow<T extends _popup_types = 'confirm'> = {
  type: _popup_types;
  content: () => ReactNode;
  title?: string;
  options?: T extends 'confirm' ? Confirm : T extends 'input' ? Input : T extends 'dialog' ? null : Dialog;
}

export type ButtonProps = Omit<DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'onClick'> & { onClick?: () => void };

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


//@WARNING: This is a bad idea, be ready for a big change.
export default function PopUp<T extends _popup_types = 'dialog'>({ open, ...props }: PopUpProps<T>) {

  //wow never use this again
  const [closing, setClosing] = useState<boolean>(false);
  const [last_state, setState] = useState<boolean>(open);

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
            <h2>{props.context?.title ?? "PopUp"}</h2>
            <div className="popup__window__controls__close" onClick={() => { props.context?.options?.onCancel(); }} />
          </div>
          <div className="popup__window__content">
            {props.context?.content()}
            <div className="popup__window__content__options">
              {(props.context?.type === 'confirm' || props.context?.type === 'input') && (
                <>
                  <AccentButton text={"Okay"} onClick={props.context.options?.onOkay} />
                  <Button text={"No"} onClick={props.context.options?.onCancel} />
                </>
              )}
              {props.context?.type === 'save' && (
                <AccentButton text={"Save"} onClick={props.context.options?.onOkay} />
              )}
              {props.context?.type === 'dialog' && (
                <AccentButton text={"Okay"} onClick={props.context.options?.onOkay} />
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
