import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.scss';
import Skill, { SkillManager, SkillProps } from '../model/Skill';
import React, { useEffect, useRef, useState } from 'react';
import { SkillView } from './model/SkillView';
import Goal from '../model/Goal';
import PopUp, { _popup_types, PopUpWindow } from './popup/Popup';
import { useStateUtil } from './util/state';
import { SkillPopupWrapper } from './model/popup/SkillPopup';
import { version } from '../main/version';
import NotificationBanner, { INotifcation } from './notification/notification';
import { Anchor } from './components/anchor';
import { environment } from '.';

export type WindowContextType = {
  popUp: WindowPopUp;
  notification: Omit<Omit<INotifcation, 'Element'>, 'notification'>;
}

export type WindowPopUp = {
  open: (ctx: PopUpWindow<_popup_types>) => boolean; //return true, if successful, return false if failure (like the window is already open)
  close: () => boolean; //force a close, i can't really see why I would need to do this but this could prove to be useful
  state: boolean;
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


function Hello() {

  const [skills, setSkills] = useState<Skill[]>(SkillManager.getInstance().Skills);

  useEffect(() => {
    const i = SkillManager.getInstance().on('onUpdates', (skill) => {
      setSkills(_ => {
        return [...skill.skills];
      })
    });
    return () => {
      SkillManager.getInstance().off('onUpdates', i);
    }
  }, [])

  return (
    <main>
      {skills.length === 0 && <h1>No Skills Yet!</h1>}
      {skills.map((skill) => {
        return (
          <SkillView key={skill.Id} skill={skill} />
        )
      })}
      <SkillPopupWrapper />
    </main>
  );
}

export default function App() {

  const [ctx_popup, setPopUpContext] = React.useState<PopUpStates>({ open: false, context: null });
  const Notification = NotificationBanner();

  useEffect(() => {
    window.document.title = `Sourly v${version}`;
  }, []);


  return (
    <WindowContext.Provider value={{ notification: { notify: (s: string) => { Notification.notify(s); } }, popUp: { open: (ctx) => { setPopUpContext({ open: true, context: ctx }); return true; }, close: () => { setPopUpContext({ open: false, context: null }); return true; }, state: ctx_popup.open } }}>

      <div>
        <PopUp open={ctx_popup.open} context={ctx_popup.context} />
        <Notification.Element notification={Notification.notification} />
        <div className="version">v{environment.version}</div>
        <Router>
          <Routes>
            <Route path="/" element={<Hello />} />
          </Routes>
        </Router>
        <div className="feedback" style={{ borderTop: '1px solid black', paddingTop: '10px', marginTop: '25px' }}>
          Please leave feedback on <Anchor href="https://forms.gle/TQHj89A2EwuxytaMA" text={"Google Forms"} />
        </div>
      </div>
    </WindowContext.Provider>
  );
}
